import { NextRequest, NextResponse } from "next/server";
import { listCustomers, createCustomer } from "@/lib/repo";

export async function GET() {
  return NextResponse.json(listCustomers());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body?.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name ist erforderlich" }, { status: 400 });
  }
  const customer = createCustomer({
    name: body.name.trim(),
    phone: body.phone,
    email: body.email,
    notes: body.notes,
  });
  return NextResponse.json(customer, { status: 201 });
}
