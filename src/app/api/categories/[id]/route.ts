import { NextRequest, NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@/lib/repo";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/categories/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json();
  try {
    updateCategory(id, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/categories/[id]">) {
  const { id } = await ctx.params;
  deleteCategory(id);
  return NextResponse.json({ ok: true });
}
