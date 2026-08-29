import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/repo";

export async function GET() {
  return NextResponse.json(getSettings());
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const next = updateSettings(body);
  return NextResponse.json(next);
}
