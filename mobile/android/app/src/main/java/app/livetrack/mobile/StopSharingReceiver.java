package app.livetrack.mobile;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Notification action and dismiss path. Stops sharing; never starts it. */
public class StopSharingReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !LocationSharingService.ACTION_STOP.equals(intent.getAction())) {
            return;
        }
        if (!LocationSharingService.isRunning()) {
            return;
        }
        Intent stop = new Intent(context, LocationSharingService.class);
        stop.setAction(LocationSharingService.ACTION_STOP);
        context.startService(stop);
    }
}
