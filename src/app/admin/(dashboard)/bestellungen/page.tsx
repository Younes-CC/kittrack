import Link from "next/link";
import clsx from "clsx";
import { getOrders, type OrderFilter } from "@/lib/admin/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { DELIVERY_TYPE_LABELS } from "@/lib/types";
import { OrderStatusPill, PaymentStatusPill } from "@/components/admin/OrderStatusPill";

const FILTERS: { value: OrderFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "payment_pending", label: "Zahlung offen" },
  { value: "paid", label: "Bezahlt" },
  { value: "shipping_open", label: "Versand offen" },
  { value: "shipped", label: "Versendet" },
  { value: "pickup", label: "Abholung" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "cancelled", label: "Storniert" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: rawFilter } = await searchParams;
  const filter = (FILTERS.some((f) => f.value === rawFilter) ? rawFilter : "all") as OrderFilter;
  const orders = await getOrders(filter);

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Bestellungen</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin/bestellungen" : `/admin/bestellungen?filter=${f.value}`}
            className={clsx(
              "rounded-full border px-3.5 py-1.5 text-sm transition",
              filter === f.value
                ? "border-accent bg-accent-soft text-accent-dark"
                : "border-border bg-surface text-ink-soft hover:border-accent/40",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-border text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Bestellnr.</th>
              <th className="px-4 py-3 font-medium">Datum</th>
              <th className="px-4 py-3 font-medium">Buch</th>
              <th className="px-4 py-3 font-medium">Empfänger</th>
              <th className="px-4 py-3 font-medium">Übergabe</th>
              <th className="px-4 py-3 font-medium">Betrag</th>
              <th className="px-4 py-3 font-medium">Zahlung</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-border last:border-0 hover:bg-cream/50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/bestellungen/${order.id}`}
                    className="font-medium text-accent-dark"
                  >
                    {order.public_order_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3">
                  {order.order_items[0]?.book_title_snapshot ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {order.first_name} {order.last_name}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {DELIVERY_TYPE_LABELS[order.delivery_type]}
                </td>
                <td className="px-4 py-3">{formatPrice(order.shipping_price)}</td>
                <td className="px-4 py-3">
                  <PaymentStatusPill status={order.payment_status} />
                </td>
                <td className="px-4 py-3">
                  <OrderStatusPill status={order.order_status} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-ink-soft">
                  Keine Bestellungen in dieser Ansicht.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
