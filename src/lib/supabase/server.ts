import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase-Client für Server Components / Server Actions / Route Handler.
 * Nutzt den anon Key + die Session-Cookies des eingeloggten Admins — RLS
 * bleibt dadurch für Admin-Zugriffe wirksam.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // In Server Components darf setAll nicht schreiben — wird von
            // der Middleware übernommen, die die Session refresht.
          }
        },
      },
    },
  );
}
