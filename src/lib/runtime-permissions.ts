import { requestCurrentPosition } from "@/lib/geolocation-permission";
import type { FirstLaunchChoices } from "@/lib/first-launch-consent";

/**
 * Ask the OS/browser only for items the user already accepted in-app.
 * Does not start a LiveTrack session and does not upload coordinates.
 */
export async function requestAcceptedRuntimePermissions(choices: FirstLaunchChoices): Promise<void> {
  if (typeof window === "undefined") return;

  window.CanlisiteNative?.requestAcceptedPermissions?.(choices.location, choices.notifications);

  if (choices.notifications && "Notification" in window && Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch {
      /* private mode / unsupported */
    }
  }

  if (choices.location && navigator.geolocation) {
    try {
      await requestCurrentPosition();
    } catch {
      /* OS dialog denied or unavailable — in-app choice is still stored */
    }
  }
}
