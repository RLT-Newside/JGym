// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
package com.rltnewside.jgym;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

public class ApkDownloaderTest {

    @Rule
    public TemporaryFolder tmp = new TemporaryFolder();

    private static final byte[] CONTENT = "hello apk".getBytes(StandardCharsets.UTF_8);
    // printf 'hello apk' | sha256sum
    private static final String CONTENT_SHA256 = "570808ed0224147f016b1ee468f5ab941c0e0d3bc8bcfb21ca6a2a37c6a571aa";
    private static final String WRONG_SHA256 = "0000000000000000000000000000000000000000000000000000000000000000";

    @Test
    public void acceptsOnlyJGymReleaseAssetUrls() {
        assertTrue(ApkDownloader.isAllowedUrl(
            "https://github.com/RLT-Newside/JGym/releases/download/v1.7.4/JGym-v1.7.4.apk"));

        String[] rejected = {
            null,
            "http://github.com/RLT-Newside/JGym/releases/download/v1.7.4/JGym-v1.7.4.apk",
            "https://github.com/someone/else/releases/download/v1.7.4/JGym-v1.7.4.apk",
            "https://github.com.evil.example/RLT-Newside/JGym/releases/download/v1.7.4/JGym-v1.7.4.apk",
            "https://github.com/RLT-Newside/JGym/releases/download/../../../someone/else/releases/download/v1/x.apk",
            "https://github.com/RLT-Newside/JGym/releases/download/v1.7.4/notes.txt",
            "https://github.com/RLT-Newside/JGym/releases/latest",
        };
        for (String url : rejected) {
            assertFalse(String.valueOf(url), ApkDownloader.isAllowedUrl(url));
        }
    }

    @Test
    public void acceptsOnlyPlainApkFileNames() {
        assertTrue(ApkDownloader.isSafeFileName("JGym-v1.7.4.apk"));

        String[] rejected = {null, "", "../JGym.apk", "dir/JGym.apk", "JGym.apk.exe", "JGym v1.apk"};
        for (String name : rejected) {
            assertFalse(String.valueOf(name), ApkDownloader.isSafeFileName(name));
        }
    }

    @Test
    public void savesAVerifiedDownloadWithoutLeavingAPartialFile() throws IOException {
        File target = new File(tmp.getRoot(), "JGym-v2.0.0.apk");

        ApkDownloader.save(new ByteArrayInputStream(CONTENT), CONTENT.length, target, CONTENT_SHA256, (b, t) -> {});

        assertArrayEquals(CONTENT, Files.readAllBytes(target.toPath()));
        assertFalse(new File(tmp.getRoot(), "JGym-v2.0.0.apk.part").exists());
    }

    @Test
    public void rejectsAndDeletesADownloadWithTheWrongChecksum() {
        File target = new File(tmp.getRoot(), "JGym-v2.0.0.apk");

        assertThrows(ApkDownloader.ChecksumMismatchException.class, () ->
            ApkDownloader.save(new ByteArrayInputStream(CONTENT), CONTENT.length, target, WRONG_SHA256, (b, t) -> {}));

        assertFalse(target.exists());
        assertFalse(new File(tmp.getRoot(), "JGym-v2.0.0.apk.part").exists());
    }

    @Test
    public void savesUnverifiedWhenNoChecksumIsKnown() throws IOException {
        File target = new File(tmp.getRoot(), "JGym-v2.0.0.apk");

        ApkDownloader.save(new ByteArrayInputStream(CONTENT), CONTENT.length, target, null, (b, t) -> {});

        assertArrayEquals(CONTENT, Files.readAllBytes(target.toPath()));
    }

    @Test
    public void replacesAStaleFileWithTheSameName() throws IOException {
        File target = tmp.newFile("JGym-v2.0.0.apk");
        Files.write(target.toPath(), "stale".getBytes(StandardCharsets.UTF_8));

        ApkDownloader.save(new ByteArrayInputStream(CONTENT), CONTENT.length, target, CONTENT_SHA256, (b, t) -> {});

        assertArrayEquals(CONTENT, Files.readAllBytes(target.toPath()));
    }

    @Test
    public void reportsIncreasingProgressUpToTheFullSize() throws IOException {
        byte[] apk = new byte[200_000];
        List<long[]> events = new ArrayList<>();

        ApkDownloader.save(new ByteArrayInputStream(apk), apk.length, new File(tmp.getRoot(), "big.apk"), null,
            (bytes, total) -> events.add(new long[] {bytes, total}));

        assertTrue("expected several progress events, got " + events.size(), events.size() > 1);
        for (int i = 1; i < events.size(); i++) {
            assertTrue(events.get(i)[0] > events.get(i - 1)[0]);
        }
        assertArrayEquals(new long[] {200_000, 200_000}, events.get(events.size() - 1));
    }

    @Test
    public void recognisesAnAlreadyDownloadedFileByItsChecksum() throws IOException {
        File existing = tmp.newFile("JGym-v2.0.0.apk");
        Files.write(existing.toPath(), CONTENT);

        assertTrue(ApkDownloader.matches(existing, CONTENT_SHA256));
        assertFalse(ApkDownloader.matches(existing, WRONG_SHA256));
        assertFalse(ApkDownloader.matches(new File(tmp.getRoot(), "missing.apk"), CONTENT_SHA256));
    }
}
