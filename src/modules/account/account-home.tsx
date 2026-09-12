"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountHome({ name }: { name: string }) {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Merhaba{name ? `, ${name}` : ""}</h1>
        <p className="text-sm text-muted-foreground">Rezervasyon, değerleme ve favorilerinizi buradan takip edin.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Stok</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/araclar">Araçları incele</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Satış</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/sat">Değerleme al</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Favoriler</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/favoriler">Kayıtlı ilanlar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
