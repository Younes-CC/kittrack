import { NextRequest, NextResponse } from "next/server";
import { updateService, deleteService } from "@/lib/repo";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/services/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json();
  try {
    updateService(id, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/services/[id]">) {
  const { id } = await ctx.params;
  deleteService(id);
  return NextResponse.json({ ok: true });
}
