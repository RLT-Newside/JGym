// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
package com.rltnewside.jgym;

import android.content.Intent;
import android.net.Uri;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "ImportBridge")
public class ImportBridgePlugin extends Plugin {

    // Set by MainActivity when launched/resumed via a SEND or VIEW intent
    // carrying a JSON backup. Read once by the web layer, then cleared.
    static volatile String pendingJson = null;

    static void captureIntent(Intent intent, android.content.Context context) {
        if (intent == null) return;
        String action = intent.getAction();
        Uri uri = null;

        if (Intent.ACTION_SEND.equals(action)) {
            uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
            if (uri == null) {
                String text = intent.getStringExtra(Intent.EXTRA_TEXT);
                if (text != null && !text.isEmpty()) {
                    pendingJson = text;
                    return;
                }
            }
        } else if (Intent.ACTION_VIEW.equals(action)) {
            uri = intent.getData();
        }

        if (uri == null) return;

        try (InputStream in = context.getContentResolver().openInputStream(uri)) {
            if (in == null) return;
            BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            char[] buf = new char[8192];
            int n;
            while ((n = reader.read(buf)) != -1) {
                sb.append(buf, 0, n);
            }
            pendingJson = sb.toString();
        } catch (Exception e) {
            // Unreadable stream — leave pendingJson untouched.
        }
    }

    @PluginMethod
    public void getPendingImport(PluginCall call) {
        JSObject result = new JSObject();
        result.put("json", pendingJson);
        call.resolve(result);
        pendingJson = null;
    }
}
