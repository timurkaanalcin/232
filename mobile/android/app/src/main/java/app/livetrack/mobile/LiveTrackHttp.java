package app.livetrack.mobile;

import android.util.Log;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/** Posts consented location updates with the WebView session cookie. Never logs coordinates. */
final class LiveTrackHttp {
    private static final String TAG = "LiveTrack";

    private LiveTrackHttp() {}

    /**
     * @return HTTP status, or -1 when the server could not be reached.
     */
    static int postJson(String url, String origin, String cookie, String json) {
        HttpURLConnection connection = null;
        try {
            connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setConnectTimeout(10_000);
            connection.setReadTimeout(20_000);
            connection.setInstanceFollowRedirects(false);
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
                Log.w(TAG, "Request failed with HTTP " + code);
            }
            return code;
        } catch (Exception ex) {
            Log.w(TAG, "Request failed: server unreachable");
            return -1;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
}
