import { db } from "@/lib/db";
import { weekdayKeyForDate, timeToMinutes, minutesToTime } from "@/lib/format";
import type { OpeningHours } from "@/lib/types";

type BusyRange = { start: number; end: number };

/**
 * Available start times (HH:MM) for a service of `durationMinutes` on `date`,
 * for the given staff member, respecting opening hours and existing bookings.
 * Slots in the past (for today) are excluded.
 */
export function getAvailableSlots(params: {
  date: string;
  staffId: string;
  durationMinutes: number;
  openingHours: OpeningHours;
  slotMinutes: number;
  excludeAppointmentId?: string;
}): string[] {
  const { date, staffId, durationMinutes, openingHours, slotMinutes, excludeAppointmentId } = params;

  const weekday = weekdayKeyForDate(new Date(`${date}T00:00:00`));
  const dayHours = openingHours[weekday];
  if (!dayHours || dayHours.closed) return [];

  const dayStart = timeToMinutes(dayHours.open);
  const dayEnd = timeToMinutes(dayHours.close);

  const rows = db
    .prepare(
      `SELECT start_time, end_time FROM appointments
       WHERE staff_id = ? AND date = ? AND status != 'storniert'
       ${excludeAppointmentId ? "AND id != ?" : ""}`
    )
    .all(
      ...(excludeAppointmentId ? [staffId, date, excludeAppointmentId] : [staffId, date])
    ) as { start_time: string; end_time: string }[];

  const busy: BusyRange[] = rows.map((r) => ({
    start: timeToMinutes(r.start_time),
    end: timeToMinutes(r.end_time),
  }));

  const now = new Date();
  const isToday = date === now.toISOString().slice(0, 10);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots: string[] = [];
  for (let start = dayStart; start + durationMinutes <= dayEnd; start += slotMinutes) {
    if (isToday && start <= nowMinutes) continue;
    const end = start + durationMinutes;
    const overlaps = busy.some((b) => start < b.end && end > b.start);
    if (!overlaps) slots.push(minutesToTime(start));
  }
  return slots;
}
