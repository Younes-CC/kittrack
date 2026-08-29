"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/Modal";
import { inputClass, labelClass, btnPrimary, btnSecondary, btnDanger } from "@/components/ui";
import { formatDuration, formatPrice } from "@/lib/format";
import type { AppointmentStatus, AppointmentWithRelations, Category, Customer, Service, Staff } from "@/lib/types";

type Props = {
  onClose: () => void;
  onSaved: () => void;
  staff: Staff[];
  services: Service[];
  categories: Category[];
  customers: Customer[];
  defaultDate: string;
  defaultStaffId?: string;
  defaultStartTime?: string;
  appointment?: AppointmentWithRelations;
};

export default function AppointmentModal({
  onClose,
  onSaved,
  staff,
  services,
  categories,
  customers,
  defaultDate,
  defaultStaffId,
  defaultStartTime,
  appointment,
}: Props) {
  const isEdit = Boolean(appointment);

  const [customerName, setCustomerName] = useState(appointment?.customer_name ?? "");
  const [customerPhone, setCustomerPhone] = useState(appointment?.customer_phone ?? "");
  const [staffId, setStaffId] = useState(appointment?.staff_id ?? defaultStaffId ?? staff[0]?.id ?? "");
  const [serviceId, setServiceId] = useState(appointment?.service_id ?? services[0]?.id ?? "");
  const [date, setDate] = useState(appointment?.date ?? defaultDate);
  const [startTime, setStartTime] = useState(appointment?.start_time ?? defaultStartTime ?? "09:00");
  const [status, setStatus] = useState<AppointmentStatus>(appointment?.status ?? "bestaetigt");
  const [notes, setNotes] = useState(appointment?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedService = useMemo(() => services.find((s) => s.id === serviceId), [services, serviceId]);

  const servicesByCategory = useMemo(() => {
    return categories.map((cat) => ({
      category: cat,
      services: services.filter((s) => s.category_id === cat.id && s.active),
    }));
  }, [categories, services]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!customerName.trim()) {
      setError("Bitte einen Kundennamen angeben.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        staffId,
        serviceId,
        date,
        startTime,
        status,
        notes,
      };
      const res = await fetch(isEdit ? `/api/appointments/${appointment!.id}` : "/api/appointments", {
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

  async function handleCancelAppointment() {
    if (!appointment) return;
    setSaving(true);
    try {
      await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "storniert" }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!appointment) return;
    if (!window.confirm("Diesen Termin unwiderruflich löschen?")) return;
    setSaving(true);
    try {
      await fetch(`/api/appointments/${appointment.id}`, { method: "DELETE" });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? "Termin bearbeiten" : "Neuer Termin"} onClose={onClose} width="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Kundenname</label>
            <input
              className={inputClass}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              list="customer-names"
              placeholder="Vor- und Nachname"
              required
            />
            <datalist id="customer-names">
              {customers.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={labelClass}>Telefon</label>
            <input
              className={inputClass}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="0170 1234567"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Leistung</label>
          <select className={inputClass} value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            {servicesByCategory.map(
              ({ category, services: catServices }) =>
                catServices.length > 0 && (
                  <optgroup key={category.id} label={category.name}>
                    {catServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} · {formatDuration(s.duration_minutes)} · {formatPrice(s.price_cents)}
                      </option>
                    ))}
                  </optgroup>
                )
            )}
          </select>
          {selectedService && (
            <p className="mt-1 text-xs text-ink-soft">
              Dauer: {formatDuration(selectedService.duration_minutes)} · Preis:{" "}
              {formatPrice(selectedService.price_cents)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Mitarbeiter</label>
            <select className={inputClass} value={staffId} onChange={(e) => setStaffId(e.target.value)}>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
            >
              <option value="bestaetigt">Bestätigt</option>
              <option value="angefragt">Angefragt</option>
              <option value="erledigt">Erledigt</option>
              <option value="storniert">Storniert</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Datum</label>
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Uhrzeit</label>
            <input
              type="time"
              className={inputClass}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              step={300}
              required
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
            placeholder="Interne Notiz (optional)"
          />
        </div>

        {error && <p className="text-sm text-accent-dark">{error}</p>}

        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-2">
            {isEdit && (
              <>
                <button type="button" className={btnDanger} onClick={handleDelete} disabled={saving}>
                  Löschen
                </button>
                {appointment!.status !== "storniert" && (
                  <button type="button" className={btnSecondary} onClick={handleCancelAppointment} disabled={saving}>
                    Stornieren
                  </button>
                )}
              </>
            )}
          </div>
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
    </Modal>
  );
}
