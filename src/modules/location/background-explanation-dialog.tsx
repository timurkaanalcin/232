"use client";

import { MapPinIcon, ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Shown only after the user taps Start sharing, and only before Android's
 * "Allow all the time" prompt. Skipping does not open that system prompt.
 */
export function BackgroundExplanationDialog({
  open,
  onOpenChange,
  onAllow,
  onSkip,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAllow: () => void;
  onSkip: () => void;
  busy: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keep sharing when the screen is locked</DialogTitle>
          <DialogDescription>
            This stays off until you start it. Android will ask for location all the time only if you
            choose Allow all the time below.
          </DialogDescription>
        </DialogHeader>

        <ul className="grid gap-3">
          <li className="flex gap-3 rounded-lg border p-3">
            <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">What continues</p>
              <p className="text-sm text-muted-foreground">
                While a session you started is on, LiveTrack keeps sending your position to the people
                you invited, including when the app is in the background or the screen is locked.
              </p>
            </div>
          </li>
          <li className="flex gap-3 rounded-lg border p-3">
            <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">What you will see</p>
              <p className="text-sm text-muted-foreground">
                A notification stays on screen the whole time: “LiveTrack is sharing your location”,
                with Stop sharing. You can also stop from the button in the app. Nothing starts on
                its own, and the app icon stays LiveTrack.
              </p>
            </div>
          </li>
        </ul>

        <p className="text-sm text-muted-foreground">
          Allow all the time is what Android calls background location. Not now still starts sharing
          with the notification. On some phones, updates then pause when the screen locks until you
          allow location all the time in system settings.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onSkip} disabled={busy}>
            Not now
          </Button>
          <Button onClick={onAllow} disabled={busy}>
            {busy ? "Starting…" : "Allow all the time"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
