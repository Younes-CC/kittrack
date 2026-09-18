"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BookCard } from "@/components/BookCard";
import { BOOK_CATEGORIES, type Book } from "@/lib/types";

export function BookGrid({ books }: { books: Book[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter((book) => {
      const matchesCategory = !category || book.category === category;
      const matchesQuery =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [books, query, category]);

  return (
    <div id="buecher" className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Titel oder Autor suchen"
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterChip active={category === null} onClick={() => setCategory(null)}>
            Alle
          </FilterChip>
          {BOOK_CATEGORIES.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </FilterChip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center text-ink-soft">
          Keine Bücher gefunden. Versuch es mit einer anderen Suche oder Kategorie.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${
        active
          ? "border-accent bg-accent-soft text-accent-dark"
          : "border-border bg-surface text-ink-soft hover:border-accent/40 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
