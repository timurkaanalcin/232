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
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;
import android.webkit.CookieManager;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.RejectedExecutionException;
import org.json.JSONObject;

/**
 * Visible location indicator while the signed-in user has started a sharing session.
 * A foreground service of type location keeps updates going when the app is
 * backgrounded or the screen is locked. The notification stays up, with Stop sharing.
 * The service is not sticky and is never started on boot or without a user action.
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
    private static final long BROADCAST_INTERVAL_MS = 2_000L;
    static final long UPDATE_INTERVAL_MS = 5_000L;
    static final float MIN_DISTANCE_METERS = 15f;
    static final long HEARTBEAT_MS = 45_000L;
    private static final long REST_MIN_INTERVAL_MS = 15_000L;
    private static final long PUMP_INTERVAL_MS = 5_000L;
    private static final long REFRESH_INTERVAL_MS = 60_000L;
    private static final int PENDING_FLAGS = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
    private static final String SHARING_PREFS = "livetrack_sharing";
    private static final String KEY_SESSION = "session_id";
    private static final String KEY_ORIGIN = "origin";
    private static final long[] RETRY_DELAYS_MS = { 5_000L, 15_000L, 30_000L, 60_000L };

    private static volatile boolean running;

    private final ExecutorService http = Executors.newSingleThreadExecutor();
    private final Handler main = new Handler(Looper.getMainLooper());
    private LocationManager locationManager;
    private LocationListener listener;
    private String sessionId;
    private String origin;
    private long lastBroadcastAt;
    private long lastRestAt;
    private long lastRefreshRequestAt;
    private boolean stopping;
    private boolean wasForeground = true;
    private boolean postInFlight;
    private int generation;
    private int retryAttempt;
    private int latestStartId;
    private Location lastLocation;
    private Location lastPostedLocation;
    private String pendingJson;
    private String pendingOrigin;
    private Runnable retryTask;

    private final Runnable pump = new Runnable() {
        @Override
        public void run() {
            if (stopping || !running) {
                return;
            }
            boolean foreground = LiveTrackVisibility.inForeground();
            long now = System.currentTimeMillis();
            if (wasForeground && !foreground && lastLocation != null) {
                postUpdate(lastLocation);
            }
            wasForeground = foreground;
            if (!foreground && lastLocation != null && now - lastRestAt >= HEARTBEAT_MS) {
                postUpdate(lastLocation);
            } else if (!foreground && (lastLocation == null || now - lastLocation.getTime() > 90_000L)) {
                requestSingleRefresh();
            }
            main.postDelayed(this, PUMP_INTERVAL_MS);
        }
    };

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
        generation++;
        retryAttempt = 0;
        pendingJson = null;
        postInFlight = false;
        wasForeground = true;
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
        main.removeCallbacks(pump);
        main.post(pump);
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
        main.removeCallbacks(pump);
        if (retryTask != null) {
            main.removeCallbacks(retryTask);
            retryTask = null;
        }
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
            locationManager.requestLocationUpdates(
                provider,
                UPDATE_INTERVAL_MS,
                MIN_DISTANCE_METERS,
                listener,
                Looper.getMainLooper()
            );
            return true;
        } catch (SecurityException ex) {
            Log.w(TAG, "Location permission revoked while sharing");
            stopSharing("permission_denied");
            return false;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    @SuppressLint("MissingPermission")
    @SuppressWarnings("deprecation")
    private void requestSingleRefresh() {
        if (locationManager == null || stopping) {
            return;
        }
        long now = System.currentTimeMillis();
        if (now - lastRefreshRequestAt < REFRESH_INTERVAL_MS) {
            return;
        }
        lastRefreshRequestAt = now;
        String provider = null;
        try {
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                provider = LocationManager.GPS_PROVIDER;
            } else if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                provider = LocationManager.NETWORK_PROVIDER;
            }
        } catch (Exception ex) {
            return;
        }
        if (provider == null) {
            return;
        }
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                locationManager.getCurrentLocation(
                    provider,
                    null,
                    command -> main.post(command),
                    location -> {
                        if (location != null) {
                            handleLocation(location);
                        }
                    }
                );
            } else if (listener != null) {
                locationManager.requestSingleUpdate(provider, listener, Looper.getMainLooper());
            }
        } catch (SecurityException ex) {
            stopSharing("permission_denied");
        } catch (Exception ex) {
            Log.w(TAG, "Could not request a location refresh");
        }
    }

    private void handleLocation(Location location) {
        if (stopping || sessionId == null || origin == null || location == null) {
            return;
        }
        lastLocation = location;
        long now = System.currentTimeMillis();
        if (now - lastBroadcastAt >= BROADCAST_INTERVAL_MS) {
            lastBroadcastAt = now;
            broadcastFix(location);
        }
        // The web view publishes while the app is open. Native REST covers the time
        // the web view is frozen, still under the visible notification.
        if (!LiveTrackVisibility.inForeground()) {
            boolean moved = lastPostedLocation == null || location.distanceTo(lastPostedLocation) >= MIN_DISTANCE_METERS;
            boolean due = now - lastRestAt >= REST_MIN_INTERVAL_MS;
            if ((moved && due) || now - lastRestAt >= HEARTBEAT_MS) {
                lastPostedLocation = location;
                postUpdate(location);
            }
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
        if (stopping || activeSession == null || activeOrigin == null || location == null) {
            return;
        }
        final String json;
        try {
            JSONObject position = new JSONObject();
            position.put("lat", location.getLatitude());
            position.put("lng", location.getLongitude());
            float accuracy = location.hasAccuracy() ? Math.min(Math.max(location.getAccuracy(), 0f), 100_000f) : 0f;
            position.put("acc", (double) accuracy);
            position.put("ts", location.getTime() > 0 ? location.getTime() : System.currentTimeMillis());
            if (location.hasAltitude()) {
                position.put("alt", location.getAltitude());
            }
            if (location.hasSpeed() && location.getSpeed() >= 0f && location.getSpeed() <= 600f) {
                position.put("spd", (double) location.getSpeed());
            }
            if (location.hasBearing() && location.getBearing() >= 0f && location.getBearing() <= 360f) {
                position.put("hdg", (double) location.getBearing());
            }
            JSONObject body = new JSONObject();
            body.put("sessionId", activeSession);
            body.put("position", position);
            json = body.toString();
        } catch (Exception ex) {
            Log.w(TAG, "Could not encode a location update");
            return;
        }
        pendingJson = json;
        pendingOrigin = activeOrigin;
        if (!postInFlight && retryTask == null) {
            sendPending();
        }
    }

    private void sendPending() {
        if (stopping || pendingJson == null || pendingOrigin == null) {
            return;
        }
        final int gen = generation;
        final String body = pendingJson;
        final String activeOrigin = pendingOrigin;
        final String cookie = readCookie(activeOrigin);
        postInFlight = true;
        try {
            http.execute(() -> {
                int code = LiveTrackHttp.postJson(activeOrigin + "/api/location/update", activeOrigin, cookie, body);
                main.post(() -> finishPost(gen, body, code));
            });
        } catch (RejectedExecutionException ex) {
            postInFlight = false;
        }
    }

    private void finishPost(int gen, String body, int code) {
        if (gen != generation || stopping) {
            postInFlight = false;
            return;
        }
        postInFlight = false;
        if (code >= 200 && code < 300) {
            retryAttempt = 0;
            lastRestAt = System.currentTimeMillis();
            if (body.equals(pendingJson)) {
                pendingJson = null;
            }
            if (pendingJson != null) {
                sendPending();
            }
            return;
        }
        if (code == 401 || code == 403 || code == 404) {
            pendingJson = null;
            stopSharing("session_ended");
            return;
        }
        if (code == 400) {
            if (body.equals(pendingJson)) {
                pendingJson = null;
            }
            retryAttempt = 0;
            return;
        }
        scheduleRetry(gen);
    }

    private void scheduleRetry(int gen) {
        if (stopping || gen != generation) {
            return;
        }
        retryAttempt++;
        if (retryTask != null) {
            main.removeCallbacks(retryTask);
        }
        long delay = RETRY_DELAYS_MS[Math.min(retryAttempt - 1, RETRY_DELAYS_MS.length - 1)];
        retryTask = () -> {
            retryTask = null;
            if (!stopping && generation == gen) {
                sendPending();
            }
        };
        main.postDelayed(retryTask, delay);
    }

    private void postStop() {
        final String activeSession = sessionId;
        final String activeOrigin = origin;
        if (activeSession == null || activeOrigin == null) {
            return;
        }
        final String cookie = readCookie(activeOrigin);
        final int gen = generation;
        try {
            http.execute(() -> sendStop(gen, activeOrigin, activeSession, cookie, 1));
        } catch (RejectedExecutionException ex) {
            Log.w(TAG, "Could not queue the stop request");
        }
    }

    private void sendStop(int gen, String activeOrigin, String activeSession, String cookie, int attempt) {
        if (gen != generation) {
            return;
        }
        int code = LiveTrackHttp.postJson(
            activeOrigin + "/api/location/sessions/" + activeSession + "/stop",
            activeOrigin,
            cookie,
            "{}"
        );
        boolean ok = code >= 200 && code < 300;
        boolean gone = code == 401 || code == 403 || code == 404;
        if (ok || gone || attempt >= RETRY_DELAYS_MS.length) {
            return;
        }
        long delay = RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)];
        main.postDelayed(() -> {
            if (gen != generation) {
                return;
            }
            try {
                http.execute(() -> sendStop(gen, activeOrigin, activeSession, cookie, attempt + 1));
            } catch (RejectedExecutionException ex) {
                Log.w(TAG, "Could not retry the stop request");
            }
        }, delay);
    }

    private String readCookie(String activeOrigin) {
        try {
            CookieManager manager = CookieManager.getInstance();
            manager.flush();
            return manager.getCookie(activeOrigin);
        } catch (Exception ex) {
            Log.w(TAG, "Could not read the session cookie");
            return null;
        }
    }

    private void stopSharing(String reason) {
        if (stopping) {
            return;
        }
        stopping = true;
        generation++;
        running = false;
        postInFlight = false;
        pendingJson = null;
        main.removeCallbacks(pump);
        if (retryTask != null) {
            main.removeCallbacks(retryTask);
            retryTask = null;
        }
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
        lastLocation = null;
        lastPostedLocation = null;
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
