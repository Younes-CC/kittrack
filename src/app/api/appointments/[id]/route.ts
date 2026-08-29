import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAppointment, updateAppointment, deleteAppointment, hasOverlap } from "@/lib/repo";
import { timeToMinutes, minutesToTime } from "@/lib/format";
import type { Service, Appointment } from "@/lib/types";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/appointments/[id]">) {
  const { id } = await ctx.params;
  const appointment = getAppointment(id);
  if (!appointment) return NextResponse.json({ error: "Termin nicht gefunden" }, { status: 404 });
  return NextResponse.json(appointment);
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/appointments/[id]">) {
  const { id } = await ctx.params;
  const current = db.prepare("SELECT * FROM appointments WHERE id = ?").get(id) as Appointment | undefined;
  if (!current) return NextResponse.json({ error: "Termin nicht gefunden" }, { status: 404 });

  const body = await request.json();
  const staffId = body.staffId ?? current.staff_id;
  const serviceId = body.serviceId ?? current.service_id;
  const date = body.date ?? current.date;
  const startTime = body.startTime ?? current.start_time;

  let endTime = current.end_time;
  if (body.startTime || body.serviceId) {
    const service = db.prepare("SELECT * FROM services WHERE id = ?").get(serviceId) as Service | undefined;
    if (!service) return NextResponse.json({ error: "Leistung nicht gefunden" }, { status: 404 });
    endTime = minutesToTime(timeToMinutes(startTime) + service.duration_minutes);
  }

  if (body.startTime || body.staffId || body.date || body.serviceId) {
    if (hasOverlap({ staffId, date, startTime, endTime, excludeId: id })) {
      return NextResponse.json(
        { error: "Dieser Mitarbeiter hat zu dieser Zeit bereits einen Termin." },
        { status: 409 }
      );
    }
  }

  updateAppointment(id, {
    customer_id: body.customerId ?? current.customer_id,
    customer_name: body.customerName ?? current.customer_name,
    customer_phone: body.customerPhone ?? current.customer_phone,
    staff_id: staffId,
    service_id: serviceId,
    date,
    start_time: startTime,
    end_time: endTime,
    status: body.status ?? current.status,
    notes: body.notes ?? current.notes,
    source: current.source,
  });

  return NextResponse.json(getAppointment(id));
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/appointments/[id]">) {
  const { id } = await ctx.params;
  deleteAppointment(id);
  return NextResponse.json({ ok: true });
}
