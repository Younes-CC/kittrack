"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

export function ShippingForm({
  bookId,
  shippingPrice,
}: {
  bookId: string;
  shippingPrice: number;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          deliveryType: "shipping",
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          socialHandle: formData.get("socialHandle"),
          street: formData.get("street"),
          houseNumber: formData.get("houseNumber"),
          postalCode: formData.get("postalCode"),
          city: formData.get("city"),
          country: formData.get("country"),
          website: formData.get("website"),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Etwas ist schiefgelaufen.");
        setSubmitting(false);
        return;
      }

      router.push(`/bezahlen/${result.order.public_order_number}`);
    } catch {
      setError("Etwas ist schiefgelaufen. Bitte versuch es erneut.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vorname" name="firstName" required />
        <Field label="Nachname" name="lastName" required />
      </div>
      <Field label="E-Mail" name="email" type="email" required />
      <Field label="Instagram / TikTok (optional)" name="socialHandle" required={false} />

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Field label="Straße" name="street" required />
        <Field label="Hausnummer" name="houseNumber" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="PLZ" name="postalCode" required />
        <Field label="Ort" name="city" required />
      </div>
      <Field label="Land" name="country" required defaultValue="Deutschland" />

      <div className="mt-2 rounded-2xl border border-border bg-cream/60 p-5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-ink-soft">Buch</span>
          <span className="font-medium text-ink">{formatPrice(0)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-ink-soft">Versand &amp; Verpackung</span>
          <span className="font-medium text-ink">{formatPrice(shippingPrice)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="font-medium text-ink">Gesamt</span>
          <span className="font-display text-lg text-accent-dark">
            {formatPrice(shippingPrice)}
          </span>
        </div>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Das Buch ist kostenlos. Du übernimmst lediglich die Versand- und
          Verpackungskosten.
        </p>
      </div>

      {error && <p className="text-sm text-accent-dark">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-60"
      >
        {submitting ? "Wird angelegt…" : "Bestellung bestätigen"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-ink">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </label>
  );
}
