import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>Bücher werden kostenlos weitergegeben — kein Verkauf, kein Gewerbe.</p>
        <Link href="/datenschutz" className="transition hover:text-ink">
          Datenschutzerklärung
        </Link>
      </div>
    </footer>
  );
}
