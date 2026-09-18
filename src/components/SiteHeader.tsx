import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="font-display text-xl tracking-tight text-ink">
          Bücher weitergeben
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink-soft">
          <Link href="/#buecher" className="transition hover:text-ink">
            Bücher
          </Link>
          <Link href="/datenschutz" className="transition hover:text-ink">
            Datenschutz
          </Link>
        </nav>
      </div>
    </header>
  );
}
