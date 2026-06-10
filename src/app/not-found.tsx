import Link from "next/link";
import { MapPinOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
        <MapPinOffIcon className="size-7" />
      </div>
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t find that page. It may have moved or never existed.
      </p>
      <Button asChild>
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
