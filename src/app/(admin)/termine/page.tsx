"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { btnPrimary, btnSecondary, STATUS_STYLES } from "@/components/ui";
import AppointmentModal from "@/components/AppointmentModal";
import { addDaysISO, formatDateLong, timeToMinutes, todayISO, weekdayKeyForDate } from "@/lib/format";
import type {
  AppointmentWithRelations,
  Category,
  Customer,
  OpeningHours,
  Service,
  Staff,
} from "@/lib/types";

const HOUR_HEIGHT = 64; // px per hour
const PPM = HOUR_HEIGHT / 60;

export default function TerminePage() {
  const [date, setDate] = useState(todayISO());
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHours | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalState, setModalState] = useState<
    | { mode: "closed" }
    | { mode: "create"; staffId?: string; startTime?: string }
    | { mode: "edit"; appointment: AppointmentWithRelations }
  >({ mode: "closed" });

  const loadStatic = useCallback(async () => {
    const [staffRes, servicesRes, categoriesRes, customersRes, settingsRes] = await Promise.all([
      fetch("/api/staff"),
      fetch("/api/services"),
      fetch("/api/categories"),
      fetch("/api/customers"),
      fetch("/api/settings"),
    ]);
    setStaff((await staffRes.json()).filter((s: Staff) => s.active));
    setServices(await servicesRes.json());
    setCategories(await categoriesRes.json());
    setCustomers(await customersRes.json());
    const settings = await settingsRes.json();
    setOpeningHours(settings.opening_hours);
  }, []);

  const loadAppointments = useCallback(async (forDate: string) => {
    const res = await fetch(`/api/appointments?date=${forDate}`);
    setAppointments(await res.json());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    setLoading(true);
    Promise.all([loadStatic(), loadAppointments(date)]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch when the selected date changes
    loadAppointments(date);
  }, [date, loadAppointments]);

  const dayHours = openingHours ? openingHours[weekdayKeyForDate(new Date(`${date}T00:00:00`))] : null;
  const dayStartMin = dayHours && !dayHours.closed ? timeToMinutes(dayHours.open) : 8 * 60;
  const dayEndMin = dayHours && !dayHours.closed ? timeToMinutes(dayHours.close) : 20 * 60;

  const hourMarks = useMemo(() => {
    const marks: number[] = [];
    const startHour = Math.floor(dayStartMin / 60);
    const endHour = Math.ceil(dayEndMin / 60);
    for (let h = startHour; h <= endHour; h++) marks.push(h);
    return marks;
  }, [dayStartMin, dayEndMin]);

  const totalHeight = (dayEndMin - dayStartMin) * PPM;

  const halfHourSlots = useMemo(() => {
    const slots: number[] = [];
    for (let m = dayStartMin; m < dayEndMin; m += 30) slots.push(m);
    return slots;
  }, [dayStartMin, dayEndMin]);

  function closeModal() {
    setModalState({ mode: "closed" });
  }

  function handleSaved() {
    closeModal();
    loadAppointments(date);
    loadStatic();
  }

  const isClosedToday = dayHours?.closed;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink">Termine</h1>
          <p className="mt-1 text-sm text-ink-soft">{formatDateLong(date)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className={btnSecondary} onClick={() => setDate(addDaysISO(date, -1))} aria-label="Vorheriger Tag">
            <ChevronLeft size={16} />
          </button>
          <input
            type="date"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button className={btnSecondary} onClick={() => setDate(addDaysISO(date, 1))} aria-label="Nächster Tag">
            <ChevronRight size={16} />
          </button>
          <button className={btnSecondary} onClick={() => setDate(todayISO())}>
            Heute
          </button>
          <button className={btnPrimary} onClick={() => setModalState({ mode: "create" })}>
            <Plus size={16} />
            Neuer Termin
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-ink-soft">Lade Termine…</p>
      ) : isClosedToday ? (
        <div className="rounded-2xl border border-border bg-surface p-16 text-center text-sm text-ink-soft">
          Der Salon ist an diesem Tag geschlossen.
        </div>
      ) : staff.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-16 text-center text-sm text-ink-soft">
          Noch keine Mitarbeiter angelegt. Lege zuerst Mitarbeiter an.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <div className="flex min-w-[640px]">
            <div className="w-16 shrink-0 border-r border-border">
              <div className="h-12 border-b border-border" />
              <div className="relative" style={{ height: totalHeight }}>
                {hourMarks.map((h) => (
                  <div
                    key={h}
                    className="absolute -translate-y-1/2 pr-2 text-right text-xs text-ink-soft"
                    style={{ top: (h * 60 - dayStartMin) * PPM, right: 0 }}
                  >
                    {String(h).padStart(2, "0")}:00
                  </div>
                ))}
              </div>
            </div>

            {staff.map((member) => (
              <div key={member.id} className="flex-1 border-r border-border last:border-r-0">
                <div className="flex h-12 items-center justify-center gap-2 border-b border-border px-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: member.color }} />
                  <span className="truncate text-sm font-medium text-ink">{member.name}</span>
                </div>
                <div className="relative" style={{ height: totalHeight }}>
                  {hourMarks.map((h) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 border-t border-border/70"
                      style={{ top: (h * 60 - dayStartMin) * PPM }}
                    />
                  ))}
                  {halfHourSlots.map((m) => (
                    <button
                      key={m}
                      className="absolute left-0 right-0 hover:bg-accent-soft/40"
                      style={{ top: (m - dayStartMin) * PPM, height: 30 * PPM }}
                      onClick={() =>
                        setModalState({
                          mode: "create",
                          staffId: member.id,
                          startTime: `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`,
                        })
                      }
                    />
                  ))}
                  {appointments
                    .filter((a) => a.staff_id === member.id && a.status !== "storniert")
                    .map((appt) => {
                      const start = timeToMinutes(appt.start_time);
                      const end = timeToMinutes(appt.end_time);
                      return (
                        <button
                          key={appt.id}
                          onClick={() => setModalState({ mode: "edit", appointment: appt })}
                          className="absolute left-1 right-1 overflow-hidden rounded-md border-l-4 bg-white px-2 py-1 text-left shadow-sm transition-shadow hover:shadow-md"
                          style={{
                            top: (start - dayStartMin) * PPM,
                            height: Math.max((end - start) * PPM, 22),
                            borderLeftColor: appt.staff_color,
                            backgroundColor: `${appt.staff_color}14`,
                          }}
                        >
                          <p className="truncate text-xs font-semibold text-ink">
                            {appt.start_time} · {appt.customer_name || "Laufkundschaft"}
                          </p>
                          <p className="truncate text-[11px] text-ink-soft">{appt.service_name}</p>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-ink-soft">
        {Object.entries(STATUS_STYLES).map(([key, cls]) => (
          <span key={key} className={`rounded-full border px-2 py-0.5 ${cls}`}>
            {key === "bestaetigt" && "Bestätigt"}
            {key === "angefragt" && "Angefragt"}
            {key === "storniert" && "Storniert (ausgeblendet)"}
            {key === "erledigt" && "Erledigt"}
          </span>
        ))}
      </div>

      {modalState.mode !== "closed" && (
        <AppointmentModal
          onClose={closeModal}
          onSaved={handleSaved}
          staff={staff}
          services={services}
          categories={categories}
          customers={customers}
          defaultDate={date}
          defaultStaffId={modalState.mode === "create" ? modalState.staffId : undefined}
          defaultStartTime={modalState.mode === "create" ? modalState.startTime : undefined}
          appointment={modalState.mode === "edit" ? modalState.appointment : undefined}
        />
      )}
    </div>
  );
}
