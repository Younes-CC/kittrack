import { notFound } from "next/navigation";
import { getPublicOrderSummary } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/types";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const [order, settings] = await Promise.all([
    getPublicOrderSummary(orderNumber),
    getSettings(),
  ]);
  if (!order) notFound();

  const alreadyPaid = order.payment_status === "paid";

  return (
    <div className="mx-auto max-w-xl px-5 py-16 text-center">
      <h1 className="font-display text-3xl text-ink">
        {alreadyPaid ? "Zahlung bestätigt" : "Fast geschafft."}
      </h1>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-ink-soft">
            Bestellnummer
          </span>
          <span className="font-display text-lg text-accent-dark">
            {order.public_order_number}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-ink-soft">Versand &amp; Verpackung</span>
          <span className="font-medium text-ink">{formatPrice(order.shipping_price)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-ink-soft">Status</span>
          <span className="font-medium text-ink">
            {ORDER_STATUS_LABELS[order.order_status]}
          </span>
        </div>
      </div>

      {!alreadyPaid && (
        <>
          {settings.payment_url ? (
            <a
              href={settings.payment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition hover:bg-accent-dark"
            >
              Versandkosten bezahlen
            </a>
          ) : (
            <p className="mt-8 rounded-xl border border-dashed border-border p-4 text-sm text-ink-soft">
              Der Zahlungslink wird in Kürze hinterlegt. Du wirst separat kontaktiert,
              sobald die Zahlung möglich ist.
            </p>
          )}

          <p className="mt-6 text-sm leading-relaxed text-ink-soft">
            Deine Reservierung wird nach bestätigtem Zahlungseingang für den Versand
            vorbereitet.
          </p>
        </>
      )}
    </div>
  );
}
