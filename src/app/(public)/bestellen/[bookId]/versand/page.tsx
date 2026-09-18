import { notFound } from "next/navigation";
import { OrderBookSummary } from "@/components/OrderBookSummary";
import { ShippingForm } from "@/components/ShippingForm";
import { getBookById } from "@/lib/books";
import { getSettings } from "@/lib/settings";

export default async function ShippingPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const [book, settings] = await Promise.all([getBookById(bookId), getSettings()]);
  if (!book || book.stock_available <= 0) notFound();

  return (
    <div className="mx-auto max-w-xl px-5 py-10 sm:py-14">
      <p className="text-sm text-ink-soft">Schritt 3 von 3 — Versand</p>
      <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
        Versandadresse &amp; Angaben
      </h1>

      <div className="mt-6">
        <OrderBookSummary book={book} />
      </div>

      <div className="mt-8">
        <ShippingForm bookId={book.id} shippingPrice={settings.shipping_price} />
      </div>
    </div>
  );
}
