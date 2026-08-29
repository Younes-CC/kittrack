"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { inputClass, labelClass, btnPrimary, btnSecondary, btnDanger, STATUS_LABELS, STATUS_STYLES } from "@/components/ui";
import { formatDateShort, formatPrice } from "@/lib/format";
import type { AppointmentWithRelations, Customer } from "@/lib/types";

export default function CustomerModal({
  customer,
  onClose,
  onSaved,
  onDeleted,
}: {
  customer?: Customer;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const isEdit = Boolean(customer);
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [notes, setNotes] = useState(customer?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AppointmentWithRelations[] | null>(null);

  useEffect(() => {
    if (!customer) return;
    fetch(`/api/customers/${customer.id}`)
      .then((r) => r.json())
      .then((data) => setHistory(data.appointments ?? []));
  }, [customer]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Bitte einen Namen angeben.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = { name: name.trim(), phone: phone.trim(), email: email.trim(), notes };
      const res = await fetch(isEdit ? `/api/customers/${customer!.id}` : "/api/customers", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Speichern fehlgeschlagen.");
      }
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!customer) return;
    if (!window.confirm(`${customer.name} wirklich löschen?`)) return;
    setSaving(true);
    try {
      await fetch(`/api/customers/${customer.id}`, { method: "DELETE" });
      onDeleted();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? "Kunde bearbeiten" : "Neuer Kunde"} onClose={onClose} width="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Telefon</label>
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>E-Mail</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Notizen</label>
          <textarea
            className={inputClass}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Vorlieben, Unverträglichkeiten, etc."
          />
        </div>

        {error && <p className="text-sm text-accent-dark">{error}</p>}

        <div className="flex items-center justify-between pt-1">
          {isEdit ? (
            <button type="button" className={btnDanger} onClick={handleDelete} disabled={saving}>
              Löschen
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" className={btnSecondary} onClick={onClose}>
              Abbrechen
            </button>
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving ? "Speichert…" : "Speichern"}
            </button>
          </div>
        </div>
      </form>

      {isEdit && (
        <div className="mt-6 border-t border-border pt-4">
          <h3 className="mb-3 text-sm font-medium text-ink">Terminverlauf</h3>
          {history === null ? (
            <p className="text-sm text-ink-soft">Lade…</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-ink-soft">Noch keine Termine.</p>
          ) : (
            <ul className="max-h-56 space-y-2 overflow-y-auto scrollbar-thin pr-1">
              {history.map((appt) => (
                <li
                  key={appt.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink">
                      {formatDateShort(appt.date)} · {appt.start_time}
                    </p>
                    <p className="truncate text-xs text-ink-soft">
                      {appt.service_name} · {appt.staff_name} · {formatPrice(appt.service_price_cents)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[appt.status]}`}>
                    {STATUS_LABELS[appt.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}
