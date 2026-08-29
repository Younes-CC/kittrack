import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAvailableSlots } from "@/lib/availability";
import { getSettings, listStaff } from "@/lib/repo";
import type { Service } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");
  const staffId = searchParams.get("staffId");

  if (!date || !serviceId) {
    return NextResponse.json({ error: "date und serviceId erforderlich" }, { status: 400 });
  }

  const service = db.prepare("SELECT * FROM services WHERE id = ?").get(serviceId) as Service | undefined;
  if (!service) return NextResponse.json({ error: "Leistung nicht gefunden" }, { status: 404 });

  const settings = getSettings();

  const staffIds = staffId ? [staffId] : listStaff().filter((s) => s.active).map((s) => s.id);

  const result: Record<string, string[]> = {};
  for (const id of staffIds) {
    result[id] = getAvailableSlots({
      date,
      staffId: id,
      durationMinutes: service.duration_minutes,
      openingHours: settings.opening_hours,
      slotMinutes: settings.slot_minutes,
    });
  }

  return NextResponse.json(result);
}
