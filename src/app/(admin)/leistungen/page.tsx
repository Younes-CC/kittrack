"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, FolderPlus } from "lucide-react";
import { btnPrimary, btnSecondary, cardClass } from "@/components/ui";
import ServiceModal from "@/components/ServiceModal";
import CategoryModal from "@/components/CategoryModal";
import { formatDuration, formatPrice } from "@/lib/format";
import type { Category, Service } from "@/lib/types";

export default function LeistungenPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [serviceModal, setServiceModal] = useState<
    { mode: "closed" } | { mode: "create"; categoryId?: string } | { mode: "edit"; service: Service }
  >({ mode: "closed" });
  const [categoryModal, setCategoryModal] = useState<
    { mode: "closed" } | { mode: "create" } | { mode: "edit"; category: Category }
  >({ mode: "closed" });

  function load() {
    setLoading(true);
    Promise.all([fetch("/api/categories").then((r) => r.json()), fetch("/api/services").then((r) => r.json())])
      .then(([cats, svcs]) => {
        setCategories(cats);
        setServices(svcs);
      })
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
  useEffect(load, []);

  const grouped = useMemo(
    () => categories.map((cat) => ({ category: cat, services: services.filter((s) => s.category_id === cat.id) })),
    [categories, services]
  );

  function handleServiceSaved() {
    setServiceModal({ mode: "closed" });
    load();
  }
  function handleCategorySaved() {
    setCategoryModal({ mode: "closed" });
    load();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink">Leistungen & Preise</h1>
          <p className="mt-1 text-sm text-ink-soft">Eure Preisliste — wird auch auf der Online-Buchungsseite angezeigt.</p>
        </div>
        <div className="flex gap-2">
          <button className={btnSecondary} onClick={() => setCategoryModal({ mode: "create" })}>
            <FolderPlus size={16} />
            Neue Kategorie
          </button>
          <button
            className={btnPrimary}
            onClick={() => setServiceModal({ mode: "create" })}
            disabled={categories.length === 0}
          >
            <Plus size={16} />
            Neue Leistung
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-ink-soft">Lade Leistungen…</p>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-16 text-center text-sm text-ink-soft">
          Noch keine Kategorien. Leg zuerst eine Kategorie an (z. B. &bdquo;Damen&ldquo;).
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ category, services: catServices }) => (
            <div key={category.id} className={cardClass}>
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <h2 className="font-display text-lg font-medium text-ink">{category.name}</h2>
                <div className="flex items-center gap-3">
                  <button
                    className="flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink"
                    onClick={() => setCategoryModal({ mode: "edit", category })}
                  >
                    <Pencil size={12} /> Bearbeiten
                  </button>
                  <button
                    className="text-xs font-medium text-accent hover:text-accent-dark"
                    onClick={() => setServiceModal({ mode: "create", categoryId: category.id })}
                  >
                    + Leistung
                  </button>
                </div>
              </div>
              {catServices.length === 0 ? (
                <p className="px-5 py-6 text-sm text-ink-soft">Noch keine Leistungen in dieser Kategorie.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {catServices.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => setServiceModal({ mode: "edit", service: s })}
                        className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-cream"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-2 truncate text-sm font-medium text-ink">
                            {s.name}
                            {!s.active && (
                              <span className="rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500">
                                Inaktiv
                              </span>
                            )}
                          </p>
                          {s.description && <p className="truncate text-xs text-ink-soft">{s.description}</p>}
                        </div>
                        <span className="shrink-0 text-xs text-ink-soft">{formatDuration(s.duration_minutes)}</span>
                        <span className="w-20 shrink-0 text-right text-sm font-semibold text-ink">
                          {formatPrice(s.price_cents)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {serviceModal.mode !== "closed" && (
        <ServiceModal
          categories={categories}
          service={serviceModal.mode === "edit" ? serviceModal.service : undefined}
          defaultCategoryId={serviceModal.mode === "create" ? serviceModal.categoryId : undefined}
          onClose={() => setServiceModal({ mode: "closed" })}
          onSaved={handleServiceSaved}
          onDeleted={handleServiceSaved}
        />
      )}
      {categoryModal.mode !== "closed" && (
        <CategoryModal
          category={categoryModal.mode === "edit" ? categoryModal.category : undefined}
          onClose={() => setCategoryModal({ mode: "closed" })}
          onSaved={handleCategorySaved}
          onDeleted={handleCategorySaved}
        />
      )}
    </div>
  );
}
