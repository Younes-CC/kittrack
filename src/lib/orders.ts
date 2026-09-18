import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DeliveryType, OrderStatus, PaymentStatus } from "@/lib/types";

export interface PublicOrderSummary {
  public_order_number: string;
  delivery_type: DeliveryType;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_price: number;
  reservation_expires_at: string | null;
  created_at: string;
  order_items: { book_title_snapshot: string; book_author_snapshot: string }[];
}

/**
 * Datensparsamer Lookup für Bestätigungs- und Zahlungsseite — bewusst ohne
 * Name, E-Mail oder Adresse, da die Bestellnummer allein kein Auth-Faktor
 * ist.
 */
export async function getPublicOrderSummary(
  orderNumber: string,
): Promise<PublicOrderSummary | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "public_order_number, delivery_type, order_status, payment_status, shipping_price, reservation_expires_at, created_at, order_items(book_title_snapshot, book_author_snapshot)",
    )
    .eq("public_order_number", orderNumber)
    .maybeSingle();

  if (error || !data) return null;
  return data as PublicOrderSummary;
}
