package app.livetrack.mobile;

import android.content.Context;
import android.net.Uri;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

/**
 * Resolves the LiveTrack web origin the shell should load.
 * A URL saved on device wins over the optional build-time file.
 * Values that are not plain http(s) origins are ignored.
 */
public final class LiveTrackServerUrl {
    public static final String PREFS = "livetrack";
    public static final String KEY_URL = "server_url";
    static final String ASSET = "livetrack_server_url.txt";

    private LiveTrackServerUrl() {}

    public static String normalize(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        Uri uri = Uri.parse(trimmed);
        String scheme = uri.getScheme();
        if (!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)) {
            return null;
        }
        String host = uri.getHost();
        if (host == null || host.isEmpty()) {
            return null;
        }
        String userInfo = uri.getUserInfo();
        if (userInfo != null && !userInfo.isEmpty()) {
            return null;
        }
        String path = uri.getPath();
        if (path != null && !path.isEmpty() && !"/".equals(path)) {
            return null;
        }
        if (uri.getQuery() != null || uri.getFragment() != null) {
            return null;
        }
        int port = uri.getPort();
        String authority = port == -1 ? host : host + ":" + port;
        return scheme.toLowerCase() + "://" + authority;
    }

    public static String readOverride(Context context) {
        return normalize(context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_URL, null));
    }

    public static String readBaked(Context context) {
        try (
            InputStream in = context.getAssets().open(ASSET);
            BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))
        ) {
            return normalize(reader.readLine());
        } catch (Exception ex) {
            return null;
        }
    }

    /** User override, otherwise the URL written at build time, otherwise null (setup screen). */
    public static String resolve(Context context) {
        String override = readOverride(context);
        if (override != null) {
            return override;
        }
        return readBaked(context);
    }

    public static String source(Context context) {
        if (readOverride(context) != null) {
            return "user";
        }
        if (readBaked(context) != null) {
            return "build";
        }
        return "none";
    }

    public static void save(Context context, String url) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY_URL, url).apply();
    }

    public static void clear(Context context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().remove(KEY_URL).apply();
    }
}
