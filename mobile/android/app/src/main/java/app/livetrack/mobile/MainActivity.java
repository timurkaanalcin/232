package app.livetrack.mobile;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.CapConfig;
import com.getcapacitor.Logger;
import java.lang.reflect.Field;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LiveTrackPlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    protected void load() {
        LiveTrackVisibility.install(getApplication());
        applyServerUrl();
        super.load();
    }

    /**
     * Points the WebView at the user's LiveTrack server before the bridge loads.
     * Capacitor keeps every other setting from capacitor.config.json.
     */
    private void applyServerUrl() {
        String serverUrl = LiveTrackServerUrl.resolve(this);
        if (serverUrl == null) {
            return;
        }
        CapConfig defaults = CapConfig.loadDefault(this);
        try {
            Field field = CapConfig.class.getDeclaredField("serverUrl");
            field.setAccessible(true);
            field.set(defaults, serverUrl);
            this.config = defaults;
        } catch (ReflectiveOperationException ex) {
            Logger.error("Could not apply the LiveTrack server URL. The setup screen will be used.", ex);
        }
    }
}
