import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  listAppointmentsByDate,
  listAppointmentsByRange,
  createAppointment,
  hasOverlap,
  findCustomerByPhone,
  createCustomer,
} from "@/lib/repo";
import { timeToMinutes, minutesToTime } from "@/lib/format";
import type { Service } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (date) return NextResponse.json(listAppointmentsByDate(date));
  if (from && to) return NextResponse.json(listAppointmentsByRange(from, to));
  return NextResponse.json({ error: "date oder from/to erforderlich" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { staffId, serviceId, date, startTime, status, notes } = body;

  if (!staffId || !serviceId || !date || !startTime) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }

  const service = db.prepare("SELECT * FROM services WHERE id = ?").get(serviceId) as Service | undefined;
  if (!service) return NextResponse.json({ error: "Leistung nicht gefunden" }, { status: 404 });

  const endTime = minutesToTime(timeToMinutes(startTime) + service.duration_minutes);

  if (hasOverlap({ staffId, date, startTime, endTime })) {
    return NextResponse.json(
      { error: "Dieser Mitarbeiter hat zu dieser Zeit bereits einen Termin." },
      { status: 409 }
    );
  }

  let customerId: string | null = body.customerId ?? null;
  let customerName: string = body.customerName ?? "";
  const customerPhone: string = body.customerPhone ?? "";

  if (!customerId && customerPhone) {
    const existing = findCustomerByPhone(customerPhone);
    if (existing) {
      customerId = existing.id;
      customerName = existing.name;
    }
  }

  if (!customerId && customerName) {
    const created = createCustomer({ name: customerName, phone: customerPhone });
    customerId = created.id;
  }

  const appointment = createAppointment({
    customer_id: customerId,
    customer_name: customerName,
    customer_phone: customerPhone,
    staff_id: staffId,
    service_id: serviceId,
    date,
    start_time: startTime,
    end_time: endTime,
    status: status ?? "bestaetigt",
    notes: notes ?? "",
    source: "intern",
  });

  return NextResponse.json(appointment, { status: 201 });
}
