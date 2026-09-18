import { createClient } from "@/lib/supabase/server";
import type { Settings } from "@/lib/types";

export async function getSettings(): Promise<Settings> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("settings").select("*").single();
  if (error) throw error;
  return data as Settings;
}
