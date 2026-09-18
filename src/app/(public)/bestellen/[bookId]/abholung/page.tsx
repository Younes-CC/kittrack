import { notFound } from "next/navigation";
import { OrderBookSummary } from "@/components/OrderBookSummary";
import { PickupForm } from "@/components/PickupForm";
import { getBookById } from "@/lib/books";

export default async function PickupPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const book = await getBookById(bookId);
  if (!book || book.stock_available <= 0) notFound();

  return (
    <div className="mx-auto max-w-xl px-5 py-10 sm:py-14">
      <p className="text-sm text-ink-soft">Schritt 3 von 3 — Abholung</p>
      <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">Deine Angaben</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Kostenlos, keine Zahlung notwendig. Details zur Übergabe (Ort/Zeit) vereinbaren
        wir nach deiner Reservierung separat per E-Mail.
      </p>

      <div className="mt-6">
        <OrderBookSummary book={book} />
      </div>

      <div className="mt-8">
        <PickupForm bookId={book.id} />
      </div>
    </div>
  );
}
