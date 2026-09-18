"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BOOK_CATEGORIES, type BookCategory, type OrderStatus } from "@/lib/types";

/**
 * Server Actions sind über POST von außen erreichbar — Render-Gating allein
 * ist kein Sicherheitsmerkmal. RLS blockt unautorisierte Schreibzugriffe
 * ohnehin, aber wir prüfen zusätzlich explizit, um mit einer klaren
 * Fehlermeldung statt einem rohen Postgres-Fehler zu scheitern.
 */
async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const { error } = await supabase.rpc("admin_update_order_status", {
    p_order_id: orderId,
    p_new_status: newStatus,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/bestellungen");
  revalidatePath(`/admin/bestellungen/${orderId}`);
  revalidatePath("/admin");
}

export async function confirmPayment(orderId: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const { error } = await supabase.rpc("admin_confirm_payment", {
    p_order_id: orderId,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/bestellungen");
  revalidatePath(`/admin/bestellungen/${orderId}`);
  revalidatePath("/admin");
}

function parseBookFields(formData: FormData) {
  const category = formData.get("category");
  if (
    typeof category !== "string" ||
    !(BOOK_CATEGORIES as readonly string[]).includes(category)
  ) {
    throw new Error("Ungültige Kategorie.");
  }
  const typedCategory = category as BookCategory;

  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  if (!title || !author) throw new Error("Titel und Autor sind Pflichtfelder.");

  const stockTotal = Number(formData.get("stockTotal") ?? 1);
  if (!Number.isFinite(stockTotal) || stockTotal < 0) {
    throw new Error("Ungültige Anzahl.");
  }

  return {
    title,
    author,
    category: typedCategory,
    description: (String(formData.get("description") ?? "").trim() || null) as
      | string
      | null,
    condition: (String(formData.get("condition") ?? "").trim() || null) as
      | string
      | null,
    stockTotal,
    active: formData.get("active") === "on",
  };
}

async function uploadBookImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return null;

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("book-images").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw new Error(`Bild-Upload fehlgeschlagen: ${error.message}`);

  const { data } = supabase.storage.from("book-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function createBook(formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const fields = parseBookFields(formData);
  const imageUrl = await uploadBookImage(formData);

  const { error } = await supabase.from("books").insert({
    title: fields.title,
    author: fields.author,
    category: fields.category,
    description: fields.description,
    condition: fields.condition,
    stock_total: fields.stockTotal,
    stock_available: fields.stockTotal,
    active: fields.active,
    image_url: imageUrl,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/buecher");
  revalidatePath("/");
  redirect("/admin/buecher");
}

export async function updateBook(bookId: string, formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const fields = parseBookFields(formData);
  const imageUrl = await uploadBookImage(formData);

  if (Number.isFinite(fields.stockTotal)) {
    const { error: stockError } = await supabase.rpc("admin_set_stock_total", {
      p_book_id: bookId,
      p_new_total: fields.stockTotal,
    });
    if (stockError) {
      throw new Error(
        stockError.message.includes("STOCK_TOTAL_BELOW_RESERVED")
          ? "Der Gesamtbestand darf nicht unter die Anzahl bereits reservierter Bücher fallen."
          : stockError.message,
      );
    }
  }

  const { error } = await supabase
    .from("books")
    .update({
      title: fields.title,
      author: fields.author,
      category: fields.category,
      description: fields.description,
      condition: fields.condition,
      active: fields.active,
      ...(imageUrl ? { image_url: imageUrl } : {}),
    })
    .eq("id", bookId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/buecher");
  revalidatePath(`/admin/buecher/${bookId}`);
  revalidatePath("/");
  redirect("/admin/buecher");
}

export async function deleteBook(bookId: string) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("order_id")
    .eq("book_id", bookId);
  if (itemsError) throw new Error(itemsError.message);

  if (items && items.length > 0) {
    const orderIds = [...new Set(items.map((item) => item.order_id))];
    const { count, error: countError } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("id", orderIds)
      .not("order_status", "in", "(completed,cancelled,expired)");
    if (countError) throw new Error(countError.message);

    if ((count ?? 0) > 0) {
      throw new Error(
        "Dieses Buch hat noch offene Bestellungen und kann nicht gelöscht werden. Deaktiviere es stattdessen.",
      );
    }
  }

  const { error } = await supabase.from("books").delete().eq("id", bookId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/buecher");
  revalidatePath("/");
}

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const shippingPrice = Number(formData.get("shippingPrice"));
  const reservationDurationHours = Number(formData.get("reservationDurationHours"));
  const paymentUrl = String(formData.get("paymentUrl") ?? "").trim() || null;

  if (!Number.isFinite(shippingPrice) || shippingPrice < 0) {
    throw new Error("Ungültiger Versandpreis.");
  }
  if (!Number.isFinite(reservationDurationHours) || reservationDurationHours <= 0) {
    throw new Error("Ungültige Reservierungsdauer.");
  }

  const { error } = await supabase
    .from("settings")
    .update({
      shipping_price: shippingPrice,
      reservation_duration_hours: reservationDurationHours,
      payment_url: paymentUrl,
    })
    .eq("id", true);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/einstellungen");
}
