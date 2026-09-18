import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import type { Book } from "@/lib/types";

export function BookCard({ book }: { book: Book }) {
  const outOfStock = book.stock_available <= 0;

  return (
    <Link
      href={`/buch/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-accent/40 hover:shadow-[0_8px_30px_-12px_rgba(36,31,28,0.15)]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-cream">
        {book.image_url ? (
          <Image
            src={book.image_url}
            alt={`Cover von ${book.title}`}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 90vw"
            className={`object-cover transition duration-500 group-hover:scale-[1.03] ${
              outOfStock ? "grayscale-[35%] opacity-70" : ""
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 text-center font-display text-sm text-ink-soft">
            {book.title}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs uppercase tracking-wide text-ink-soft">{book.category}</span>
        <h3 className="font-display text-lg leading-snug text-ink">{book.title}</h3>
        <p className="text-sm text-ink-soft">{book.author}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <StatusBadge stockAvailable={book.stock_available} />
          <span className="text-sm font-medium text-accent-dark transition group-hover:translate-x-0.5">
            Buch ansehen →
          </span>
        </div>
      </div>
    </Link>
  );
}
