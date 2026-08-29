"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { inputClass, labelClass, btnPrimary, btnSecondary, btnDanger } from "@/components/ui";
import type { Category, Service } from "@/lib/types";

export default function ServiceModal({
  service,
  categories,
  defaultCategoryId,
  onClose,
  onSaved,
  onDeleted,
}: {
  service?: Service;
  categories: Category[];
  defaultCategoryId?: string;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const isEdit = Boolean(service);
  const [categoryId, setCategoryId] = useState(service?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? "");
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [duration, setDuration] = useState(service?.duration_minutes?.toString() ?? "30");
  const [price, setPrice] = useState(service ? (service.price_cents / 100).toString() : "");
  const [active, setActive] = useState(service ? Boolean(service.active) : true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const priceNum = Number(price.replace(",", "."));
    const durationNum = Number(duration);
    if (!name.trim() || !categoryId || !priceNum || priceNum <= 0 || !durationNum || durationNum <= 0) {
      setError("Bitte alle Pflichtfelder korrekt ausfüllen.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        category_id: categoryId,
        name: name.trim(),
        description: description.trim(),
        duration_minutes: durationNum,
        price_cents: Math.round(priceNum * 100),
        active,
      };
      const res = await fetch(isEdit ? `/api/services/${service!.id}` : "/api/services", {
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
    if (!service) return;
    if (!window.confirm(`"${service.name}" wirklich löschen?`)) return;
    setSaving(true);
    try {
      await fetch(`/api/services/${service.id}`, { method: "DELETE" });
      onDeleted();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? "Leistung bearbeiten" : "Neue Leistung"} onClose={onClose} width="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Kategorie</label>
          <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Bezeichnung</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Beschreibung (optional)</label>
          <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Dauer (Minuten)</label>
            <input
              type="number"
              min={5}
              step={5}
              className={inputClass}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Preis (€)</label>
            <input
              type="text"
              inputMode="decimal"
              className={inputClass}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="z. B. 49,00"
              required
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded border-border accent-accent" />
          Aktiv (buchbar & sichtbar für Kunden)
        </label>

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
    </Modal>
  );
}
