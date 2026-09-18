"use client";

import { useState } from "react";
import { BOOK_CATEGORIES, type Book } from "@/lib/types";

export function BookForm({
  action,
  book,
}: {
  action: (formData: FormData) => Promise<void>;
  book?: Book;
}) {
  const [preview, setPreview] = useState<string | null>(book?.image_url ?? null);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div>
        <p className="mb-1.5 text-sm text-ink">Buchbild</p>
        <div className="flex items-center gap-4">
          <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-cream">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element -- Live-Vorschau lokaler/blob-URLs, next/image unterstützt keine blob: URIs.
              <img src={preview} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
            className="text-sm text-ink-soft"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Titel" name="title" defaultValue={book?.title} required />
        <Field label="Autor" name="author" defaultValue={book?.author} required />
      </div>

      <label className="flex flex-col gap-1.5 text-sm text-ink">
        Kategorie
        <select
          name="category"
          defaultValue={book?.category ?? BOOK_CATEGORIES[BOOK_CATEGORIES.length - 1]}
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {BOOK_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-ink">
        Beschreibung (optional)
        <textarea
          name="description"
          defaultValue={book?.description ?? ""}
          rows={4}
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Zustand (optional)"
          name="condition"
          defaultValue={book?.condition ?? ""}
        />
        <Field
          label="Anzahl (Gesamtbestand)"
          name="stockTotal"
          type="number"
          defaultValue={String(book?.stock_total ?? 1)}
          min={0}
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="active"
          defaultChecked={book?.active ?? true}
          className="h-4 w-4 rounded border-border"
        />
        Buch ist öffentlich sichtbar (aktiv)
      </label>

      <button
        type="submit"
        className="mt-2 self-start rounded-full bg-accent px-7 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark"
      >
        {book ? "Änderungen speichern" : "Buch anlegen"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  min?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-ink">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        min={min}
        className="rounded-lg border border-border bg-surface px-3.5 py-2.5 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </label>
  );
}
