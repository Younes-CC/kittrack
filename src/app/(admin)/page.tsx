import Link from "next/link";
import { CalendarPlus, UserPlus, Clock, Euro, Users, Gauge } from "lucide-react";
import { getSettings, listAppointmentsByDate, listStaff, listCustomers } from "@/lib/repo";
import { formatDateLong, formatPrice, todayISO, timeToMinutes } from "@/lib/format";
import { cardClass, STATUS_LABELS, STATUS_STYLES } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const settings = getSettings();
  const today = todayISO();
  const appointments = listAppointmentsByDate(today);
  const staff = listStaff().filter((s) => s.active);
  const customers = listCustomers();

  const activeAppointments = appointments.filter((a) => a.status !== "storniert");
  const revenueToday = activeAppointments.reduce((sum, a) => sum + a.service_price_cents, 0);

  const weekday = new Date(`${today}T00:00:00`).getDay();
  const weekdayKey = (["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const)[weekday];
  const hoursToday = settings.opening_hours[weekdayKey];
  let utilization = 0;
  if (hoursToday && !hoursToday.closed && staff.length > 0) {
    const openMinutes = timeToMinutes(hoursToday.close) - timeToMinutes(hoursToday.open);
    const bookedMinutes = activeAppointments.reduce(
      (sum, a) => sum + (timeToMinutes(a.end_time) - timeToMinutes(a.start_time)),
      0
    );
    utilization = Math.min(100, Math.round((bookedMinutes / (openMinutes * staff.length)) * 100));
  }

  const stats = [
    { label: "Termine heute", value: appointments.length.toString(), icon: Clock },
    { label: "Erwarteter Umsatz heute", value: formatPrice(revenueToday), icon: Euro },
    { label: "Kunden gesamt", value: customers.length.toString(), icon: Users },
    { label: "Auslastung heute", value: `${utilization}%`, icon: Gauge },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-soft">{formatDateLong(today)}</p>
          <h1 className="mt-1 font-display text-3xl font-medium text-ink">
            Willkommen zurück{settings.salon_name ? `, ${settings.salon_name}` : ""}
          </h1>
        </div>
        <div className="flex gap-2.5">
          <Link href="/termine" className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark">
            <CalendarPlus size={16} />
            Neuer Termin
          </Link>
          <Link href="/kunden" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-cream">
            <UserPlus size={16} />
            Neuer Kunde
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`${cardClass} p-5`}>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
              <stat.icon size={17} />
            </div>
            <p className="font-display text-2xl font-medium text-ink">{stat.value}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className={cardClass}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-medium text-ink">Heutige Termine</h2>
          <Link href="/termine" className="text-sm font-medium text-accent hover:text-accent-dark">
            Zum Kalender →
          </Link>
        </div>
        {appointments.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-soft">
            Heute sind noch keine Termine eingetragen.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {appointments.map((appt) => (
              <li key={appt.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-14 shrink-0 text-sm font-medium text-ink">{appt.start_time}</div>
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: appt.staff_color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {appt.customer_name || "Laufkundschaft"}
                  </p>
                  <p className="truncate text-xs text-ink-soft">
                    {appt.service_name} · {appt.staff_name}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[appt.status]}`}
                >
                  {STATUS_LABELS[appt.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
