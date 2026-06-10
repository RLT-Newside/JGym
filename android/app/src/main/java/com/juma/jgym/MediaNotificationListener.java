// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
package com.juma.jgym;

import android.content.ComponentName;
import android.content.Context;
import android.media.MediaMetadata;
import android.media.session.MediaController;
import android.media.session.MediaSessionManager;
import android.media.session.PlaybackState;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

import java.util.List;

public class MediaNotificationListener extends NotificationListenerService {

    private static final String SIMPMUSIC_PACKAGE = "com.maxrave.simpmusic";

    public static volatile String currentTitle = null;
    public static volatile String currentArtist = null;
    public static volatile boolean isPlaying = false;
    public static volatile MediaController activeController = null;

    private MediaSessionManager sessionManager;
    private MediaController.Callback controllerCallback;
    private MediaSessionManager.OnActiveSessionsChangedListener sessionsListener;

    @Override
    public void onListenerConnected() {
        super.onListenerConnected();
        sessionManager = (MediaSessionManager) getSystemService(Context.MEDIA_SESSION_SERVICE);

        controllerCallback = new MediaController.Callback() {
            @Override
            public void onMetadataChanged(MediaMetadata metadata) {
                if (metadata != null) {
                    currentTitle = metadata.getString(MediaMetadata.METADATA_KEY_TITLE);
                    currentArtist = metadata.getString(MediaMetadata.METADATA_KEY_ARTIST);
                }
            }

            @Override
            public void onPlaybackStateChanged(PlaybackState state) {
                isPlaying = state != null && state.getState() == PlaybackState.STATE_PLAYING;
            }
        };

        sessionsListener = controllers -> findAndAttach(controllers);

        ComponentName cn = new ComponentName(this, MediaNotificationListener.class);
        sessionManager.addOnActiveSessionsChangedListener(sessionsListener, cn);
        findAndAttach(sessionManager.getActiveSessions(cn));
    }

    private void findAndAttach(List<MediaController> controllers) {
        if (activeController != null) {
            activeController.unregisterCallback(controllerCallback);
            activeController = null;
        }

        for (MediaController controller : controllers) {
            if (SIMPMUSIC_PACKAGE.equals(controller.getPackageName())) {
                activeController = controller;
                controller.registerCallback(controllerCallback);

                MediaMetadata metadata = controller.getMetadata();
                if (metadata != null) {
                    currentTitle = metadata.getString(MediaMetadata.METADATA_KEY_TITLE);
                    currentArtist = metadata.getString(MediaMetadata.METADATA_KEY_ARTIST);
                }
                PlaybackState state = controller.getPlaybackState();
                isPlaying = state != null && state.getState() == PlaybackState.STATE_PLAYING;
                return;
            }
        }

        currentTitle = null;
        currentArtist = null;
        isPlaying = false;
    }

    @Override
    public void onListenerDisconnected() {
        if (activeController != null) {
            activeController.unregisterCallback(controllerCallback);
            activeController = null;
        }
        if (sessionManager != null && sessionsListener != null) {
            sessionManager.removeOnActiveSessionsChangedListener(sessionsListener);
        }
        currentTitle = null;
        currentArtist = null;
        isPlaying = false;
        super.onListenerDisconnected();
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {}

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {}
}
