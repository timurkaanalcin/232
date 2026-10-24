package app.livetrack.mobile;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;
import android.webkit.CookieManager;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONObject;

/**
 * Visible location indicator while the signed-in user has an active sharing session.
 * This is a foreground service with a persistent notification and a Stop action.
 * It is not sticky, does not start on boot, and does not request background-location permission.
 */
public class LocationSharingService extends Service {
    public static final String ACTION_START = "app.livetrack.mobile.START_SHARING";
    public static final String ACTION_STOP = "app.livetrack.mobile.STOP_SHARING";
    public static final String ACTION_LOCATION = "app.livetrack.mobile.LOCATION_FIX";
    public static final String ACTION_STOPPED = "app.livetrack.mobile.SHARING_STOPPED";

    public static final String EXTRA_SESSION_ID = "sessionId";
    public static final String EXTRA_ORIGIN = "origin";
    public static final String EXTRA_REASON = "reason";
    public static final String EXTRA_LAT = "lat";
    public static final String EXTRA_LNG = "lng";
    public static final String EXTRA_ACC = "acc";
    public static final String EXTRA_ALT = "alt";
    public static final String EXTRA_SPD = "spd";
    public static final String EXTRA_HDG = "hdg";
    public static final String EXTRA_TS = "ts";
    public static final String EXTRA_HAS_ALT = "hasAlt";
    public static final String EXTRA_HAS_SPD = "hasSpd";
    public static final String EXTRA_HAS_HDG = "hasHdg";

    private static final String TAG = "LiveTrack";
    private static final String CHANNEL_ID = "livetrack_location_sharing";
    private static final int NOTIFICATION_ID = 7041;
    private static final long BROADCAST_INTERVAL_MS = 1_000L;
    private static final long REST_INTERVAL_MS = 4_000L;
    private static final int PENDING_FLAGS = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
    private static final String SHARING_PREFS = "livetrack_sharing";
    private static final String KEY_SESSION = "session_id";
    private static final String KEY_ORIGIN = "origin";

    private static volatile boolean running;

    private final ExecutorService http = Executors.newSingleThreadExecutor();
    private LocationManager locationManager;
    private LocationListener listener;
    private String sessionId;
    private String origin;
    private long lastBroadcastAt;
    private long lastRestAt;
    private boolean stopping;
    private int latestStartId;

    public static boolean isRunning() {
        return running;
    }

    public static void start(Context context, String sessionId, String origin) {
        Intent intent = new Intent(context, LocationSharingService.class);
        intent.setAction(ACTION_START);
        intent.putExtra(EXTRA_SESSION_ID, sessionId);
        intent.putExtra(EXTRA_ORIGIN, origin);
        ContextCompat.startForegroundService(context, intent);
    }

    public static void requestStop(Context context) {
        if (!running) {
            return;
        }
        Intent intent = new Intent(context, LocationSharingService.class);
        intent.setAction(ACTION_STOP);
        context.startService(intent);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);
        createChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        latestStartId = startId;
        if (intent == null) {
            // The process was restarted without a user action. Do not resume tracking.
            restoreSession();
            stopSharing("process_restart");
            return START_NOT_STICKY;
        }
        if (ACTION_STOP.equals(intent.getAction())) {
            stopSharing("user");
            return START_NOT_STICKY;
        }

        String nextSession = intent.getStringExtra(EXTRA_SESSION_ID);
        String nextOrigin = intent.getStringExtra(EXTRA_ORIGIN);
        if (nextSession == null || nextOrigin == null) {
            stopSharing("invalid");
            return START_NOT_STICKY;
        }
        stopping = false;
        sessionId = nextSession;
        origin = nextOrigin;
        persistSession();

        try {
            Notification notification = buildNotification();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } catch (Exception ex) {
            Log.e(TAG, "Could not show the location-sharing notification", ex);
            broadcastStopped("notification_unavailable");
            stopSelf();
            return START_NOT_STICKY;
        }

