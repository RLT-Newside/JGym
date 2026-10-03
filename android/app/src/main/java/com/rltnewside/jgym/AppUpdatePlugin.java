// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
package com.rltnewside.jgym;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;

import androidx.core.content.FileProvider;
import androidx.core.content.pm.PackageInfoCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

// Downloads a JGym release APK into the app cache, verifies it (see ApkDownloader)
// and hands it to Android's package installer, where the user confirms "Update".
@CapacitorPlugin(name = "AppUpdate")
public class AppUpdatePlugin extends Plugin {

    private static final String APK_MIME = "application/vnd.android.package-archive";

    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final AtomicBoolean downloading = new AtomicBoolean(false);
    private volatile File verifiedApk = null;

    // Main thread only.
    private boolean resumed = false;
    private boolean installPending = false;

    @Override
    public void load() {
        executor.execute(this::deleteStaleDownloads);
    }

    @PluginMethod
    public void canInstall(PluginCall call) {
        boolean allowed = Build.VERSION.SDK_INT < Build.VERSION_CODES.O
            || getContext().getPackageManager().canRequestPackageInstalls();
        JSObject result = new JSObject();
        result.put("allowed", allowed);
        call.resolve(result);
    }

    @PluginMethod
    public void download(PluginCall call) {
        String url = call.getString("url");
        String fileName = call.getString("fileName");
        String sha256 = call.getString("sha256");
        if (!ApkDownloader.isAllowedUrl(url)) {
            call.reject("Not a JGym release asset: " + url, "INVALID_URL");
            return;
        }
        if (!ApkDownloader.isSafeFileName(fileName)) {
            call.reject("Invalid file name: " + fileName, "INVALID_FILE_NAME");
            return;
        }
        if (!downloading.compareAndSet(false, true)) {
            call.reject("A download is already running", "BUSY");
            return;
        }

        executor.execute(() -> {
            try {
                File dir = updateDir();
                if (!dir.isDirectory() && !dir.mkdirs()) throw new IOException("Cannot create " + dir);
                File apk = new File(dir, fileName);
                // Reuse an earlier download, e.g. after the user cancelled the installer.
                if (sha256 == null || !ApkDownloader.matches(apk, sha256)) {
                    fetch(url, apk, sha256);
                }
                verifiedApk = apk;
                call.resolve();
            } catch (ApkDownloader.ChecksumMismatchException e) {
                call.reject(e.getMessage(), "CHECKSUM", e);
            } catch (Exception e) {
                call.reject("Download failed: " + e.getMessage(), "DOWNLOAD", e);
            } finally {
                downloading.set(false);
            }
        });
    }

    @PluginMethod
    public void install(PluginCall call) {
        File apk = verifiedApk;
        if (apk == null || !apk.isFile()) {
            call.reject("No verified update downloaded", "NOT_DOWNLOADED");
            return;
        }
        getBridge().executeOnMainThread(() -> {
            try {
                if (resumed) {
                    launchInstaller(apk);
                } else {
                    // Android blocks activity starts from the background — open it on return.
                    installPending = true;
                }
                call.resolve();
            } catch (Exception e) {
                call.reject("Could not open the installer", "INSTALLER", e);
            }
        });
    }

    @Override
    protected void handleOnResume() {
        resumed = true;
        if (!installPending) return;
        installPending = false;
        File apk = verifiedApk;
        if (apk == null || !apk.isFile()) return;
        try {
            launchInstaller(apk);
        } catch (Exception e) {
            // The update dialog still offers "Open installer again".
        }
    }

    @Override
    protected void handleOnPause() {
        resumed = false;
    }

    @Override
    protected void handleOnDestroy() {
        executor.shutdown();
    }

    private void fetch(String url, File apk, String sha256) throws IOException {
        // Follows GitHub's redirect to its release-asset CDN (https → https).
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setConnectTimeout(15_000);
        conn.setReadTimeout(30_000);
        try {
            int status = conn.getResponseCode();
            if (status != HttpURLConnection.HTTP_OK) throw new IOException("HTTP " + status);
            try (InputStream in = conn.getInputStream()) {
                ApkDownloader.save(in, conn.getContentLengthLong(), apk, sha256, this::emitProgress);
            }
        } finally {
            conn.disconnect();
        }
    }

    private void emitProgress(long bytes, long total) {
        JSObject progress = new JSObject();
        progress.put("bytes", bytes);
        progress.put("total", total);
        notifyListeners("progress", progress);
    }

    // ACTION_INSTALL_PACKAGE is deprecated in favour of PackageInstaller sessions, but only
    // the system installer handles it (ACTION_VIEW can trigger an "open with" chooser) and it
    // runs the full system flow: one-time unknown-sources prompt, "Update", then "Open".
    @SuppressWarnings("deprecation")
    private void launchInstaller(File apk) {
        Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", apk);
        Intent intent = new Intent(Intent.ACTION_INSTALL_PACKAGE)
            .setDataAndType(uri, APK_MIME)
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
    }

    private File updateDir() {
        return new File(getContext().getCacheDir(), "updates");
    }

    // Android kills JGym when the user allows installs from it, so a downloaded update that
    // isn't installed yet is kept for the next "Update" tap instead of being fetched again.
    // Installed or older APKs and interrupted downloads are deleted.
    private void deleteStaleDownloads() {
        File[] files = updateDir().listFiles();
        if (files == null) return;
        long installed = installedVersionCode();
        for (File file : files) {
            if (archiveVersionCode(file) <= installed) file.delete();
        }
    }

    // -1 for anything that isn't a readable APK, e.g. an interrupted ".part" download.
    @SuppressWarnings("deprecation")
    private long archiveVersionCode(File file) {
        PackageInfo info = getContext().getPackageManager().getPackageArchiveInfo(file.getPath(), 0);
        return info == null ? -1 : PackageInfoCompat.getLongVersionCode(info);
    }

    @SuppressWarnings("deprecation")
    private long installedVersionCode() {
        try {
            PackageInfo info = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            return PackageInfoCompat.getLongVersionCode(info);
        } catch (PackageManager.NameNotFoundException e) {
            // Unreachable for our own package — treat every download as stale.
            return Long.MAX_VALUE;
        }
    }
}
