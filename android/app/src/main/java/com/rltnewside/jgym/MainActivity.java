// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
package com.rltnewside.jgym;

import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsetsController;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MediaBridgePlugin.class);
        registerPlugin(ImportBridgePlugin.class);
        super.onCreate(savedInstanceState);

        ImportBridgePlugin.captureIntent(getIntent(), this);

        Window window = getWindow();
        window.setStatusBarColor(Color.parseColor("#0d0d0d"));
        window.setNavigationBarColor(Color.parseColor("#0d0d0d"));

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                controller.setSystemBarsAppearance(0,
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS |
                    WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
            }
        } else {
            View decorView = window.getDecorView();
            decorView.setSystemUiVisibility(
                decorView.getSystemUiVisibility()
                    & ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
                    & ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
            );
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        ImportBridgePlugin.captureIntent(intent, this);
    }
}
