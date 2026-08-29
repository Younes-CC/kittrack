"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { inputClass, labelClass, btnPrimary, cardClass } from "@/components/ui";
import { WEEKDAY_KEYS, WEEKDAY_LABELS } from "@/lib/types";
import type { Settings } from "@/lib/types";

export default function EinstellungenPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return <p className="py-16 text-center text-sm text-ink-soft">Lade Einstellungen…</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-medium text-ink">Einstellungen</h1>
        <p className="mt-1 text-sm text-ink-soft">Salon-Informationen und Öffnungszeiten.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`${cardClass} p-5`}>
          <h2 className="mb-4 font-display text-lg font-medium text-ink">Salon-Informationen</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Salonname</label>
              <input
                className={inputClass}
                value={settings.salon_name}
                onChange={(e) => setSettings({ ...settings, salon_name: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Adresse</label>
              <input
                className={inputClass}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Telefon</label>
              <input
                className={inputClass}
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>E-Mail</label>
              <input
                type="email"
                className={inputClass}
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className={`${cardClass} p-5`}>
          <h2 className="mb-1 font-display text-lg font-medium text-ink">Öffnungszeiten</h2>
          <p className="mb-4 text-xs text-ink-soft">
            Bestimmt die buchbaren Zeiten im Kalender und bei der Online-Buchung.
          </p>
          <div className="space-y-2.5">
            {WEEKDAY_KEYS.map((key) => {
              const day = settings.opening_hours[key];
              return (
                <div key={key} className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                  <span className="w-28 shrink-0 text-sm font-medium text-ink">{WEEKDAY_LABELS[key]}</span>
                  <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <input
                      type="checkbox"
                      checked={day.closed}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          opening_hours: {
                            ...settings.opening_hours,
                            [key]: { ...day, closed: e.target.checked },
                          },
                        })
                      }
                      className="h-4 w-4 rounded border-border accent-accent"
                    />
                    Geschlossen
                  </label>
                  {!day.closed && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                        value={day.open}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            opening_hours: { ...settings.opening_hours, [key]: { ...day, open: e.target.value } },
                          })
                        }
                      />
                      <span className="text-xs text-ink-soft">bis</span>
                      <input
                        type="time"
                        className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                        value={day.close}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            opening_hours: { ...settings.opening_hours, [key]: { ...day, close: e.target.value } },
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className={btnPrimary} disabled={saving}>
            {saving ? "Speichert…" : "Änderungen speichern"}
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-700">
              <Check size={15} /> Gespeichert
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
