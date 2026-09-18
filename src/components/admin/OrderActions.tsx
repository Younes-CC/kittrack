"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmPayment, updateOrderStatus } from "@/app/admin/actions";
import type { DeliveryType, OrderStatus, PaymentStatus } from "@/lib/types";

const TERMINAL_STATUSES: OrderStatus[] = ["completed", "cancelled", "expired"];

export function OrderActions({
  orderId,
  orderStatus,
  paymentStatus,
  deliveryType,
}: {
  orderId: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryType: DeliveryType;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (error) {
        alert(error instanceof Error ? error.message : "Aktion fehlgeschlagen.");
      }
    });
  }

  const isTerminal = TERMINAL_STATUSES.includes(orderStatus);
  const buttons: { label: string; onClick: () => void; primary?: boolean }[] = [];

  if (paymentStatus === "pending") {
    buttons.push({
      label: "Zahlung bestätigen",
      onClick: () => run(() => confirmPayment(orderId)),
      primary: true,
    });
  }

  if (deliveryType === "shipping") {
    if (orderStatus === "paid") {
      buttons.push({
        label: "Als verpackt markieren",
        onClick: () => run(() => updateOrderStatus(orderId, "packing")),
        primary: true,
      });
    }
    if (orderStatus === "packing") {
      buttons.push({
        label: "Als versendet markieren",
        onClick: () => run(() => updateOrderStatus(orderId, "shipped")),
        primary: true,
      });
    }
    if (orderStatus === "shipped") {
      buttons.push({
        label: "Als abgeschlossen markieren",
        onClick: () => run(() => updateOrderStatus(orderId, "completed")),
        primary: true,
      });
    }
  } else {
    if (orderStatus === "reserved") {
      buttons.push({
        label: "Als abholbereit markieren",
        onClick: () => run(() => updateOrderStatus(orderId, "ready_for_pickup")),
        primary: true,
      });
    }
    if (orderStatus === "ready_for_pickup") {
      buttons.push({
        label: "Abgeholt",
        onClick: () => run(() => updateOrderStatus(orderId, "completed")),
        primary: true,
      });
    }
  }

  if (!isTerminal) {
    buttons.push({
      label: "Stornieren",
      onClick: () => {
        if (confirm("Diese Bestellung wirklich stornieren? Der Bestand wird zurückgegeben.")) {
          run(() => updateOrderStatus(orderId, "cancelled"));
        }
      },
    });
  }

  if (buttons.length === 0) {
    return <p className="text-sm text-ink-soft">Keine weiteren Aktionen verfügbar.</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {buttons.map((button) => (
        <button
          key={button.label}
          type="button"
          disabled={isPending}
          onClick={button.onClick}
          className={
            button.primary
              ? "rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark disabled:opacity-60"
              : "rounded-full border border-border px-5 py-2.5 text-sm text-ink-soft transition hover:border-accent-dark/40 hover:text-accent-dark disabled:opacity-60"
          }
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}
