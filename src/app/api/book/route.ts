import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAppointment, findCustomerByPhone, createCustomer, getSettings } from "@/lib/repo";
import { getAvailableSlots } from "@/lib/availability";
import { timeToMinutes, minutesToTime } from "@/lib/format";
import type { Service, Staff } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { serviceId, staffId, date, startTime, name, phone, email } = body;

  if (!serviceId || !staffId || !date || !startTime || !name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Bitte alle Pflichtfelder ausfüllen." }, { status: 400 });
  }

  const service = db.prepare("SELECT * FROM services WHERE id = ?").get(serviceId) as Service | undefined;
  const staff = db.prepare("SELECT * FROM staff WHERE id = ?").get(staffId) as Staff | undefined;
  if (!service || !staff) {
    return NextResponse.json({ error: "Leistung oder Mitarbeiter nicht gefunden." }, { status: 404 });
  }

  const endTime = minutesToTime(timeToMinutes(startTime) + service.duration_minutes);

  const settings = getSettings();
  const availableSlots = getAvailableSlots({
    date,
    staffId,
    durationMinutes: service.duration_minutes,
    openingHours: settings.opening_hours,
    slotMinutes: settings.slot_minutes,
  });
  if (!availableSlots.includes(startTime)) {
    return NextResponse.json(
      { error: "Dieser Termin ist leider gerade nicht mehr verfügbar. Bitte wähle eine andere Zeit." },
      { status: 409 }
    );
  }

  let customer = findCustomerByPhone(phone.trim());
  if (!customer) {
    customer = createCustomer({ name: name.trim(), phone: phone.trim(), email: email?.trim() ?? "" });
  }

  const appointment = createAppointment({
    customer_id: customer.id,
    customer_name: customer.name,
    customer_phone: customer.phone,
    staff_id: staffId,
    service_id: serviceId,
    date,
    start_time: startTime,
    end_time: endTime,
    status: "bestaetigt",
    notes: "",
    source: "online",
  });

  return NextResponse.json(
    {
      appointment,
      serviceName: service.name,
      staffName: staff.name,
    },
    { status: 201 }
  );
}
