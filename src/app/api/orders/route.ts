import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrderSchema } from "@/lib/validation";
import { clientIpFrom, isRateLimited } from "@/lib/rate-limit";

const MAX_ORDERS_PER_EMAIL_PER_HOUR = 3;

export async function POST(request: Request) {
  const ip = clientIpFrom(request.headers);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuche es später erneut." },
      { status: 429 },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Bitte überprüfe deine Angaben.", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  if (input.website) {
    // Honeypot ausgelöst — stiller Erfolg vortäuschen, nichts anlegen.
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const supabase = createAdminClient();

  const { count: recentOrdersFromEmail } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("email", input.email)
    .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());

  if ((recentOrdersFromEmail ?? 0) >= MAX_ORDERS_PER_EMAIL_PER_HOUR) {
    return NextResponse.json(
      {
        error:
          "Du hast bereits mehrere Reservierungen angelegt. Bitte warte etwas, bevor du eine weitere Anfrage sendest.",
      },
      { status: 429 },
    );
  }

  const { data, error } = await supabase
    .rpc("create_reservation", {
      p_book_id: input.bookId,
      p_delivery_type: input.deliveryType,
      p_first_name: input.firstName,
      p_last_name: input.lastName,
      p_email: input.email,
      p_social_handle: input.socialHandle || null,
      p_street: input.deliveryType === "shipping" ? input.street : null,
      p_house_number: input.deliveryType === "shipping" ? input.houseNumber : null,
      p_postal_code: input.deliveryType === "shipping" ? input.postalCode : null,
      p_city: input.deliveryType === "shipping" ? input.city : null,
      p_country: input.deliveryType === "shipping" ? input.country : null,
    })
    .single();

  if (error) {
    if (error.message.includes("BOOK_UNAVAILABLE")) {
      return NextResponse.json(
        { error: "Dieses Buch ist leider gerade nicht mehr verfügbar." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Die Reservierung konnte nicht angelegt werden." },
      { status: 500 },
    );
  }

  return NextResponse.json({ order: data }, { status: 201 });
}
