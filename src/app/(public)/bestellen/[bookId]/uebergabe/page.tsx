import Link from "next/link";
import { notFound } from "next/navigation";
import { Package, Truck } from "lucide-react";
import { OrderBookSummary } from "@/components/OrderBookSummary";
import { getBookById } from "@/lib/books";

export default async function DeliveryChoicePage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const book = await getBookById(bookId);
  if (!book) notFound();

  if (book.stock_available <= 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="text-ink-soft">
          Dieses Buch ist leider gerade vergriffen und kann nicht mehr reserviert werden.
        </p>
        <Link href="/#buecher" className="mt-4 inline-block text-accent-dark underline">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10 sm:py-14">
      <p className="text-sm text-ink-soft">Schritt 2 von 3</p>
      <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
        Wie möchtest du dein Buch erhalten?
      </h1>

      <div className="mt-6">
        <OrderBookSummary book={book} />
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <Link
          href={`/bestellen/${book.id}/abholung`}
          className="group flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/50"
        >
          <Package className="mt-0.5 h-6 w-6 shrink-0 text-accent-dark" />
          <div>
            <p className="font-display text-lg text-ink">Abholung</p>
            <p className="mt-1 text-sm text-ink-soft">
              Kostenlos, keine Zahlung notwendig. Details zur Übergabe vereinbaren wir
              danach separat.
            </p>
          </div>
        </Link>

        <Link
          href={`/bestellen/${book.id}/versand`}
          className="group flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/50"
        >
          <Truck className="mt-0.5 h-6 w-6 shrink-0 text-accent-dark" />
          <div>
            <p className="font-display text-lg text-ink">Versand</p>
            <p className="mt-1 text-sm text-ink-soft">
              Das Buch ist kostenlos. Du übernimmst lediglich die Versand- und
              Verpackungskosten.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
