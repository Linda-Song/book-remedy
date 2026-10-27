import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const { moodKey, genreKey, ownerKey, isGuest } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const limit = isGuest ? 1 : 3;
    const { data: usedCount, error: usageError } = await supabase.rpc(
      "check_and_increment_usage",
      { p_owner_key: ownerKey, p_limit: limit },
    );
    if (usageError) {
      return new Response(JSON.stringify({ error: "usage check failed" }), {
        status: 500,
      });
    }
    if (usedCount === -1) {
      return new Response(JSON.stringify({ error: "limit reached" }), {
        status: 429,
      });
    }
    const { data: candidates, error: candidateError } = await supabase
      .from("book_moods")
      .select("isbn13, score, books(*)")
      .eq("mood_key", moodKey)
      .order("score", { ascending: false })
      .limit(10);
    if (candidateError || !candidates || candidates.length === 0) {
      return new Response(JSON.stringify({ error: "no candidates found" }), {
        status: 404,
      });
    }
    const picked = candidates[0];
    const { data: prescription, error: insertError } = await supabase
      .from("prescriptions")
      .insert({
        user_id: isGuest ? null : ownerKey,
        guest_id: isGuest ? ownerKey : null,
        mood_key: moodKey,
        genre_key: genreKey ?? null,
        isbn13: picked.isbn13,
        reason: "You wanted something for this mood, and this book fits well.",
        dosage: "20 pages in the evening, for one week.",
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ prescription, book: picked.books }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});
