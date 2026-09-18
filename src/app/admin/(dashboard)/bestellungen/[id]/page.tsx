import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/admin/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { DELIVERY_TYPE_LABELS } from "@/lib/types";
import { OrderStatusPill, PaymentStatusPill } from "@/components/admin/OrderStatusPill";
import { OrderActions } from "@/components/admin/OrderActions";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/bestellungen" className="text-sm text-ink-soft hover:text-ink">
        ← Alle Bestellungen
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">{order.public_order_number}</h1>
        <div className="flex gap-2">
          <OrderStatusPill status={order.order_status} />
          <PaymentStatusPill status={order.payment_status} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <InfoCard title="Buch">
          {order.order_items.map((item) => (
            <p key={item.id}>
              {item.book_title_snapshot} — {item.book_author_snapshot}
            </p>
          ))}
        </InfoCard>

        <InfoCard title="Übergabeart">
          <p>{DELIVERY_TYPE_LABELS[order.delivery_type]}</p>
        </InfoCard>

        <InfoCard title="Kontakt">
          <p>
            {order.first_name} {order.last_name}
          </p>
          <p>{order.email}</p>
          {order.social_handle && <p>{order.social_handle}</p>}
        </InfoCard>

        <InfoCard title="Bestelldatum">
          <p>{formatDate(order.created_at)}</p>
        </InfoCard>

        {order.delivery_type === "shipping" && (
          <InfoCard title="Versandadresse">
            <p>
              {order.street} {order.house_number}
            </p>
            <p>
              {order.postal_code} {order.city}
            </p>
            <p>{order.country}</p>
          </InfoCard>
        )}

        <InfoCard title="Betrag">
          <p>{formatPrice(order.shipping_price)}</p>
        </InfoCard>

        {order.reservation_expires_at && (
          <InfoCard title="Reservierung läuft ab">
            <p>{formatDate(order.reservation_expires_at)}</p>
          </InfoCard>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-display text-lg text-ink">Aktionen</h2>
        <div className="mt-4">
          <OrderActions
            orderId={order.id}
            orderStatus={order.order_status}
            paymentStatus={order.payment_status}
            deliveryType={order.delivery_type}
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-ink-soft">{title}</p>
      <div className="mt-1.5 text-sm text-ink">{children}</div>
    </div>
  );
}
