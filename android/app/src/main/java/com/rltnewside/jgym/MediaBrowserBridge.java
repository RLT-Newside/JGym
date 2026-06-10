// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
package com.rltnewside.jgym;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.os.Bundle;
import android.support.v4.media.MediaBrowserCompat;
import android.support.v4.media.MediaDescriptionCompat;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaControllerCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;

import java.util.List;

public class MediaBrowserBridge {

    private static final String SIMPMUSIC_PACKAGE = "com.maxrave.simpmusic";

    private final Context context;
    private MediaBrowserCompat mediaBrowser;
    private MediaControllerCompat mediaController;
    private boolean connected = false;
    private boolean available = false;

    public MediaBrowserBridge(Context context) {
        this.context = context;
    }

    public void connect(PluginCall call) {
        ComponentName serviceComponent = discoverBrowserService();
        if (serviceComponent == null) {
            available = false;
            JSObject result = new JSObject();
            result.put("available", false);
            call.resolve(result);
            return;
        }

        mediaBrowser = new MediaBrowserCompat(context, serviceComponent,
            new MediaBrowserCompat.ConnectionCallback() {
                @Override
                public void onConnected() {
                    connected = true;
                    available = true;
                    try {
                        MediaSessionCompat.Token token = mediaBrowser.getSessionToken();
                        mediaController = new MediaControllerCompat(context, token);
                    } catch (Exception e) {
                        // Controller creation failed — browsing still works
                    }
                    JSObject result = new JSObject();
                    result.put("available", true);
                    call.resolve(result);
                }

                @Override
                public void onConnectionFailed() {
                    connected = false;
                    available = false;
                    JSObject result = new JSObject();
                    result.put("available", false);
                    call.resolve(result);
                }

                @Override
                public void onConnectionSuspended() {
                    connected = false;
                    mediaController = null;
                }
            }, null);

        call.setKeepAlive(true);
        mediaBrowser.connect();
    }

    public void browse(String parentId, PluginCall call) {
        if (!connected || mediaBrowser == null) {
            call.reject("Not connected to media browser");
            return;
        }

        String mediaId = (parentId == null || parentId.isEmpty())
            ? mediaBrowser.getRoot()
            : parentId;

        call.setKeepAlive(true);
        mediaBrowser.subscribe(mediaId, new MediaBrowserCompat.SubscriptionCallback() {
            @Override
            public void onChildrenLoaded(String parentId, List<MediaBrowserCompat.MediaItem> children) {
                JSObject result = new JSObject();
                JSArray items = new JSArray();
                for (MediaBrowserCompat.MediaItem item : children) {
                    MediaDescriptionCompat desc = item.getDescription();
                    JSObject obj = new JSObject();
                    obj.put("mediaId", item.getMediaId());
                    obj.put("title", desc.getTitle() != null ? desc.getTitle().toString() : null);
                    obj.put("subtitle", desc.getSubtitle() != null ? desc.getSubtitle().toString() : null);
                    obj.put("iconUri", desc.getIconUri() != null ? desc.getIconUri().toString() : null);
                    obj.put("browsable", item.isBrowsable());
                    obj.put("playable", item.isPlayable());
                    items.put(obj);
                }
                result.put("items", items);
                call.resolve(result);
                mediaBrowser.unsubscribe(mediaId);
            }

            @Override
            public void onError(String parentId) {
                call.reject("Failed to browse media ID: " + parentId);
                mediaBrowser.unsubscribe(parentId);
            }
        });
    }

    public void playFromMediaId(String mediaId, PluginCall call) {
        if (mediaController != null) {
            mediaController.getTransportControls().playFromMediaId(mediaId, null);
            call.resolve();
        } else {
            call.reject("No media controller available");
        }
    }

    public void getQueue(PluginCall call) {
        JSObject result = new JSObject();
        JSArray queueArray = new JSArray();

        List<MediaSessionCompat.QueueItem> queue =
            mediaController != null ? mediaController.getQueue() : null;

        if (queue != null && !queue.isEmpty()) {
            for (MediaSessionCompat.QueueItem item : queue) {
                MediaDescriptionCompat desc = item.getDescription();
                JSObject obj = new JSObject();
                obj.put("queueId", item.getQueueId());
                obj.put("mediaId", desc.getMediaId());
                obj.put("title", desc.getTitle() != null ? desc.getTitle().toString() : null);
                obj.put("subtitle", desc.getSubtitle() != null ? desc.getSubtitle().toString() : null);
                queueArray.put(obj);
            }
            result.put("queue", queueArray);
            CharSequence title = mediaController.getQueueTitle();
            result.put("queueTitle", title != null ? title.toString() : null);
            call.resolve(result);
            return;
        }

        // The MediaBrowserService session often exposes no legacy queue. Fall back
        // to the live playback session captured by the notification listener.
        android.media.session.MediaController live = MediaNotificationListener.activeController;
        if (live != null) {
            List<android.media.session.MediaSession.QueueItem> liveQueue = live.getQueue();
            if (liveQueue != null) {
                for (android.media.session.MediaSession.QueueItem item : liveQueue) {
                    android.media.MediaDescription desc = item.getDescription();
                    JSObject obj = new JSObject();
                    obj.put("queueId", item.getQueueId());
                    obj.put("mediaId", desc.getMediaId());
                    obj.put("title", desc.getTitle() != null ? desc.getTitle().toString() : null);
                    obj.put("subtitle", desc.getSubtitle() != null ? desc.getSubtitle().toString() : null);
                    queueArray.put(obj);
                }
            }
            CharSequence liveTitle = live.getQueueTitle();
            result.put("queueTitle", liveTitle != null ? liveTitle.toString() : null);
        } else {
            result.put("queueTitle", null);
        }

        result.put("queue", queueArray);
        call.resolve(result);
    }

