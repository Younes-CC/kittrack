import Link from "next/link";
import { BookForm } from "@/components/admin/BookForm";
import { createBook } from "@/app/admin/actions";

export default function NewBookPage() {
  return (
    <div className="max-w-xl">
      <Link href="/admin/buecher" className="text-sm text-ink-soft hover:text-ink">
        ← Bücher
      </Link>
      <h1 className="mt-3 font-display text-2xl text-ink">Buch hinzufügen</h1>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <BookForm action={createBook} />
      </div>
    </div>
  );
}
