# Bücher weitergeben

Eine schlanke Plattform, um Bücher kostenlos an eine Community weiterzugeben —
Abholung oder Versand (nur Versand-/Verpackungskosten), mit Bestandsverwaltung
und einem geschützten Admin-Bereich. Kein Verkauf, kein Gewerbe.

## Funktionen

- **Öffentliche Bücherplattform** — Startseite mit Hero, Bücherraster, Suche
  und Kategoriefilter.
- **Buchdetailseite** mit Verfügbarkeitsstatus (Verfügbar / Nur noch 1
  verfügbar / Vergriffen).
- **Reservierungsprozess** in zwei Varianten:
  - **Abholung**: nur Name, E-Mail, optional Social-Handle — keine Zahlung.
  - **Versand**: zusätzlich Adresse, danach Zahlungsseite mit Platz für einen
    extern hinterlegten Zahlungslink (z. B. Revolut).
- **Atomare Bestandsverwaltung** über eine Postgres-Funktion — keine
  Überbuchung bei gleichzeitigen Reservierungen.
- **Geschütztes Admin-Dashboard** (`/admin`) via Supabase Auth: Übersicht,
  Bestellungen mit Filtern & Status-Workflow, Bücherverwaltung inkl.
  Bildupload, Einstellungen (Versandpreis, Zahlungslink, Reservierungsdauer).
- **Row Level Security**: Öffentliche Nutzer sehen nur aktive Bücher; alle
  Bestell- und Kundendaten sind ausschließlich für authentifizierte Admins
  bzw. über serverseitige Endpunkte mit dem Service-Role-Key erreichbar.

## Tech-Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth,
Storage) — bewusst schlank gehalten, ohne unnötige Abhängigkeiten.

---

## 1. Installation

```bash
npm install
```

## 2. Environment Variables

Kopiere `.env.example` zu `.env.local` und trage deine Supabase-Werte ein:

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project
  Settings → API im Supabase Dashboard.
- `SUPABASE_SERVICE_ROLE_KEY`: ebenfalls dort — **niemals** in den Browser
  gelangen lassen. Wird ausschließlich in serverseitigen Route Handlern
  verwendet (Bestellung anlegen).

`.env.local` ist in `.gitignore` und wird nicht committet.

## 3. Supabase-Projekt anlegen

