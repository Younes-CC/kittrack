import { NextRequest, NextResponse } from "next/server";
import { listCategories, createCategory } from "@/lib/repo";

export async function GET() {
  return NextResponse.json(listCategories());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body?.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name ist erforderlich" }, { status: 400 });
  }
  const category = createCategory(body.name.trim());
  return NextResponse.json(category, { status: 201 });
}
