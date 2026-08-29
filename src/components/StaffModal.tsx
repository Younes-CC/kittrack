"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { inputClass, labelClass, btnPrimary, btnSecondary, btnDanger } from "@/components/ui";
import type { Staff } from "@/lib/types";

const COLOR_OPTIONS = ["#B45141", "#3E6259", "#8C6A3F", "#4A5C8C", "#7A4A8C", "#3F7A8C", "#8C3F63", "#5C6B4A"];

export default function StaffModal({
  staff,
  onClose,
  onSaved,
  onDeleted,
}: {
  staff?: Staff;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const isEdit = Boolean(staff);
  const [name, setName] = useState(staff?.name ?? "");
  const [role, setRole] = useState(staff?.role ?? "");
  const [color, setColor] = useState(staff?.color ?? COLOR_OPTIONS[0]);
  const [active, setActive] = useState(staff ? Boolean(staff.active) : true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Bitte einen Namen angeben.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = { name: name.trim(), role: role.trim(), color, active };
      const res = await fetch(isEdit ? `/api/staff/${staff!.id}` : "/api/staff", {
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
    if (!staff) return;
    if (!window.confirm(`${staff.name} wirklich löschen? Zugehörige Termine werden ebenfalls gelöscht.`)) return;
    setSaving(true);
    try {
      await fetch(`/api/staff/${staff.id}`, { method: "DELETE" });
      onDeleted();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? "Mitarbeiter bearbeiten" : "Neuer Mitarbeiter"} onClose={onClose} width="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Rolle (optional)</label>
          <input
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="z. B. Stylist, Coloristin"
          />
        </div>
        <div>
          <label className={labelClass}>Kalenderfarbe</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full ring-offset-2 transition-shadow ${
                  color === c ? "ring-2 ring-ink" : ""
                }`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-accent"
          />
          Aktiv (im Kalender & bei Online-Buchung sichtbar)
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