1. Neues Projekt auf [supabase.com](https://supabase.com) erstellen.
2. API-URL und Keys wie oben in `.env.local` eintragen.

## 4. SQL-Migrationen ausführen

Die Migrationen liegen in `supabase/migrations/` und bauen aufeinander auf:

| Datei                          | Inhalt                                                        |
| ------------------------------ | -------------------------------------------------------------- |
| `0001_init.sql`                | Tabellen `books`, `orders`, `order_items`, `settings`          |
| `0002_rls.sql`                 | Row Level Security Policies                                    |
| `0003_functions.sql`           | Atomare Funktionen (Reservierung, Statuswechsel, Bestand)       |
| `0004_seed_demo_books.sql`     | 6 als `[DEMO]` markierte Beispielbücher                         |
| `0005_storage.sql`             | Storage-Bucket `book-images` + Policies                         |

**Am schnellsten über die Supabase CLI:**

```bash
npx supabase login
npx supabase link --project-ref <dein-projekt-ref>
npx supabase db push
```

Alternativ: Jede Datei einzeln, in Reihenfolge, im Supabase Dashboard unter
**SQL Editor** ausführen.

## 5. Storage Bucket

Wird durch `0005_storage.sql` automatisch angelegt (`book-images`, öffentlich
lesbar, Schreibzugriff nur für authentifizierte Admins). Kein manueller
Schritt nötig, sofern die Migration ausgeführt wurde.

## 6. Ersten Admin-Account anlegen

Es gibt keine separate Rollentabelle — **jeder authentifizierte
Supabase-User gilt als Admin**. Lege daher nur Accounts für Personen an, die
Zugriff haben sollen:

1. Supabase Dashboard → **Authentication → Users → Add user**.
2. E-Mail + Passwort vergeben (z. B. "Auto Confirm User" aktivieren, damit
   keine Bestätigungsmail nötig ist).
3. Mit diesen Daten unter `/admin/login` einloggen.

## 7. Lokale Entwicklung

```bash
npm run dev
```

- Öffentliche Seite: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## 8. Vercel Deployment

1. Repository zu Vercel importieren.
2. Environment Variables (siehe oben) in den Projekteinstellungen setzen.
3. Deployen — die Architektur ist Standard-App-Router und Vercel-kompatibel.

## 9. Zahlungslink konfigurieren

Es ist **keine Stripe-Integration** eingebaut. Stattdessen wird der externe
Zahlungslink (z. B. dein Revolut-Link) unter **Admin → Einstellungen →
Zahlungslink** hinterlegt und kann jederzeit ohne Code-Änderung angepasst
werden. Solange kein Link hinterlegt ist, sehen Kund:innen auf der
Zahlungsseite einen Hinweis, dass sie separat kontaktiert werden.

Zahlungen werden in Version 1 **manuell** im Admin-Bereich bestätigt
("Zahlung bestätigen") — es wird niemals automatisch angenommen, dass
bezahlt wurde, nur weil jemand vom Zahlungslink zurückkommt.

---

## Datenmodell (Kurzüberblick)

- **books**: `title`, `author`, `category`, `description`, `condition`,
  `image_url`, `stock_total`, `stock_available`, `active`, `is_demo`.
- **orders**: `public_order_number` (z. B. `MB-7K3F2`), `delivery_type`
  (`pickup`/`shipping`), Kontakt- & Adressdaten, `shipping_price`,
  `payment_status`, `order_status`, `reservation_expires_at`.
- **order_items**: Bestellposition mit Titel-/Autor-Snapshot (bleibt auch
  erhalten, falls ein Buch später gelöscht wird).
- **settings**: Singleton-Zeile mit `shipping_price`, `payment_url`,
  `reservation_duration_hours`.

Bestandsänderungen laufen ausschließlich über die Postgres-Funktionen in
`0003_functions.sql` (`create_reservation`, `admin_update_order_status`,
`admin_confirm_payment`, `admin_set_stock_total`) — dadurch sind sie atomar
und race-condition-sicher, auch bei parallelen Reservierungen.

## Reservierungsablauf

- **Versand**: Bestellung startet als `awaiting_payment` /
  `pending`-Zahlung, `reservation_expires_at` = jetzt + Reservierungsdauer
  (Standard 24h, in den Einstellungen änderbar).
- **Abholung**: Bestellung startet als `reserved`, keine Zahlung nötig,
  `reservation_expires_at` = 7 Tage (Übergabe wird separat vereinbart).
- **Automatisches Ablaufen** von Reservierungen ist vorbereitet
  (`reservation_expires_at` in der DB), aber **nicht automatisiert** — es
  müsste per Cron/Scheduled Function periodisch `admin_update_order_status`
  mit Status `expired` für abgelaufene Bestellungen aufgerufen werden. Bis
  dahin storniert der Admin manuell im Dashboard (Bestand wird dabei korrekt
  zurückgegeben).

## Sicherheit

- Row Level Security ist auf allen Tabellen aktiv.
- Öffentliche Nutzer können nur aktive Bücher lesen und über die
  serverseitige Route `POST /api/orders` reservieren — nie direkt auf
  `orders`/`order_items` zugreifen.
- Der Service-Role-Key wird ausschließlich in `src/lib/supabase/admin.ts`
  (serverseitig, `import "server-only"`) verwendet.
- Server Actions im Admin-Bereich prüfen zusätzlich zur RLS explizit, ob
  eine Session vorhanden ist.
- Basis-Ratenbegrenzung gegen Massen-Fake-Reservierungen: In-Memory-Limit pro
  IP (bestbemüht, da serverless Instanzen ephemer sind) plus eine
  zuverlässigere Datenbankprüfung auf zu viele Bestellungen derselben
  E-Mail-Adresse pro Stunde. Für höheres Volumen empfiehlt sich zusätzlich
  ein Dienst wie Vercel Firewall / Cloudflare Turnstile.

## Was noch nicht automatisiert ist

- Automatisches Ablaufen abgelaufener Reservierungen (siehe oben) — aktuell
  manuelle Stornierung im Admin-Bereich.
- Zahlungsabwicklung (bewusst extern, siehe Anforderung — kein Stripe).
- Versand von Bestätigungs-/Status-E-Mails an Kund:innen (aktuell nur
  Bildschirm-Bestätigung; E-Mail-Versand ließe sich später z. B. über einen
  Supabase Edge Function + E-Mail-Provider ergänzen).

## Demo-Daten

`0004_seed_demo_books.sql` legt 6 eindeutig mit `[DEMO]` im Titel markierte
Bücher an, um Layout und Funktionen zu testen. Im Admin-Bereich unter
**Bücher** jederzeit löschbar oder deaktivierbar, sobald echte Bücher
gepflegt sind.

## Erstes echtes Buch hinzufügen

1. Unter `/admin/login` einloggen.
2. **Bücher → Buch hinzufügen**.
3. Titel, Autor, Kategorie, optional Beschreibung/Zustand, Anzahl und ein
   Foto hochladen, speichern.

Danach erscheint es sofort auf der öffentlichen Startseite (sofern "aktiv").
