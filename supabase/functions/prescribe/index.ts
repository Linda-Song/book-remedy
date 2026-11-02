import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  GENRE_KEYS,
  MOOD_KEYS,
  SUPPORT_NOTE,
  isCrisisText,
} from "./constants.ts";
import { askClaude } from "./ai.ts";
import { findCandidates } from "./candidates.ts";

Deno.serve(async (req) => {
  try {
    const {
      moodKey: rawMood,
      genreKey,
      ownerKey,
      freeText,
      skipCrisis,
    } = await req.json();

    // Checked before the usage limit, so it never uses up a prescription
    if (!skipCrisis && freeText && isCrisisText(freeText)) {
      return new Response(JSON.stringify({ crisis: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify the user from the token
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: userData } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null } };

    const userId = userData.user?.id ?? null;
    const isGuest = !userId;
    const owner = userId ?? ownerKey;

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
    // The text was flagged but the reader chose to continue: stay gentle
    const flagged = !!freeText && isCrisisText(freeText);
    // Free text without a mood: use a default until Claude picks among candidates
    const moodKey = flagged
      ? "comfort"
      : MOOD_KEYS.includes(rawMood)
        ? rawMood
        : "comfort";

    // Only accept a known genre; anything else means "any genre".
    // A flagged text ignores the genre so the pick can stay gentle.
    const genre = !flagged && GENRE_KEYS.includes(genreKey) ? genreKey : null;

    const { candidates, error: candidateError } = await findCandidates(
      supabase,
      moodKey,
      genre,
    );
    if (candidateError || candidates.length === 0) {
      return new Response(JSON.stringify({ error: "no candidates found" }), {
        status: 404,
      });
    }

    // Describe the reader's mood for the prompt
    const moodText = freeText?.trim() || `I'm in the mood for: ${moodKey}`;

    const ai = await askClaude(
      moodText,
      genre,
      candidates.map((c: any) => ({
        isbn13: c.isbn13,
        title: c.books.title,
        author: c.books.author,
        about: c.books.about,
      })),
    );

    // Fallback: top-scored candidate if the AI failed or returned something invalid
    const picked = ai
      ? candidates.find((c: any) => c.isbn13 === ai.isbn13)!
      : candidates[0];
    const baseReason =
      ai?.reason ??
      (flagged
        ? "I'm sorry things feel so heavy right now. This is a gentle read to keep you company."
        : "You wanted something for this mood, and this book fits well.");
    const reason =
      ai?.heavy || flagged ? `${baseReason} ${SUPPORT_NOTE}` : baseReason;
    const dosage = ai?.dosage ?? "20 pages in the evening, for one week.";

    const { data: prescription, error: insertError } = await supabase
      .from("prescriptions")
      .insert({
        user_id: userId,
        guest_id: isGuest ? ownerKey : null,
        mood_key: moodKey,
        free_text: freeText ?? null,
        genre_key: genre,
        isbn13: picked.isbn13,
        reason,
        dosage,
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
