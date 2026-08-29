# Salonverwaltung

Verwaltungssystem für einen Friseursalon: Terminkalender, Preisliste, Kunden- und
Mitarbeiterverwaltung sowie eine Online-Buchungsseite für Kunden.

## Funktionen

- **Übersicht** – Tagesstatistiken (Termine, Umsatz, Auslastung) und die heutigen Termine
- **Termine** – Tageskalender mit einer Spalte pro Mitarbeiter, Termine per Klick anlegen/bearbeiten/stornieren
- **Kunden** – Kundendatenbank mit Suche und vollständigem Terminverlauf pro Kunde
- **Leistungen & Preise** – Preisliste nach Kategorien, direkt bearbeitbar
- **Mitarbeiter** – Team mit Kalenderfarbe und Aktiv/Inaktiv-Status
- **Einstellungen** – Salon-Stammdaten und Öffnungszeiten je Wochentag
- **Online-Buchung** (`/buchen`) – öffentliche, kundenseitige Buchungsstrecke: Leistung
  (mit Preis) → Mitarbeiter → freier Termin → Kontaktdaten → Bestätigung

## Erste Schritte

```bash
npm install
npm run dev
```

Anschließend [http://localhost:3000](http://localhost:3000) öffnen (Verwaltung) bzw.
[http://localhost:3000/buchen](http://localhost:3000/buchen) (Online-Buchung für Kunden).

Die Anwendung legt beim ersten Start automatisch eine lokale SQLite-Datenbank
(`data/salon.db`) mit Beispieldaten an (Leistungen, Preise, Mitarbeiter, Kunden,
Termine) – es ist keine weitere Einrichtung nötig.

Für eine Produktions-Vorschau:

```bash
npm run build
npm run start
```

## Technik

Next.js (App Router) mit TypeScript, Tailwind CSS und einer lokalen SQLite-Datenbank
(`better-sqlite3`) — läuft komplett offline, ideal für eine Vor-Ort-Demo.
