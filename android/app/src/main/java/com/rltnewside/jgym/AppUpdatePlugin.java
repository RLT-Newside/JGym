// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
package com.rltnewside.jgym;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.regex.Pattern;

@CapacitorPlugin(name = "AppUpdate")
public class AppUpdatePlugin extends Plugin {

    // Only release assets of this repository may be downloaded and installed.
    private static final Pattern ALLOWED_URL =
        Pattern.compile("^https://github\\.com/RLT-Newside/JGym/releases/download/[^/?#]+/[^/?#]+\\.apk$");
    private static final Pattern SHA256_HEX = Pattern.compile("^[0-9a-f]{64}$");
    private static final String APK_NAME = "jgym-update.apk";
    private static final long PROGRESS_INTERVAL_MS = 200;

    private volatile boolean downloading = false;

    @PluginMethod
    public void canInstall(PluginCall call) {
        JSObject result = new JSObject();
        result.put("allowed", canRequestInstalls());
        call.resolve(result);
    }

    @PluginMethod
    public void openInstallSettings(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }

    // Downloads the APK into the app cache, verifies its SHA-256 and hands it
    // to the system installer. Emits "downloadProgress" events while running.
    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String url = call.getString("url");
        String sha256 = call.getString("sha256");
        if (url == null || !ALLOWED_URL.matcher(url).matches()) {
            call.reject("URL not allowed", "BAD_URL");
            return;
        }
        if (sha256 == null || !SHA256_HEX.matcher(sha256.toLowerCase(Locale.ROOT)).matches()) {
            call.reject("Missing or invalid SHA-256", "BAD_DIGEST");
            return;
        }
        if (downloading) {
            call.reject("Download already running", "BUSY");
            return;
        }
        downloading = true;
        final String expected = sha256.toLowerCase(Locale.ROOT);

        new Thread(() -> {
            try {
                File apk = download(url, expected);
                launchInstaller(apk);
                call.resolve();
            } catch (Exception e) {
                call.reject(e.getMessage() != null ? e.getMessage() : "Download failed", "FAILED");
            } finally {
                downloading = false;
            }
        }, "jgym-app-update").start();
    }

    private boolean canRequestInstalls() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return true;
        return getContext().getPackageManager().canRequestPackageInstalls();
    }

    private File download(String url, String expectedSha256) throws Exception {
        File dir = new File(getContext().getCacheDir(), "updates");
        if (!dir.exists() && !dir.mkdirs()) throw new Exception("Cannot create cache dir");
        File apk = new File(dir, APK_NAME);
        if (apk.exists() && !apk.delete()) throw new Exception("Cannot clear old download");

        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setInstanceFollowRedirects(true);
        conn.setConnectTimeout(15000);
        conn.setReadTimeout(30000);
        try {
            int code = conn.getResponseCode();
            if (code != HttpURLConnection.HTTP_OK) throw new Exception("HTTP " + code);
            if (!"https".equals(conn.getURL().getProtocol())) throw new Exception("Insecure redirect");

            long total = conn.getContentLengthLong();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            long received = 0;
            long lastEmit = 0;
            try (InputStream in = conn.getInputStream(); OutputStream out = new FileOutputStream(apk)) {
                byte[] buf = new byte[64 * 1024];
                int n;
                while ((n = in.read(buf)) != -1) {
                    out.write(buf, 0, n);
                    digest.update(buf, 0, n);
                    received += n;
                    long now = System.currentTimeMillis();
                    if (now - lastEmit >= PROGRESS_INTERVAL_MS) {
                        lastEmit = now;
                        emitProgress(received, total);
                    }
                }
            }
            emitProgress(received, total);

            if (!expectedSha256.equals(toHex(digest.digest()))) {
                apk.delete();
                throw new Exception("Checksum mismatch");
            }
            return apk;
        } finally {
            conn.disconnect();
        }
    }

    private void emitProgress(long received, long total) {
        JSObject data = new JSObject();
        data.put("received", received);
        data.put("total", total);
        notifyListeners("downloadProgress", data);
    }

    private void launchInstaller(File apk) {
        Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", apk);
        Intent intent = new Intent(Intent.ACTION_INSTALL_PACKAGE);
        intent.setDataAndType(uri, "application/vnd.android.package-archive");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
    }

    private static String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) sb.append(String.format(Locale.ROOT, "%02x", b));
        return sb.toString();
    }
}
