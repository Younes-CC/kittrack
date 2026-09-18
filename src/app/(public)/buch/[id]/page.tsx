import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { getBookById } from "@/lib/books";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) notFound();

  const available = book.stock_available > 0;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 pb-28 sm:px-8 sm:pb-16">
      <Link href="/#buecher" className="text-sm text-ink-soft transition hover:text-ink">
        ← Zurück zur Übersicht
      </Link>

      <div className="mt-6 grid gap-10 sm:grid-cols-2 sm:gap-12">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-cream">
          {book.image_url ? (
            <Image
              src={book.image_url}
              alt={`Cover von ${book.title}`}
              fill
              sizes="(min-width: 640px) 45vw, 90vw"
              className={`object-cover ${available ? "" : "grayscale-[35%] opacity-70"}`}
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-8 text-center font-display text-xl text-ink-soft">
              {book.title}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <span className="text-xs uppercase tracking-wide text-ink-soft">
              {book.category}
            </span>
            <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
              {book.title}
            </h1>
            <p className="mt-1 text-lg text-ink-soft">{book.author}</p>
          </div>

          <StatusBadge stockAvailable={book.stock_available} />

          {book.description && (
            <p className="leading-relaxed text-ink-soft">{book.description}</p>
          )}

          {book.condition && (
            <p className="text-sm text-ink-soft">
              <span className="font-medium text-ink">Zustand: </span>
              {book.condition}
            </p>
          )}

          <div className="hidden sm:block">
            {available ? (
              <Link
                href={`/bestellen/${book.id}/uebergabe`}
                className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition hover:bg-accent-dark"
              >
                Dieses Buch auswählen
              </Link>
            ) : (
              <span className="inline-flex items-center justify-center rounded-full bg-ink/5 px-7 py-3 text-sm font-medium text-ink-soft">
                Vergriffen
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sticky CTA für Mobile */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-surface/95 p-4 backdrop-blur sm:hidden">
        {available ? (
          <Link
            href={`/bestellen/${book.id}/uebergabe`}
            className="flex w-full items-center justify-center rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-white"
          >
            Dieses Buch auswählen
          </Link>
        ) : (
          <span className="flex w-full items-center justify-center rounded-full bg-ink/5 px-6 py-3.5 text-sm font-medium text-ink-soft">
            Vergriffen
          </span>
        )}
      </div>
    </div>
  );
}
