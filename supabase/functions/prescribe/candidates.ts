import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { allowedMaturity } from "./constants.ts";

const POOL = 30; // best-scored books we pick from
const PICKS = 10; // random books sent to Claude
const MIN_FRESH = 3; // below this, allow books the reader already got

// Who is asking: a signed-in user or a guest
export type Owner = { column: "user_id" | "guest_id"; value: string };

// Shuffle a copy of the array (Fisher-Yates)
function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Find up to 10 candidate books for a mood and an optional genre
export async function findCandidates(
  supabase: SupabaseClient,
  moodKey: string,
  genre: string | null,
  owner: Owner,
) {
  // Books this reader has already been prescribed
  const { data: past } = await supabase
    .from("prescriptions")
    .select("isbn13")
    .eq(owner.column, owner.value);
  const alreadyGot = new Set((past ?? []).map((p: any) => p.isbn13));

  // withMood=false keeps the genre but ignores the mood
  const buildQuery = (withMood: boolean) => {
    let q = supabase
      .from("book_moods")
      .select("isbn13, score, books!inner(*)")
      .in("books.maturity", allowedMaturity(genre));
    if (withMood) q = q.eq("mood_key", moodKey);
    if (genre) {
      // Only books tagged with the chosen genre
      q = q.contains("books.genres", [genre]);
    } else {
      // No genre chosen: keep childlike books out of general picks
      q = q.not("books.genres", "cs", "{childlike}");
    }
    // Fetch extra rows so there is room to skip books already given
    return q.order("score", { ascending: false }).limit(100);
  };

  let { data: rows, error } = await buildQuery(true);

  // No book fits this mood + genre: keep the genre, drop the mood
  if (!error && (!rows || rows.length === 0)) {
    ({ data: rows, error } = await buildQuery(false));
  }

  // Same book can appear under several moods: keep the best one
  const seen = new Set<string>();
  const unique: any[] = (rows ?? []).filter(
    (c: any) => !seen.has(c.isbn13) && seen.add(c.isbn13),
  );

  // Prefer new books; if too few are left, allow repeats
  const fresh = unique.filter((c) => !alreadyGot.has(c.isbn13));
  const pool = fresh.length >= MIN_FRESH ? fresh : unique;

  // Top 30 by score -> random 10 -> best score first (fallback uses [0])
  const candidates: any[] = shuffle<any>(pool.slice(0, POOL))
    .slice(0, PICKS)
    .sort((a, b) => b.score - a.score);

  return { candidates, error };
}
