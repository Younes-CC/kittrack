import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { OrderWithItems } from "@/lib/types";

export type OrderFilter =
  | "all"
  | "payment_pending"
  | "paid"
  | "shipping_open"
  | "shipped"
  | "pickup"
  | "completed"
  | "cancelled";

export async function getOrders(filter: OrderFilter): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  switch (filter) {
    case "payment_pending":
      query = query.eq("payment_status", "pending");
      break;
    case "paid":
      query = query.eq("payment_status", "paid");
      break;
    case "shipping_open":
      query = query.eq("delivery_type", "shipping").in("order_status", ["paid", "packing"]);
      break;
    case "shipped":
      query = query.eq("order_status", "shipped");
      break;
    case "pickup":
      query = query
        .eq("delivery_type", "pickup")
        .in("order_status", ["reserved", "ready_for_pickup"]);
      break;
    case "completed":
      query = query.eq("order_status", "completed");
      break;
    case "cancelled":
      query = query.in("order_status", ["cancelled", "expired"]);
      break;
    default:
      break;
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as OrderWithItems[];
}

export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as OrderWithItems | null;
}
