"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBook } from "@/app/admin/actions";

export function DeleteBookButton({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Dieses Buch wirklich endgültig löschen?")) return;
    startTransition(async () => {
      try {
        await deleteBook(bookId);
        router.refresh();
      } catch (error) {
        alert(error instanceof Error ? error.message : "Löschen fehlgeschlagen.");
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleDelete}
      className="text-sm text-ink-soft transition hover:text-accent-dark disabled:opacity-60"
    >
      Löschen
    </button>
  );
}
