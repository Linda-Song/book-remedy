import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { allowedMaturity } from "./constants.ts";

// Find up to 10 candidate books for a mood and an optional genre
export async function findCandidates(
  supabase: SupabaseClient,
  moodKey: string,
  genre: string | null,
) {
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
      // No genre chosen: keep children's books out of general picks
      q = q.not("books.genres", "cs", "{kids}");
    }
    return q.order("score", { ascending: false }).limit(30);
  };

  let { data: rows, error } = await buildQuery(true);

  // No book fits this mood + genre: keep the genre, drop the mood
  if (!error && (!rows || rows.length === 0)) {
    ({ data: rows, error } = await buildQuery(false));
  }

  // Same book can appear under several moods: keep the best one, top 10
  const seen = new Set<string>();
  const candidates = (rows ?? [])
    .filter((c: any) => !seen.has(c.isbn13) && seen.add(c.isbn13))
    .slice(0, 10);
  return { candidates, error };
}
