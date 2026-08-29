"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { inputClass, labelClass, btnPrimary, btnSecondary, btnDanger } from "@/components/ui";
import type { Category } from "@/lib/types";

export default function CategoryModal({
  category,
  onClose,
  onSaved,
  onDeleted,
}: {
  category?: Category;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const isEdit = Boolean(category);
  const [name, setName] = useState(category?.name ?? "");
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
      const res = await fetch(isEdit ? `/api/categories/${category!.id}` : "/api/categories", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
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
    if (!category) return;
    if (!window.confirm(`Kategorie "${category.name}" und alle enthaltenen Leistungen löschen?`)) return;
    setSaving(true);
    try {
      await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
      onDeleted();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? "Kategorie bearbeiten" : "Neue Kategorie"} onClose={onClose} width="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Name</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Damen, Herren, Coloration"
            required
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
    </Modal>
  );
}
