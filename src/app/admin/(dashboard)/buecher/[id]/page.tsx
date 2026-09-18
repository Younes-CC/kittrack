import Link from "next/link";
import { notFound } from "next/navigation";
import { BookForm } from "@/components/admin/BookForm";
import { updateBook } from "@/app/admin/actions";
import { getBookForAdmin } from "@/lib/admin/books";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookForAdmin(id);
  if (!book) notFound();

  const updateBookWithId = updateBook.bind(null, book.id);

  return (
    <div className="max-w-xl">
      <Link href="/admin/buecher" className="text-sm text-ink-soft hover:text-ink">
        ← Bücher
      </Link>
      <h1 className="mt-3 font-display text-2xl text-ink">Buch bearbeiten</h1>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <BookForm action={updateBookWithId} book={book} />
      </div>
    </div>
  );
}
