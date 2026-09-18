import { getAdminStats } from "@/lib/admin/stats";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Bücher insgesamt", value: stats.booksTotal },
    { label: "Verfügbare Bücher", value: stats.booksAvailable },
    { label: "Aktive Reservierungen", value: stats.activeReservations },
    { label: "Versendet", value: stats.shipped },
    { label: "Offene Zahlungen", value: stats.paymentsPending },
    { label: "Offene Abholungen", value: stats.pickupsOpen },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Übersicht</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <p className="text-sm text-ink-soft">{card.label}</p>
            <p className="mt-2 font-display text-3xl text-ink">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
