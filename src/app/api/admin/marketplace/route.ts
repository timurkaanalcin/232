import { NextResponse } from "next/server";
import { marketplaceStats } from "@/data/store";

export async function GET() {
  return NextResponse.json(marketplaceStats());
}
