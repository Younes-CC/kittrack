import Link from "next/link";
import { getAllBooksForAdmin } from "@/lib/admin/books";
import { DeleteBookButton } from "@/components/admin/DeleteBookButton";

export default async function AdminBooksPage() {
  const books = await getAllBooksForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Bücher</h1>
        <Link
          href="/admin/buecher/neu"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dark"
        >
          Buch hinzufügen
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Titel</th>
              <th className="px-4 py-3 font-medium">Autor</th>
              <th className="px-4 py-3 font-medium">Kategorie</th>
              <th className="px-4 py-3 font-medium">Bestand</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-ink">
                  {book.title}
                  {book.is_demo && (
                    <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-accent-dark">
                      DEMO
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-soft">{book.author}</td>
                <td className="px-4 py-3 text-ink-soft">{book.category}</td>
                <td className="px-4 py-3">
                  {book.stock_available} / {book.stock_total}
                </td>
                <td className="px-4 py-3">
                  {book.active ? (
                    <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent-dark">
                      Aktiv
                    </span>
                  ) : (
                    <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink-soft">
                      Deaktiviert
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/buecher/${book.id}`}
                      className="text-sm text-accent-dark hover:underline"
                    >
                      Bearbeiten
                    </Link>
                    <DeleteBookButton bookId={book.id} />
                  </div>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                  Noch keine Bücher angelegt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
