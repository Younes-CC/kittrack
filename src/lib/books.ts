import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/lib/types";

export async function getActiveBooks(): Promise<Book[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Book[];
}

export async function getBookById(id: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;
  return data as Book | null;
}
