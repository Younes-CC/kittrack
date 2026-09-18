import Link from "next/link";
import { BookGrid } from "@/components/BookGrid";
import { getActiveBooks } from "@/lib/books";

export default async function HomePage() {
  const books = await getActiveBooks();

  return (
    <div className="flex flex-col gap-16 pb-20 sm:gap-20">
      <section className="mx-auto max-w-3xl px-5 pt-14 text-center sm:pt-20">
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
          Bücher, die weitergegeben werden.
        </h1>
        <p className="mt-5 text-balance text-base leading-relaxed text-ink-soft sm:text-lg">
          Ich gebe einen Teil meiner Bücher kostenlos an meine Community weiter. Such dir
          ein Buch aus, das dir wirklich Mehrwert bietet. Das Buch ist kostenlos — bei
          Versand übernimmst du lediglich Versand und Verpackung.
        </p>
        <Link
          href="#buecher"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition hover:bg-accent-dark"
        >
          Bücher entdecken
        </Link>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <BookGrid books={books} />
      </section>
    </div>
  );
}
