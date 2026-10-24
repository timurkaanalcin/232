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
  const iosPlist = readFileSync("mobile/ios/App/App/Info.plist", "utf8");

  it("asks Android for a visible location foreground service and not background location", () => {
    expect(androidManifest).toContain("android.permission.FOREGROUND_SERVICE_LOCATION");
    expect(androidManifest).toContain("android.permission.ACCESS_FINE_LOCATION");
    expect(androidManifest).toContain("android.permission.POST_NOTIFICATIONS");
    expect(androidManifest).toContain("LocationSharingService");
    expect(androidManifest).toContain("StopSharingReceiver");
    expect(androidManifest).not.toContain("ACCESS_BACKGROUND_LOCATION");
    expect(androidManifest).not.toContain("RECEIVE_BOOT_COMPLETED");
    expect(androidManifest).not.toContain("REQUEST_IGNORE_BATTERY_OPTIMIZATIONS");
  });

  it("asks iOS for when-in-use location and not always-on location", () => {
    expect(iosPlist).toContain("NSLocationWhenInUseUsageDescription");
    expect(iosPlist).not.toContain("NSLocationAlwaysAndWhenInUseUsageDescription");
    expect(iosPlist).not.toContain("NSLocationAlwaysUsageDescription");
    expect(iosPlist).not.toContain("UIBackgroundModes");
  });
});
