import Image from "next/image";
import type { Book } from "@/lib/types";

export function OrderBookSummary({ book }: { book: Book }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
        {book.image_url ? (
          <Image src={book.image_url} alt="" fill sizes="64px" className="object-cover" />
        ) : null}
      </div>
      <div>
        <p className="font-display text-lg leading-snug text-ink">{book.title}</p>
        <p className="text-sm text-ink-soft">{book.author}</p>
      </div>
    </div>
  );
}
