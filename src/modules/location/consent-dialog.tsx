"use client";

import { useState } from "react";
import { EyeIcon, MapPinIcon, ShieldCheckIcon, TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CONSENT_POINTS = [
  {
    icon: MapPinIcon,
    title: "What is collected",
    text: "Your GPS coordinates, accuracy, speed and heading, with timestamps - only while a session is active.",
  },
  {
    icon: EyeIcon,
    title: "Who can see it",
    text: "Authorized staff (operators and administrators) on the live map. Every staff view of your session is audit-logged.",
  },
  {
    icon: TimerIcon,
    title: "When it stops",
    text: "The moment you press Stop, when you sign out, or automatically after 5 minutes without updates.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Your rights",
    text: "You can stop at any time, export all of your data, and permanently delete your account and history (GDPR/KVKK).",
  },
];

export function ConsentDialog({
  open,
  onOpenChange,
  onConfirm,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (label: string) => void;
  busy: boolean;
}) {
  const [accepted, setAccepted] = useState(false);
  const [label, setLabel] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (!next) setAccepted(false);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share your live location</DialogTitle>
          <DialogDescription>
            LiveTrack only ever tracks you with your explicit consent. Please review what sharing means
            before you start.
          </DialogDescription>
        </DialogHeader>

        <ul className="grid gap-3">
          {CONSENT_POINTS.map((point) => (
            <li key={point.title} className="flex gap-3 rounded-lg border p-3">
              <point.icon className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">{point.title}</p>
                <p className="text-sm text-muted-foreground">{point.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="grid gap-2">
          <Label htmlFor="session-label">Session label (optional)</Label>
          <Input
            id="session-label"
            placeholder="e.g. Field visit, Delivery run"
            value={label}
            maxLength={80}
            onChange={(event) => setLabel(event.target.value)}
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-primary/40 bg-accent/40 p-3">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-0.5 size-4 accent-[var(--color-primary)]"
          />
          <span className="text-sm">
            I explicitly consent to sharing my real-time location as described above. I understand I can
            revoke this at any time by pressing <strong>Stop sharing</strong>.
          </span>
        </label>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(label)} disabled={!accepted || busy}>
            {busy ? "Starting…" : "Start sharing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
