import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminStats {
  booksTotal: number;
  booksAvailable: number;
  activeReservations: number;
  shipped: number;
  paymentsPending: number;
  pickupsOpen: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const [
    booksTotal,
    booksAvailable,
    activeReservations,
    shipped,
    paymentsPending,
    pickupsOpen,
  ] = await Promise.all([
    supabase.from("books").select("id", { count: "exact", head: true }),
    supabase
      .from("books")
      .select("id", { count: "exact", head: true })
      .eq("active", true)
      .gt("stock_available", 0),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .not("order_status", "in", "(completed,cancelled,expired)"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("order_status", "shipped"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "pending"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("delivery_type", "pickup")
      .in("order_status", ["reserved", "ready_for_pickup"]),
  ]);

  return {
    booksTotal: booksTotal.count ?? 0,
    booksAvailable: booksAvailable.count ?? 0,
    activeReservations: activeReservations.count ?? 0,
    shipped: shipped.count ?? 0,
    paymentsPending: paymentsPending.count ?? 0,
    pickupsOpen: pickupsOpen.count ?? 0,
  };
}
