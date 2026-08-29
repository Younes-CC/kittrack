"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Mail, Phone } from "lucide-react";
import { btnPrimary, cardClass } from "@/components/ui";
import CustomerModal from "@/components/CustomerModal";
import { initials } from "@/lib/format";
import type { Customer } from "@/lib/types";

export default function KundenPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalState, setModalState] = useState<
    { mode: "closed" } | { mode: "create" } | { mode: "edit"; customer: Customer }
  >({ mode: "closed" });

  function load() {
    setLoading(true);
    fetch("/api/customers")
      .then((r) => r.json())
      .then(setCustomers)
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [customers, query]);

  function handleSaved() {
    setModalState({ mode: "closed" });
    load();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink">Kunden</h1>
          <p className="mt-1 text-sm text-ink-soft">{customers.length} Kunden im System</p>
        </div>
        <button className={btnPrimary} onClick={() => setModalState({ mode: "create" })}>
          <Plus size={16} />
          Neuer Kunde
        </button>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          placeholder="Suche nach Name, Telefon oder E-Mail…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className={cardClass}>
        {loading ? (
          <p className="py-16 text-center text-sm text-ink-soft">Lade Kunden…</p>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-soft">Keine Kunden gefunden.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setModalState({ mode: "edit", customer: c })}
                  className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-cream"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-dark">
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{c.name}</p>
                    {c.notes && <p className="truncate text-xs text-ink-soft">{c.notes}</p>}
                  </div>
                  <div className="hidden shrink-0 items-center gap-4 text-xs text-ink-soft sm:flex">
                    {c.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={13} /> {c.phone}
                      </span>
                    )}
                    {c.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail size={13} /> {c.email}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modalState.mode !== "closed" && (
        <CustomerModal
          customer={modalState.mode === "edit" ? modalState.customer : undefined}
          onClose={() => setModalState({ mode: "closed" })}
          onSaved={handleSaved}
          onDeleted={handleSaved}
        />
      )}
    </div>
  );
}