    public void seekTo(long positionMs, PluginCall call) {
        if (mediaController != null) {
            mediaController.getTransportControls().seekTo(positionMs);
            call.resolve();
        } else {
            call.reject("No media controller available");
        }
    }

    public void getFullMetadata(PluginCall call) {
        JSObject result = new JSObject();

        // Try browser's controller first, fall back to notification listener's controller
        MediaControllerCompat ctrl = mediaController;

        if (ctrl != null) {
            MediaMetadataCompat metadata = ctrl.getMetadata();
            PlaybackStateCompat state = ctrl.getPlaybackState();

            if (metadata != null) {
                result.put("title", metadata.getString(MediaMetadataCompat.METADATA_KEY_TITLE));
                result.put("artist", metadata.getString(MediaMetadataCompat.METADATA_KEY_ARTIST));
                result.put("album", metadata.getString(MediaMetadataCompat.METADATA_KEY_ALBUM));
                result.put("duration", metadata.getLong(MediaMetadataCompat.METADATA_KEY_DURATION));
                String artUri = metadata.getString(MediaMetadataCompat.METADATA_KEY_ALBUM_ART_URI);
                if (artUri == null && metadata.getDescription().getIconUri() != null) {
                    artUri = metadata.getDescription().getIconUri().toString();
                }
                result.put("albumArtUri", artUri);
            }

            if (state != null) {
                result.put("position", state.getPosition());
                result.put("isPlaying", state.getState() == PlaybackStateCompat.STATE_PLAYING);
            } else {
                result.put("position", 0);
                result.put("isPlaying", false);
            }

            int sm = ctrl.getShuffleMode();
            result.put("shuffleMode", sm == PlaybackStateCompat.SHUFFLE_MODE_ALL || sm == PlaybackStateCompat.SHUFFLE_MODE_GROUP);
            int rm = ctrl.getRepeatMode();
            String repeatStr = rm == PlaybackStateCompat.REPEAT_MODE_ONE ? "one"
                : (rm == PlaybackStateCompat.REPEAT_MODE_ALL || rm == PlaybackStateCompat.REPEAT_MODE_GROUP) ? "all" : "off";
            result.put("repeatMode", repeatStr);
        } else {
            // Fallback to notification listener statics
            result.put("title", MediaNotificationListener.currentTitle);
            result.put("artist", MediaNotificationListener.currentArtist);
            result.put("album", null);
            result.put("duration", 0);
            result.put("position", 0);
            result.put("albumArtUri", null);
            result.put("isPlaying", MediaNotificationListener.isPlaying);
            result.put("shuffleMode", false);
            result.put("repeatMode", "off");
        }

        result.put("hasPermission", true);
        call.resolve(result);
    }

    public void setShuffleMode(boolean enabled, PluginCall call) {
        if (mediaController == null) { call.reject("No media controller"); return; }
        mediaController.getTransportControls().setShuffleMode(
            enabled ? PlaybackStateCompat.SHUFFLE_MODE_ALL : PlaybackStateCompat.SHUFFLE_MODE_NONE);
        call.resolve();
    }

    public void setRepeatMode(String mode, PluginCall call) {
        if (mediaController == null) { call.reject("No media controller"); return; }
        int rm = "one".equals(mode) ? PlaybackStateCompat.REPEAT_MODE_ONE
               : "all".equals(mode) ? PlaybackStateCompat.REPEAT_MODE_ALL
               : PlaybackStateCompat.REPEAT_MODE_NONE;
        mediaController.getTransportControls().setRepeatMode(rm);
        call.resolve();
    }

    public void removeQueueItem(String mediaId, String title, PluginCall call) {
        if (mediaController == null) { call.reject("No media controller"); return; }
        MediaDescriptionCompat desc = new MediaDescriptionCompat.Builder()
            .setMediaId(mediaId)
            .setTitle(title)
            .build();
        mediaController.removeQueueItem(desc);
        call.resolve();
    }

    public void addToQueue(String mediaId, String title, String subtitle, PluginCall call) {
        if (mediaController == null) { call.reject("No media controller"); return; }
        MediaDescriptionCompat desc = new MediaDescriptionCompat.Builder()
            .setMediaId(mediaId)
            .setTitle(title)
            .setSubtitle(subtitle)
            .build();
        mediaController.addQueueItem(desc);
        call.resolve();
    }

    // Reorder a queue item by removing it and re-inserting at toIndex.
    // MediaControllerCompat exposes no native move, so remove + indexed add is the only path.
    public void moveQueueItem(String mediaId, String title, String subtitle, int toIndex, PluginCall call) {
        if (mediaController == null) { call.reject("No media controller"); return; }
        MediaDescriptionCompat desc = new MediaDescriptionCompat.Builder()
            .setMediaId(mediaId)
            .setTitle(title)
            .setSubtitle(subtitle)
            .build();
        mediaController.removeQueueItem(desc);
        mediaController.addQueueItem(desc, toIndex);
        call.resolve();
    }

    public boolean isAvailable() {
        return available;
    }

    public boolean isConnected() {
        return connected;
    }

    public void disconnect() {
        if (mediaBrowser != null) {
            mediaBrowser.disconnect();
            mediaBrowser = null;
        }
        mediaController = null;
        connected = false;
    }

    private ComponentName discoverBrowserService() {
        Intent intent = new Intent("android.media.browse.MediaBrowserService");
        intent.setPackage(SIMPMUSIC_PACKAGE);
        List<ResolveInfo> services = context.getPackageManager()
            .queryIntentServices(intent, 0);
        if (services == null || services.isEmpty()) return null;
        ResolveInfo info = services.get(0);
        return new ComponentName(info.serviceInfo.packageName, info.serviceInfo.name);
    }
}
