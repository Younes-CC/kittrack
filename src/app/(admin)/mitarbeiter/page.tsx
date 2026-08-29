"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { btnPrimary, cardClass } from "@/components/ui";
import StaffModal from "@/components/StaffModal";
import { initials } from "@/lib/format";
import type { Staff } from "@/lib/types";

export default function MitarbeiterPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<
    { mode: "closed" } | { mode: "create" } | { mode: "edit"; staff: Staff }
  >({ mode: "closed" });

  function load() {
    setLoading(true);
    fetch("/api/staff")
      .then((r) => r.json())
      .then(setStaff)
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
  useEffect(load, []);

  function handleSaved() {
    setModalState({ mode: "closed" });
    load();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink">Mitarbeiter</h1>
          <p className="mt-1 text-sm text-ink-soft">{staff.length} Mitarbeiter im Team</p>
        </div>
        <button className={btnPrimary} onClick={() => setModalState({ mode: "create" })}>
          <Plus size={16} />
          Neuer Mitarbeiter
        </button>
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-ink-soft">Lade Mitarbeiter…</p>
      ) : staff.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-16 text-center text-sm text-ink-soft">
          Noch keine Mitarbeiter angelegt.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((s) => (
            <button
              key={s.id}
              onClick={() => setModalState({ mode: "edit", staff: s })}
              className={`${cardClass} flex items-center gap-3.5 p-4 text-left transition-shadow hover:shadow-md`}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: s.color }}
              >
                {initials(s.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{s.name}</p>
                <p className="truncate text-xs text-ink-soft">{s.role || "—"}</p>
              </div>
              {!s.active && (
                <span className="shrink-0 rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500">
                  Inaktiv
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {modalState.mode !== "closed" && (
        <StaffModal
          staff={modalState.mode === "edit" ? modalState.staff : undefined}
          onClose={() => setModalState({ mode: "closed" })}
          onSaved={handleSaved}
          onDeleted={handleSaved}
        />
      )}
    </div>
  );
}
