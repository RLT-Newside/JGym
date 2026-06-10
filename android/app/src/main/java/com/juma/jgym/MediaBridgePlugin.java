// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
package com.juma.jgym;

import android.content.ComponentName;
import android.content.Intent;
import android.media.AudioManager;
import android.media.session.MediaController;
import android.media.session.PlaybackState;
import android.provider.Settings;
import android.view.KeyEvent;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MediaBridge")
public class MediaBridgePlugin extends Plugin {

    private MediaBrowserBridge browserBridge;

    private MediaBrowserBridge getBrowserBridge() {
        if (browserBridge == null) {
            browserBridge = new MediaBrowserBridge(getContext());
        }
        return browserBridge;
    }

    @PluginMethod
    public void getMediaInfo(PluginCall call) {
        JSObject result = new JSObject();
        result.put("title", MediaNotificationListener.currentTitle);
        result.put("artist", MediaNotificationListener.currentArtist);
        result.put("isPlaying", MediaNotificationListener.isPlaying);
        result.put("hasPermission", isNotificationListenerEnabled());
        call.resolve(result);
    }

    @PluginMethod
    public void sendCommand(PluginCall call) {
        String action = call.getString("action", "");
        MediaController controller = MediaNotificationListener.activeController;

        if (controller != null) {
            MediaController.TransportControls controls = controller.getTransportControls();
            switch (action != null ? action : "") {
                case "next":
                    controls.skipToNext();
                    break;
                case "previous":
                    controls.skipToPrevious();
                    break;
                default:
                    PlaybackState state = controller.getPlaybackState();
                    if (state != null && state.getState() == PlaybackState.STATE_PLAYING) {
                        controls.pause();
                    } else {
                        controls.play();
                    }
                    break;
            }
            call.resolve();
            return;
        }

        // Fallback: broadcast media key events
        int keyCode;
        switch (action != null ? action : "") {
            case "next":
                keyCode = KeyEvent.KEYCODE_MEDIA_NEXT;
                break;
            case "previous":
                keyCode = KeyEvent.KEYCODE_MEDIA_PREVIOUS;
                break;
            default:
                keyCode = KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE;
                break;
        }
        AudioManager am = (AudioManager) getContext().getSystemService(android.content.Context.AUDIO_SERVICE);
        if (am != null) {
            am.dispatchMediaKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, keyCode));
            am.dispatchMediaKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, keyCode));
        }
        call.resolve();
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void isAppInstalled(PluginCall call) {
        JSObject result = new JSObject();
        try {
            getContext().getPackageManager().getPackageInfo("com.maxrave.simpmusic", 0);
            result.put("installed", true);
        } catch (Exception e) {
            result.put("installed", false);
        }
        call.resolve(result);
    }

    @PluginMethod
    public void connectBrowser(PluginCall call) {
        getBrowserBridge().connect(call);
    }

    @PluginMethod
    public void browse(PluginCall call) {
        String mediaId = call.getString("mediaId", "");
        getBrowserBridge().browse(mediaId, call);
    }

    @PluginMethod
    public void playFromMediaId(PluginCall call) {
        String mediaId = call.getString("mediaId");
        if (mediaId == null) {
            call.reject("mediaId is required");
            return;
        }
        getBrowserBridge().playFromMediaId(mediaId, call);
    }

    @PluginMethod
    public void getQueue(PluginCall call) {
        getBrowserBridge().getQueue(call);
    }

    @PluginMethod
    public void seekTo(PluginCall call) {
        long position = call.getLong("position", 0L);
        getBrowserBridge().seekTo(position, call);
    }

    @PluginMethod
    public void getFullMetadata(PluginCall call) {
        getBrowserBridge().getFullMetadata(call);
    }

    @PluginMethod
    public void setShuffleMode(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        getBrowserBridge().setShuffleMode(enabled, call);
    }

    @PluginMethod
    public void setRepeatMode(PluginCall call) {
        String mode = call.getString("mode", "off");
        getBrowserBridge().setRepeatMode(mode, call);
    }

    @PluginMethod
    public void removeQueueItem(PluginCall call) {
        String mediaId = call.getString("mediaId", "");
        String title = call.getString("title", "");
        getBrowserBridge().removeQueueItem(mediaId, title, call);
    }

    @PluginMethod
    public void addToQueue(PluginCall call) {
        String mediaId = call.getString("mediaId", "");
        String title = call.getString("title", "");
        String subtitle = call.getString("subtitle", "");
        getBrowserBridge().addToQueue(mediaId, title, subtitle, call);
    }

    @PluginMethod
    public void moveQueueItem(PluginCall call) {
        String mediaId = call.getString("mediaId", "");
        String title = call.getString("title", "");
        String subtitle = call.getString("subtitle", "");
        Integer toIndex = call.getInt("toIndex", 0);
        getBrowserBridge().moveQueueItem(mediaId, title, subtitle, toIndex != null ? toIndex : 0, call);
    }

    private boolean isNotificationListenerEnabled() {
        String flat = Settings.Secure.getString(
            getContext().getContentResolver(),
            "enabled_notification_listeners"
        );
        if (flat == null) return false;
        ComponentName cn = new ComponentName(getContext(), MediaNotificationListener.class);
        return flat.contains(cn.flattenToString());
    }
}
