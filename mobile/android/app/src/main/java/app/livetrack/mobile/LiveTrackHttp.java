package app.livetrack.mobile;

import android.util.Log;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/** Posts consented location updates with the WebView session cookie. */
final class LiveTrackHttp {
    private static final String TAG = "LiveTrack";

    private LiveTrackHttp() {}

    static void postJson(String url, String origin, String cookie, String json) {
        HttpURLConnection connection = null;
        try {
            connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setConnectTimeout(10_000);
            connection.setReadTimeout(15_000);
            connection.setRequestMethod("POST");
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Accept", "application/json");
            connection.setRequestProperty("Origin", origin);
            connection.setRequestProperty("User-Agent", "LiveTrackAndroid/1.0");
            if (cookie != null && !cookie.isEmpty()) {
                connection.setRequestProperty("Cookie", cookie);
            }
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            try (OutputStream out = connection.getOutputStream()) {
                out.write(bytes);
            }
            int code = connection.getResponseCode();
            if (code >= 400) {
                Log.w(TAG, "Request to " + url + " failed with HTTP " + code);
            }
        } catch (Exception ex) {
            Log.w(TAG, "Request to " + url + " failed", ex);
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
}
