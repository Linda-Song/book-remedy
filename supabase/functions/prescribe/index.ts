import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const { moodKey: rawMood, genreKey, ownerKey, freeText } = await req.json();
    // Temporary: free text has no mood yet, so fall back until AI interprets it
    const moodKey = rawMood ?? "comfort";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // checking token
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: userData } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null } };

    const userId = userData.user?.id ?? null;
    const isGuest = !userId;
    const owner = userId ?? ownerKey; // 회원이면 서버가 확인한 id

    // ownerKey
    if (!owner) {
      return new Response(JSON.stringify({ error: "missing owner" }), {
        status: 400,
      });
    }

    const limit = isGuest ? 1 : 3;
    const { data: usedCount, error: usageError } = await supabase.rpc(
      "check_and_increment_usage",
      { p_owner_key: owner, p_limit: limit },
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
        user_id: userId,
        guest_id: isGuest ? ownerKey : null,
        mood_key: moodKey,
        free_text: freeText ?? null,
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
