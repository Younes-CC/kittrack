import { NextRequest, NextResponse } from "next/server";
import { listStaff, createStaff } from "@/lib/repo";

export async function GET() {
  return NextResponse.json(listStaff());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body?.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name ist erforderlich" }, { status: 400 });
  }
  const staff = createStaff({ name: body.name.trim(), role: body.role, color: body.color });
  return NextResponse.json(staff, { status: 201 });
}
