import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getPublicOrderSummary } from "@/lib/orders";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getPublicOrderSummary(orderNumber);
  if (!order) notFound();

  const book = order.order_items[0];

  return (
    <div className="mx-auto max-w-xl px-5 py-16 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-accent-dark" />
      <h1 className="mt-5 font-display text-3xl text-ink">Reservierung bestätigt</h1>
      <p className="mt-2 text-ink-soft">
        {book ? `„${book.book_title_snapshot}“ ist für dich reserviert.` : "Dein Buch ist reserviert."}
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <p className="text-xs uppercase tracking-wide text-ink-soft">Bestellnummer</p>
        <p className="mt-1 font-display text-2xl text-accent-dark">
          {order.public_order_number}
        </p>
        <p className="mt-3 text-sm text-ink-soft">Status: Reserviert – Abholung</p>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-ink-soft">
        Details zur Übergabe (Ort und Zeit) vereinbaren wir separat mit dir per E-Mail
        oder über den von dir angegebenen Kontakt. Bitte bewahre deine Bestellnummer auf.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-full border border-border px-6 py-2.5 text-sm text-ink transition hover:border-accent/40"
      >
        Zurück zur Startseite
      </Link>
    </div>
  );
}
