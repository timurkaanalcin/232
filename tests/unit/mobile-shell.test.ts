import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { positionFromNativeFix } from "@/lib/normalize-position";
import { normalizeServerUrl } from "@/lib/server-url";

describe("normalizeServerUrl", () => {
  it("keeps an http or https origin", () => {
    expect(normalizeServerUrl(" https://livetrack.example.com/ ")).toBe("https://livetrack.example.com");
    expect(normalizeServerUrl("http://10.0.2.2:3000")).toBe("http://10.0.2.2:3000");
  });

  it("rejects credentials, paths, queries, and non-http schemes", () => {
    expect(normalizeServerUrl("https://user:pass@livetrack.example.com")).toBeNull();
    expect(normalizeServerUrl("https://livetrack.example.com/dashboard")).toBeNull();
    expect(normalizeServerUrl("https://livetrack.example.com?next=/admin")).toBeNull();
    expect(normalizeServerUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeServerUrl("file:///etc/passwd")).toBeNull();
    expect(normalizeServerUrl("")).toBeNull();
  });
});

describe("positionFromNativeFix", () => {
  it("maps a native fix onto the shared position payload", () => {
    expect(
      positionFromNativeFix({
        lat: 41.01,
        lng: 29.02,
        acc: 12,
        alt: 40,
        spd: 3,
        hdg: 90,
        ts: 1_700_000_000_000,
      }),
    ).toEqual({
      t: "pos",
      lat: 41.01,
      lng: 29.02,
      acc: 12,
      alt: 40,
      spd: 3,
      hdg: 90,
      ts: 1_700_000_000_000,
    });
  });

  it("drops impossible speed and heading and clamps accuracy", () => {
    const position = positionFromNativeFix({
      lat: 1,
      lng: 2,
      acc: 500_000,
      spd: -1,
      hdg: 400,
      ts: 10,
    });
    expect(position.acc).toBe(100_000);
    expect(position.spd).toBeNull();
    expect(position.hdg).toBeNull();
    expect(position.alt).toBeNull();
  });
});

describe("mobile shell privacy boundaries", () => {
  const androidManifest = readFileSync("mobile/android/app/src/main/AndroidManifest.xml", "utf8");
  const androidPlugin = readFileSync(
    "mobile/android/app/src/main/java/app/livetrack/mobile/LiveTrackPlugin.java",
    "utf8",
  );
  const androidService = readFileSync(
    "mobile/android/app/src/main/java/app/livetrack/mobile/LocationSharingService.java",
    "utf8",
  );
  const iosPlist = readFileSync("mobile/ios/App/App/Info.plist", "utf8");
  const iosPlugin = readFileSync("mobile/ios/App/App/LiveTrackPlugin.swift", "utf8");

  it("keeps Android sharing visible and asks for background location only after an explanation", () => {
    expect(androidManifest).toContain("android.permission.FOREGROUND_SERVICE_LOCATION");
    expect(androidManifest).toContain('android:foregroundServiceType="location"');
    expect(androidManifest).toContain("android.permission.ACCESS_FINE_LOCATION");
    expect(androidManifest).toContain("android.permission.ACCESS_BACKGROUND_LOCATION");
    expect(androidManifest).toContain("android.permission.POST_NOTIFICATIONS");
    expect(androidManifest).toContain("LocationSharingService");
    expect(androidManifest).toContain("StopSharingReceiver");
    expect(androidManifest).not.toContain("RECEIVE_BOOT_COMPLETED");
    expect(androidManifest).not.toContain("REQUEST_IGNORE_BATTERY_OPTIMIZATIONS");
    expect(androidPlugin).toContain("in-app explanation");
    expect(androidPlugin).toContain('call.getBoolean("explained", false)');
    expect(androidService).toContain("MIN_DISTANCE_METERS");
    expect(androidService).toContain("HEARTBEAT_MS");
    expect(androidService).toContain("START_NOT_STICKY");
    expect(androidService).not.toContain("RECEIVE_BOOT_COMPLETED");
  });

  it("keeps iOS background sharing visible and does not request Always", () => {
    expect(iosPlist).toContain("NSLocationWhenInUseUsageDescription");
    expect(iosPlist).toContain("NSLocationAlwaysAndWhenInUseUsageDescription");
    expect(iosPlist).toContain("UIBackgroundModes");
    expect(iosPlist).toContain("<string>location</string>");
    expect(iosPlist).not.toContain("NSLocationAlwaysUsageDescription");
    expect(iosPlugin).toContain("showsBackgroundLocationIndicator = true");
    expect(iosPlugin).toContain("allowsBackgroundLocationUpdates = true");
    expect(iosPlugin).toContain("requestWhenInUseAuthorization");
    expect(iosPlugin).not.toContain("requestAlwaysAuthorization");
    expect(iosPlugin).toContain("sharingDistanceFilter");
  });
});
