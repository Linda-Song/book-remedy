import { createClient } from "jsr:@supabase/supabase-js@2";

// Known mood keys, used to interpret free text
const MOOD_KEYS = [
  "comfort",
  "excited",
  "thrill",
  "calm",
  "think",
  "laugh",
  "escape",
  "nostalgia",
  "boost",
  "romance",
  "learn",
  "courage",
];

const MODEL = "claude-haiku-5-5"; // check the current model name in the Anthropic docs
const GENRE_KEYS = [
  "fiction",
  "mystery",
  "thriller",
  "romance",
  "fantasy",
  "scifi",
  "historical",
  "humor",
  "classics",
  "kids",
  "teen",
  "biography",
  "self-growth",
  "psychology",
  "philosophy",
  "science",
  "nature",
  "history",
  "poetry",
  "travel",
];

// Which maturity levels each genre may show
function allowedMaturity(genre: string | null): string[] {
  if (genre === "kids") return ["all_ages"];
  if (genre === "teen") return ["all_ages", "teen"];
  return ["all_ages", "teen", "adult"];
}

type Pick = { isbn13: string; reason: string; dosage: string };

// Ask Claude to choose one candidate and write the reason and dosage
async function askClaude(
  moodText: string,
  genreKey: string | null,
  candidates: {
    isbn13: string;
    title: string;
    author: string;
    about: string;
  }[],
): Promise<Pick | null> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");

  if (!apiKey) return null;

  const prompt = `You are a warm, careful book recommender.
The reader feels: "${moodText}"
Preferred genre: ${genreKey ?? "any"}

Choose exactly ONE book from this list (use its isbn13 exactly):
${candidates
  .map((c) => `- ${c.isbn13} | ${c.title} by ${c.author} | ${c.about}`)
  .join("\n")}

Reply with JSON only, no other text:
{"isbn13": "...", "reason": "1-2 warm sentences on why this fits the reader", "dosage": "a short reading suggestion, e.g. 20 pages each evening"}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error("Claude API error:", res.status, await res.text());
      return null;
    }

    const json = await res.json();
    // The first block may not be text, so look for the text block
    const text: string =
      json.content?.find((c: { type: string }) => c.type === "text")?.text ??
      "";
    if (!text.includes("{")) {
      console.error("No JSON in response:", JSON.stringify(json).slice(0, 400));
      return null;
    }
    const parsed = JSON.parse(
      text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1),
    );

    // Validate: the pick must be one of the candidates we offered
    if (!candidates.some((c) => c.isbn13 === parsed.isbn13)) return null;
    if (typeof parsed.reason !== "string" || typeof parsed.dosage !== "string")
      return null;
    return parsed as Pick;
  } catch (err) {
    console.error("Claude call failed:", err);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const { moodKey: rawMood, genreKey, ownerKey, freeText } = await req.json();

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

    // Free text without a mood: use a default until Claude picks among candidates
    const moodKey = MOOD_KEYS.includes(rawMood) ? rawMood : "comfort";

    // Only accept a known genre; anything else means "any genre"
    const genre = GENRE_KEYS.includes(genreKey) ? genreKey : null;

    let query = supabase
      .from("book_moods")
      .select("isbn13, score, books!inner(*)")
      .eq("mood_key", moodKey)
      .in("books.maturity", allowedMaturity(genre));

    if (genre) {
      // Only books tagged with the chosen genre
      query = query.contains("books.genres", [genre]);
    } else {
      // No genre chosen: keep children's books out of general picks
      query = query.not("books.genres", "cs", "{kids}");
    }

    const { data: candidates, error: candidateError } = await query
      .order("score", { ascending: false })
      .limit(10);

    if (candidateError || !candidates || candidates.length === 0) {
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
    const reason =
      ai?.reason ??
      "You wanted something for this mood, and this book fits well.";
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
