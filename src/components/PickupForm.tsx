"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function PickupForm({ bookId }: { bookId: string }) {
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
          deliveryType: "pickup",
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          socialHandle: formData.get("socialHandle"),
          website: formData.get("website"),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Etwas ist schiefgelaufen.");
        setSubmitting(false);
        return;
      }

      router.push(`/bestaetigung/${result.order.public_order_number}`);
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

      {error && <p className="text-sm text-accent-dark">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-60"
      >
        {submitting ? "Wird reserviert…" : "Reservierung abschließen"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-ink">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </label>
  );
}
