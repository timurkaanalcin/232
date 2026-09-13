package com.canlisite.app;

import android.Manifest;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.BridgeActivity;
import java.util.ArrayList;

/**
 * Capacitor host. Runtime location / notification prompts are never issued in onCreate.
 * The web first-launch screen calls CanlisiteNative after the user accepts each item.
 */
public class MainActivity extends BridgeActivity {
  private static final int RUNTIME_PERMISSIONS_REQUEST = 7101;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Do not request ACCESS_* or POST_NOTIFICATIONS here.
  }

  @Override
  public void onStart() {
    super.onStart();
    if (getBridge() != null && getBridge().getWebView() != null) {
      getBridge().getWebView().addJavascriptInterface(new FirstLaunchBridge(), "CanlisiteNative");
    }
  }

  public class FirstLaunchBridge {
    @JavascriptInterface
    public void requestAcceptedPermissions(final boolean location, final boolean notifications) {
      runOnUiThread(
          new Runnable() {
            @Override
            public void run() {
              ArrayList<String> perms = new ArrayList<>();
              if (location) {
                perms.add(Manifest.permission.ACCESS_FINE_LOCATION);
                perms.add(Manifest.permission.ACCESS_COARSE_LOCATION);
              }
              if (notifications && Build.VERSION.SDK_INT >= 33) {
                perms.add(Manifest.permission.POST_NOTIFICATIONS);
              }
              if (perms.isEmpty()) {
                return;
              }
              ActivityCompat.requestPermissions(
                  MainActivity.this, perms.toArray(new String[0]), RUNTIME_PERMISSIONS_REQUEST);
            }
          });
    }
  }
}
