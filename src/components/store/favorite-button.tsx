"use client";

import { useEffect, useState } from "react";
import { HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const KEY = "pista-favorites";

export function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function FavoriteButton({ vehicleId }: { vehicleId: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readFavorites().includes(vehicleId));
  }, [vehicleId]);

  function toggle() {
    const current = readFavorites();
    const next = current.includes(vehicleId) ? current.filter((id) => id !== vehicleId) : [...current, vehicleId];
    localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(next.includes(vehicleId));
  }

  return (
    <Button type="button" variant={saved ? "default" : "outline"} onClick={toggle}>
      <HeartIcon className={saved ? "fill-current" : ""} />
      {saved ? "Favoride" : "Favorile"}
    </Button>
  );
}
