import { NextResponse } from "next/server";
import { listCenters } from "@/data/store";

export async function GET() {
  return NextResponse.json(listCenters());
}
