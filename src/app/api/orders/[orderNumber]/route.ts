import { NextResponse } from "next/server";
import { getPublicOrderSummary } from "@/lib/orders";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const order = await getPublicOrderSummary(orderNumber);

  if (!order) {
    return NextResponse.json({ error: "Bestellung nicht gefunden." }, { status: 404 });
  }

  return NextResponse.json({ order });
}
