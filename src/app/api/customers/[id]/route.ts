import { NextRequest, NextResponse } from "next/server";
import { getCustomer, updateCustomer, deleteCustomer, listAppointmentsByCustomer } from "@/lib/repo";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/customers/[id]">) {
  const { id } = await ctx.params;
  const customer = getCustomer(id);
  if (!customer) return NextResponse.json({ error: "Kunde nicht gefunden" }, { status: 404 });
  const appointments = listAppointmentsByCustomer(id);
  return NextResponse.json({ ...customer, appointments });
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/customers/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json();
  try {
    updateCustomer(id, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/customers/[id]">) {
  const { id } = await ctx.params;
  deleteCustomer(id);
  return NextResponse.json({ ok: true });
}
