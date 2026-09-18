import clsx from "clsx";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, type OrderStatus, type PaymentStatus } from "@/lib/types";

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  reserved: "bg-gold/15 text-accent-dark",
  awaiting_payment: "bg-gold/15 text-accent-dark",
  paid: "bg-accent-soft text-accent-dark",
  packing: "bg-accent-soft text-accent-dark",
  shipped: "bg-ink/10 text-ink",
  ready_for_pickup: "bg-accent-soft text-accent-dark",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-ink/5 text-ink-soft",
  expired: "bg-ink/5 text-ink-soft",
};

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  not_required: "bg-ink/5 text-ink-soft",
  pending: "bg-gold/15 text-accent-dark",
  paid: "bg-green-100 text-green-800",
};

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        ORDER_STATUS_STYLES[status],
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentStatusPill({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        PAYMENT_STATUS_STYLES[status],
      )}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
