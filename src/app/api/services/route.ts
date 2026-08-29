import { NextRequest, NextResponse } from "next/server";
import { listServices, createService } from "@/lib/repo";

export async function GET() {
  return NextResponse.json(listServices());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body?.name || !body?.category_id || !body?.duration_minutes || body?.price_cents == null) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }
  const service = createService({
    category_id: body.category_id,
    name: body.name,
    description: body.description ?? "",
    duration_minutes: Number(body.duration_minutes),
    price_cents: Number(body.price_cents),
  });
  return NextResponse.json(service, { status: 201 });
}
