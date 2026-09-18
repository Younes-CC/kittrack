import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/lib/types";

export async function getAllBooksForAdmin(): Promise<Book[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Book[];
}

export async function getBookForAdmin(id: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Book | null;
}
