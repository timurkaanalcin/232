package app.livetrack.mobile;

import android.app.Activity;
import android.app.Application;
import android.os.Bundle;

/** Tracks whether a LiveTrack activity is started, so background updates use the native HTTP path. */
public final class LiveTrackVisibility implements Application.ActivityLifecycleCallbacks {
    private static int startedActivities;
    private static boolean installed;

    private LiveTrackVisibility() {}

    public static void install(Application application) {
        if (installed) {
            return;
        }
        installed = true;
        application.registerActivityLifecycleCallbacks(new LiveTrackVisibility());
    }

    public static boolean inForeground() {
        return startedActivities > 0;
    }

    @Override
    public void onActivityStarted(Activity activity) {
        startedActivities++;
    }

    @Override
    public void onActivityStopped(Activity activity) {
        startedActivities = Math.max(0, startedActivities - 1);
    }

    @Override
    public void onActivityCreated(Activity activity, Bundle savedInstanceState) {}

    @Override
    public void onActivityResumed(Activity activity) {}

    @Override
    public void onActivityPaused(Activity activity) {}

    @Override
    public void onActivitySaveInstanceState(Activity activity, Bundle outState) {}

    @Override
    public void onActivityDestroyed(Activity activity) {}
}
