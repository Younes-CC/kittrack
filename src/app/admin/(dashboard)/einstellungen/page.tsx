import { getSettings } from "@/lib/settings";
import { updateSettings } from "@/app/admin/actions";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl text-ink">Einstellungen</h1>

      <form action={updateSettings} className="mt-6 flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6">
        <label className="flex flex-col gap-1.5 text-sm text-ink">
          Versand- &amp; Verpackungskosten (€)
          <input
            name="shippingPrice"
            type="number"
            step="0.01"
            min={0}
            defaultValue={settings.shipping_price}
            required
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-ink">
          Zahlungslink (z. B. Revolut)
          <input
            name="paymentUrl"
            type="url"
            placeholder="https://revolut.me/…"
            defaultValue={settings.payment_url ?? ""}
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <span className="text-xs text-ink-soft">
            Solange kein Link hinterlegt ist, sehen Kund:innen auf der Zahlungsseite einen
            Hinweis, dass sie separat kontaktiert werden.
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-ink">
          Reservierungsdauer bei Versand (Stunden)
          <input
            name="reservationDurationHours"
            type="number"
            min={1}
            defaultValue={settings.reservation_duration_hours}
            required
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>

        <button
          type="submit"
          className="mt-2 self-start rounded-full bg-accent px-7 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark"
        >
          Speichern
        </button>
      </form>
    </div>
  );
}
