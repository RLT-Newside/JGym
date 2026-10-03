// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
package com.rltnewside.jgym;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.regex.Pattern;

// Android-free core of AppUpdatePlugin: decides which downloads are allowed,
// streams the APK to disk and verifies it against GitHub's published SHA-256.
final class ApkDownloader {

    // Release assets of this repo only, e.g. .../releases/download/v1.7.4/JGym-v1.7.4.apk.
    // The tag segment must start with "v", so ".." can never be a path segment.
    private static final Pattern RELEASE_ASSET_URL = Pattern.compile(
        "https://github\\.com/RLT-Newside/JGym/releases/download/v[A-Za-z0-9._-]+/[A-Za-z0-9._-]+\\.apk"
    );
    private static final Pattern SAFE_FILE_NAME = Pattern.compile("[A-Za-z0-9._-]+\\.apk");
    private static final int BUFFER_SIZE = 64 * 1024;

    static final class ChecksumMismatchException extends IOException {
        ChecksumMismatchException() {
            super("Checksum mismatch");
        }
    }

    interface ProgressListener {
        void onProgress(long bytes, long total);
    }

    private ApkDownloader() {}

    static boolean isAllowedUrl(String url) {
        return url != null && RELEASE_ASSET_URL.matcher(url).matches();
    }

    static boolean isSafeFileName(String name) {
        return name != null && SAFE_FILE_NAME.matcher(name).matches();
    }

    // True if `file` exists and its content hashes to `sha256` (hex).
    static boolean matches(File file, String sha256) throws IOException {
        if (!file.isFile()) return false;
        MessageDigest digest = newSha256();
        try (InputStream in = new FileInputStream(file)) {
            byte[] buf = new byte[BUFFER_SIZE];
            int n;
            while ((n = in.read(buf)) != -1) {
                digest.update(buf, 0, n);
            }
        }
        return toHex(digest.digest()).equalsIgnoreCase(sha256);
    }

    // Streams `in` to `target` through a ".part" file, reporting progress on every
    // whole-percent step (none while `total` is unknown). With a `sha256`, a
    // mismatching download is deleted and rejected.
    static void save(InputStream in, long total, File target, String sha256, ProgressListener listener)
        throws IOException {
        File part = new File(target.getPath() + ".part");
        MessageDigest digest = newSha256();
        try (OutputStream out = new FileOutputStream(part)) {
            byte[] buf = new byte[BUFFER_SIZE];
            long done = 0;
            long lastPercent = -1;
            int n;
            while ((n = in.read(buf)) != -1) {
                out.write(buf, 0, n);
                digest.update(buf, 0, n);
                done += n;
                long percent = total > 0 ? done * 100 / total : -1;
                if (percent != lastPercent) {
                    lastPercent = percent;
                    listener.onProgress(done, total);
                }
            }
        } catch (IOException e) {
            part.delete();
            throw e;
        }

        if (sha256 != null && !toHex(digest.digest()).equalsIgnoreCase(sha256)) {
            part.delete();
            throw new ChecksumMismatchException();
        }
        if ((target.exists() && !target.delete()) || !part.renameTo(target)) {
            part.delete();
            throw new IOException("Could not save " + target.getName());
        }
    }

    private static MessageDigest newSha256() {
        try {
            return MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException e) {
            // Every Java and Android runtime is required to provide SHA-256.
            throw new IllegalStateException(e);
        }
    }

    private static String toHex(byte[] bytes) {
        StringBuilder hex = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            hex.append(Character.forDigit((b >> 4) & 0xF, 16)).append(Character.forDigit(b & 0xF, 16));
        }
        return hex.toString();
    }
}