        running = true;
        beginUpdates();
        return START_NOT_STICKY;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        // Keep the notification up if the user swipes the app away.
        // Sharing stays visible and can still be stopped from the notification.
        super.onTaskRemoved(rootIntent);
    }

    @Override
    public void onDestroy() {
        running = false;
        removeUpdates();
        http.shutdown();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @SuppressLint("MissingPermission")
    private void beginUpdates() {
        removeUpdates();
        if (locationManager == null) {
            stopSharing("location_unavailable");
            return;
        }
        listener = new LocationListener() {
            @Override
            public void onLocationChanged(@NonNull Location location) {
                handleLocation(location);
            }
        };
        boolean requested = false;
        requested |= requestProvider(LocationManager.GPS_PROVIDER);
        requested |= requestProvider(LocationManager.NETWORK_PROVIDER);
        if (!requested) {
            stopSharing("location_unavailable");
        }
    }

    @SuppressLint("MissingPermission")
    private boolean requestProvider(String provider) {
        if (locationManager == null || listener == null) {
            return false;
        }
        try {
            if (!locationManager.isProviderEnabled(provider)) {
                return false;
            }
            locationManager.requestLocationUpdates(provider, 2_000L, 0f, listener, Looper.getMainLooper());
            return true;
        } catch (SecurityException ex) {
            Log.w(TAG, "Location permission revoked while sharing");
            stopSharing("permission_denied");
            return false;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    private void handleLocation(Location location) {
        if (stopping || sessionId == null || origin == null) {
            return;
        }
        long now = System.currentTimeMillis();
        if (now - lastBroadcastAt >= BROADCAST_INTERVAL_MS) {
            lastBroadcastAt = now;
            broadcastFix(location);
        }
        // The web view publishes while the app is open. Native REST covers the time
        // the web view is frozen in the background, still under the visible notification.
        if (!LiveTrackVisibility.inForeground() && now - lastRestAt >= REST_INTERVAL_MS) {
            lastRestAt = now;
            postUpdate(location);
        }
    }

    private void broadcastFix(Location location) {
        Intent intent = new Intent(ACTION_LOCATION);
        intent.setPackage(getPackageName());
        intent.putExtra(EXTRA_LAT, location.getLatitude());
        intent.putExtra(EXTRA_LNG, location.getLongitude());
        float accuracy = location.hasAccuracy() ? Math.min(Math.max(location.getAccuracy(), 0f), 100_000f) : 0f;
        intent.putExtra(EXTRA_ACC, accuracy);
        intent.putExtra(EXTRA_TS, location.getTime() > 0 ? location.getTime() : System.currentTimeMillis());
        if (location.hasAltitude()) {
            intent.putExtra(EXTRA_HAS_ALT, true);
            intent.putExtra(EXTRA_ALT, location.getAltitude());
        }
        if (location.hasSpeed() && location.getSpeed() >= 0f && location.getSpeed() <= 600f) {
            intent.putExtra(EXTRA_HAS_SPD, true);
            intent.putExtra(EXTRA_SPD, location.getSpeed());
        }
        if (location.hasBearing() && location.getBearing() >= 0f && location.getBearing() <= 360f) {
            intent.putExtra(EXTRA_HAS_HDG, true);
            intent.putExtra(EXTRA_HDG, location.getBearing());
        }
        sendBroadcast(intent);
    }

    private void postUpdate(Location location) {
        final String activeSession = sessionId;
        final String activeOrigin = origin;
        if (activeSession == null || activeOrigin == null) {
            return;
        }
        final String cookie = readCookie(activeOrigin);
        final String json;
        try {
            JSONObject position = new JSONObject();
            position.put("lat", location.getLatitude());
            position.put("lng", location.getLongitude());
            float accuracy = location.hasAccuracy() ? Math.min(Math.max(location.getAccuracy(), 0f), 100_000f) : 0f;
            position.put("acc", accuracy);
            position.put("ts", location.getTime() > 0 ? location.getTime() : System.currentTimeMillis());
            if (location.hasAltitude()) {
                position.put("alt", location.getAltitude());
            }
            if (location.hasSpeed() && location.getSpeed() >= 0f && location.getSpeed() <= 600f) {
                position.put("spd", location.getSpeed());
            }
            if (location.hasBearing() && location.getBearing() >= 0f && location.getBearing() <= 360f) {
                position.put("hdg", location.getBearing());
            }
            JSONObject body = new JSONObject();
            body.put("sessionId", activeSession);
            body.put("position", position);
            json = body.toString();
        } catch (Exception ex) {
            Log.w(TAG, "Could not encode a location update", ex);
            return;
        }
        http.execute(() -> LiveTrackHttp.postJson(activeOrigin + "/api/location/update", activeOrigin, cookie, json));
    }

    private void postStop() {
        final String activeSession = sessionId;
        final String activeOrigin = origin;
        if (activeSession == null || activeOrigin == null) {
            return;
        }
        final String cookie = readCookie(activeOrigin);
        http.execute(() ->
            LiveTrackHttp.postJson(
                activeOrigin + "/api/location/sessions/" + activeSession + "/stop",
                activeOrigin,
                cookie,
                "{}"
            )
        );
    }

    private String readCookie(String activeOrigin) {
        try {
            CookieManager manager = CookieManager.getInstance();
            manager.flush();
            return manager.getCookie(activeOrigin);
        } catch (Exception ex) {
            Log.w(TAG, "Could not read the session cookie", ex);
            return null;
        }
    }

    private void stopSharing(String reason) {
        if (stopping) {
            return;
        }
        stopping = true;
        running = false;
        removeUpdates();
        if ("user".equals(reason) || "permission_denied".equals(reason) || "process_restart".equals(reason)) {
            postStop();
        }
        clearSession();
        broadcastStopped(reason);
        stopForeground(STOP_FOREGROUND_REMOVE);
        stopSelf(latestStartId);
    }

    private void persistSession() {
        getSharedPreferences(SHARING_PREFS, MODE_PRIVATE)
            .edit()
            .putString(KEY_SESSION, sessionId)
            .putString(KEY_ORIGIN, origin)
            .apply();
    }

    private void restoreSession() {
        if (sessionId != null && origin != null) {
            return;
        }
        android.content.SharedPreferences prefs = getSharedPreferences(SHARING_PREFS, MODE_PRIVATE);
        sessionId = prefs.getString(KEY_SESSION, null);
        origin = prefs.getString(KEY_ORIGIN, null);
    }

    private void clearSession() {
        sessionId = null;
        origin = null;
        getSharedPreferences(SHARING_PREFS, MODE_PRIVATE).edit().clear().apply();
    }

    private void removeUpdates() {
        if (locationManager != null && listener != null) {
            try {
                locationManager.removeUpdates(listener);
            } catch (Exception ignored) {
                // The provider may already be gone.
            }
            listener = null;
        }
    }

    private void broadcastStopped(String reason) {
        Intent intent = new Intent(ACTION_STOPPED);
        intent.setPackage(getPackageName());
        intent.putExtra(EXTRA_REASON, reason);
        sendBroadcast(intent);
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            getString(R.string.sharing_channel_name),
            NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription(getString(R.string.sharing_channel_description));
        channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) {
            manager.createNotificationChannel(channel);
        }
    }

    private Notification buildNotification() {
        Intent open = new Intent(this, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent content = PendingIntent.getActivity(this, 0, open, PENDING_FLAGS);

        Intent stop = new Intent(this, StopSharingReceiver.class);
        stop.setAction(ACTION_STOP);
        PendingIntent stopAction = PendingIntent.getBroadcast(this, 1, stop, PENDING_FLAGS);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_livetrack)
            .setContentTitle(getString(R.string.sharing_notification_title))
            .setContentText(getString(R.string.sharing_notification_text))
            .setStyle(new NotificationCompat.BigTextStyle().bigText(getString(R.string.sharing_notification_text)))
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(content)
            .setDeleteIntent(stopAction)
            .addAction(0, getString(R.string.sharing_notification_stop), stopAction);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            builder.setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE);
        }
        return builder.build();
    }
}
