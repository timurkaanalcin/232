import type { CapacitorConfig } from "@capacitor/cli";

/**
 * The WebView loads either the local setup screen (`www/`) or a server URL
 * chosen at build time / on first launch. The URL is applied by native code
 * before the bridge starts — see LiveTrackServerUrl on Android and iOS.
 * Do not set `server.url` here; a baked-in URL would hide the setup screen
 * and ignore a later change from Settings.
 */
const config: CapacitorConfig = {
  appId: "app.livetrack.mobile",
  appName: "LiveTrack",
  webDir: "www",
  server: {
    androidScheme: "https",
  },
  android: {
    // The shell is the LiveTrack app. Mixed content stays off.
    allowMixedContent: false,
  },
  ios: {
    // Scroll/content inset is handled by the web app's safe-area CSS.
    contentInset: "never",
  },
};

export default config;
