package app.livetrack.mobile;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.webkit.CookieManager;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.regex.Pattern;

/**
 * Bridge used by the web app after the user accepts the in-app consent screen.
 * Permission prompts happen here, on that user action — never at launch.
 */
@CapacitorPlugin(
    name = "LiveTrack",
    permissions = {
        @Permission(
            strings = { Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION },
            alias = "location"
        ),
        @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }, alias = "notifications"),
        @Permission(strings = { Manifest.permission.ACCESS_BACKGROUND_LOCATION }, alias = "backgroundLocation"),
    }
)
public class LiveTrackPlugin extends Plugin {
    private static final Pattern SESSION_ID = Pattern.compile(
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
    );
    private static final long FIX_TIMEOUT_MS = 30_000L;

    private final Handler main = new Handler(Looper.getMainLooper());
    private BroadcastReceiver updates;
    private LocationManager locationManager;
    private LocationListener oneShot;
    private Runnable oneShotTimeout;
    private boolean oneShotSettled;

    @Override
    public void load() {
        updates = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent == null || intent.getAction() == null) {
                    return;
                }
                if (LocationSharingService.ACTION_LOCATION.equals(intent.getAction())) {
                    notifyListeners("location", locationFromIntent(intent), true);
                } else if (LocationSharingService.ACTION_STOPPED.equals(intent.getAction())) {
                    JSObject data = new JSObject();
                    data.put("reason", intent.getStringExtra(LocationSharingService.EXTRA_REASON));
                    notifyListeners("stopped", data, true);
                }
            }
        };
        IntentFilter filter = new IntentFilter();
        filter.addAction(LocationSharingService.ACTION_LOCATION);
        filter.addAction(LocationSharingService.ACTION_STOPPED);
        if (Build.VERSION.SDK_INT >= 33) {
            getContext().registerReceiver(updates, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            getContext().registerReceiver(updates, filter);
        }
    }

    @Override
    protected void handleOnDestroy() {
        cancelOneShot();
        if (updates != null) {
            try {
                getContext().unregisterReceiver(updates);
            } catch (Exception ignored) {
                // Already unregistered.
            }
            updates = null;
        }
        super.handleOnDestroy();
    }

    @PluginMethod
    public void getCurrentPosition(PluginCall call) {
        ensurePermissions(call, "fix");
    }

    @PluginMethod
    public void start(PluginCall call) {
        String sessionId = call.getString("sessionId");
        String origin = LiveTrackServerUrl.normalize(call.getString("origin"));
        if (sessionId == null || !SESSION_ID.matcher(sessionId).matches()) {
            call.reject("A valid sharing session is required before location collection starts.");
            return;
        }
        if (origin == null) {
            call.reject("The LiveTrack server address is invalid.");
            return;
        }
        ensurePermissions(call, "start");
    }

    @PluginMethod
    public void stop(PluginCall call) {
        cancelOneShot();
        LocationSharingService.requestStop(getContext());
        call.resolve();
    }

    @PluginMethod
    public void isActive(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("active", LocationSharingService.isRunning());
        call.resolve(ret);
    }

    /**
     * Reports whether Android still needs the "Allow all the time" prompt.
     * This does not show a system dialog.
     */
    @PluginMethod
    public void backgroundAccess(PluginCall call) {
        JSObject ret = new JSObject();
        if (Build.VERSION.SDK_INT < 29) {
            ret.put("status", "not_required");
        } else if (hasBackgroundLocation()) {
            ret.put("status", "granted");
        } else {
            ret.put("status", "needs_explanation");
        }
        call.resolve(ret);
    }

    /**
     * Shows the system background-location prompt only after the web app has
     * shown the in-app explanation and the user has tapped through it.
     */
    @PluginMethod
    public void requestBackgroundAccess(PluginCall call) {
        if (!Boolean.TRUE.equals(call.getBoolean("explained", false))) {
            call.reject("LiveTrack only asks for background location after you read the in-app explanation.");
            return;
        }
        if (Build.VERSION.SDK_INT < 29 || hasBackgroundLocation()) {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
            return;
        }
        requestPermissionForAlias("backgroundLocation", call, "afterBackgroundPermission");
    }

    @PermissionCallback
    private void afterBackgroundPermission(PluginCall call) {
        if (call == null) {
            return;
        }
        JSObject ret = new JSObject();
        ret.put("granted", hasBackgroundLocation());
        call.resolve(ret);
    }

    @PluginMethod
    public void getServerUrl(PluginCall call) {
        JSObject ret = new JSObject();
        String url = LiveTrackServerUrl.resolve(getContext());
        ret.put("url", url == null ? "" : url);
        ret.put("source", LiveTrackServerUrl.source(getContext()));
        call.resolve(ret);
    }

    @PluginMethod
    public void setServerUrl(PluginCall call) {
        String url = LiveTrackServerUrl.normalize(call.getString("url"));
        if (url == null) {
            call.reject("Enter an http or https URL with a host and no path.");
            return;
        }
        LocationSharingService.requestStop(getContext());
        LiveTrackServerUrl.save(getContext(), url);
        call.resolve();
        main.postDelayed(this::restartApp, 150);
    }

    @PluginMethod
    public void clearServerUrl(PluginCall call) {
        LocationSharingService.requestStop(getContext());
        LiveTrackServerUrl.clear(getContext());
        call.resolve();
        main.postDelayed(this::restartApp, 150);
    }

    @PermissionCallback
    private void afterLocationPermission(PluginCall call) {
        if (call == null) {
            return;
        }
        if (!hasLocationPermission()) {
            call.reject(
                "Location permission was denied. LiveTrack only asks after you choose to share. You can allow it in system settings."
            );
            return;
        }
        if (needsNotificationPermission() && !hasNotificationPermission()) {
            requestPermissionForAlias("notifications", call, "afterNotificationPermission");
            return;
        }
        continueAfterPermissions(call);
    }

    @PermissionCallback
    private void afterNotificationPermission(PluginCall call) {
        if (call == null) {
            return;
        }
        if (needsNotificationPermission() && !hasNotificationPermission()) {
            call.reject(
                "Notification permission was denied. LiveTrack will not share your location without the persistent sharing notification."
            );
            return;
        }
        continueAfterPermissions(call);
    }

    private void ensurePermissions(PluginCall call, String next) {
        call.getData().put("livetrackNext", next);
        if (!hasLocationPermission()) {
            requestPermissionForAlias("location", call, "afterLocationPermission");
            return;
        }
        if (needsNotificationPermission() && !hasNotificationPermission()) {
            requestPermissionForAlias("notifications", call, "afterNotificationPermission");
            return;
        }
        continueAfterPermissions(call);
    }

    private void continueAfterPermissions(PluginCall call) {
        String next = call.getString("livetrackNext", "fix");
        if ("start".equals(next)) {
            beginSharing(call);
        } else {
            fetchSingleFix(call);
        }
    }

    private void beginSharing(PluginCall call) {
        String sessionId = call.getString("sessionId");
        String origin = LiveTrackServerUrl.normalize(call.getString("origin"));
        if (sessionId == null || origin == null || !hasEnabledProvider()) {
            call.reject("Location services are turned off. Enable them in system settings and try again.");
            return;
        }
        try {
            CookieManager.getInstance().flush();
        } catch (Exception ignored) {
            // The service reads cookies again before each request.
        }
        LocationSharingService.start(getContext(), sessionId, origin);
        call.resolve();
    }

    @SuppressLint("MissingPermission")
    private void fetchSingleFix(PluginCall call) {
        if (!hasLocationPermission()) {
            call.reject("Location permission was denied.");
            return;
        }
        locationManager = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
        if (locationManager == null || !hasEnabledProvider()) {
            call.reject("Location services are turned off. Enable them in system settings and try again.");
            return;
        }
        cancelOneShot();
        oneShotSettled = false;
        oneShot = location -> settleOneShot(call, location, null);
        oneShotTimeout = () ->
            settleOneShot(call, null, "Location request timed out. Try again with Location Services on.");
        main.postDelayed(oneShotTimeout, FIX_TIMEOUT_MS);
        boolean requested = false;
        try {
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0L, 0f, oneShot, Looper.getMainLooper());
                requested = true;
            }
            if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0L, 0f, oneShot, Looper.getMainLooper());
                requested = true;
            }
        } catch (SecurityException ex) {
            cancelOneShot();
            call.reject("Location permission was denied.");
            return;
        }
        if (!requested) {
            cancelOneShot();
            call.reject("Location services are turned off. Enable them in system settings and try again.");
        }
    }

    private void settleOneShot(PluginCall call, Location location, String error) {
        if (oneShotSettled) {
            return;
        }
        oneShotSettled = true;
        cancelOneShot();
        if (location != null) {
            call.resolve(locationToJs(location));
        } else {
            call.reject(error == null ? "Location could not be read." : error);
        }
    }

    private void cancelOneShot() {
        if (oneShotTimeout != null) {
            main.removeCallbacks(oneShotTimeout);
            oneShotTimeout = null;
        }
        if (locationManager != null && oneShot != null) {
            try {
                locationManager.removeUpdates(oneShot);
            } catch (Exception ignored) {
                // Provider already stopped.
            }
        }
        oneShot = null;
    }

    private boolean hasBackgroundLocation() {
        if (Build.VERSION.SDK_INT < 29) {
            return true;
        }
        return (
            ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_BACKGROUND_LOCATION) ==
            PackageManager.PERMISSION_GRANTED
        );
    }

    private boolean hasLocationPermission() {
        return (
            ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) ==
                PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_COARSE_LOCATION) ==
                PackageManager.PERMISSION_GRANTED
        );
    }

    private boolean needsNotificationPermission() {
        return Build.VERSION.SDK_INT >= 33;
    }

    private boolean hasNotificationPermission() {
        if (!needsNotificationPermission()) {
            return true;
        }
        return (
            ContextCompat.checkSelfPermission(getContext(), Manifest.permission.POST_NOTIFICATIONS) ==
            PackageManager.PERMISSION_GRANTED
        );
    }

    private boolean hasEnabledProvider() {
        LocationManager manager = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
        if (manager == null) {
            return false;
        }
        try {
            return manager.isProviderEnabled(LocationManager.GPS_PROVIDER) || manager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
        } catch (Exception ex) {
            return false;
        }
    }

    private JSObject locationToJs(Location location) {
        JSObject ret = new JSObject();
        ret.put("lat", location.getLatitude());
        ret.put("lng", location.getLongitude());
        float accuracy = location.hasAccuracy() ? Math.min(Math.max(location.getAccuracy(), 0f), 100_000f) : 0f;
        ret.put("acc", accuracy);
        ret.put("ts", location.getTime() > 0 ? location.getTime() : System.currentTimeMillis());
        if (location.hasAltitude()) {
            ret.put("alt", location.getAltitude());
        }
        if (location.hasSpeed() && location.getSpeed() >= 0f && location.getSpeed() <= 600f) {
            ret.put("spd", location.getSpeed());
        }
        if (location.hasBearing() && location.getBearing() >= 0f && location.getBearing() <= 360f) {
            ret.put("hdg", location.getBearing());
        }
        return ret;
    }

    private JSObject locationFromIntent(Intent intent) {
        JSObject ret = new JSObject();
        ret.put("lat", intent.getDoubleExtra(LocationSharingService.EXTRA_LAT, 0));
        ret.put("lng", intent.getDoubleExtra(LocationSharingService.EXTRA_LNG, 0));
        ret.put("acc", intent.getFloatExtra(LocationSharingService.EXTRA_ACC, 0));
        ret.put("ts", intent.getLongExtra(LocationSharingService.EXTRA_TS, System.currentTimeMillis()));
        if (intent.getBooleanExtra(LocationSharingService.EXTRA_HAS_ALT, false)) {
            ret.put("alt", intent.getDoubleExtra(LocationSharingService.EXTRA_ALT, 0));
        }
        if (intent.getBooleanExtra(LocationSharingService.EXTRA_HAS_SPD, false)) {
            ret.put("spd", intent.getFloatExtra(LocationSharingService.EXTRA_SPD, 0));
        }
        if (intent.getBooleanExtra(LocationSharingService.EXTRA_HAS_HDG, false)) {
            ret.put("hdg", intent.getFloatExtra(LocationSharingService.EXTRA_HDG, 0));
        }
        return ret;
    }

    private void restartApp() {
        Activity activity = getActivity();
        if (activity == null) {
            return;
        }
        Intent intent = new Intent(activity, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        activity.startActivity(intent);
        activity.finish();
    }
}
