import "server-only";

/**
 * Sehr einfacher In-Memory-Sliding-Window-Limiter als erste Schutzschicht
 * gegen Massen-Fake-Reservierungen. Da Next.js/Vercel Instanzen ephemer
 * sind, ist dies kein vollständiger Schutz — die zweite, zuverlässigere
 * Schicht ist die Datenbankprüfung auf zu viele Bestellungen derselben
 * E-Mail-Adresse in der Bestell-Route (siehe src/app/api/orders/route.ts).
 */
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS_PER_WINDOW = 8;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(key, timestamps);

  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return timestamps.length > MAX_HITS_PER_WINDOW;
}

export function clientIpFrom(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
