// Step 4: classify enriched NYT books with Claude (genres, moods, maturity, blurb, sequel).
// Reads scripts/nyt-enriched.json, writes scripts/nyt-classified.json. Safe to stop and re-run.
// Test first:  LIMIT=20 node --env-file=.env --env-file=scripts/.env scripts/nyt-classify.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_KEY) {
  console.error("Missing ANTHROPIC_API_KEY");
  process.exit(1);
}

const MODEL = "claude-haiku-5-5";
const LIMIT = Number(process.env.LIMIT ?? 0); // 0 = all
const CONCURRENCY = 4;
const IN = "scripts/nyt-enriched.json";
const OUT = "scripts/nyt-classified.json";
const PRICE_IN = 0.1 / 1e6; // $ per input token (Haiku 5.5, prompts under 100K)
const PRICE_OUT = 0.5 / 1e6; // $ per output token

const MOODS = [
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
const GENRES = [
  "fiction",
  "mystery",
  "thriller",
  "romance",
  "fantasy",
  "humor",
  "biography",
  "self-growth",
  "mind",
  "science",
  "travel",
  "childlike",
];

const BLOCKED =
  /\b(erotic|erotica|bdsm|porn|pornographic|sexually explicit|xxx|fetish)\b/i;
const ACADEMIC =
  /\b(rethinking|essays on|companion to|studies in|narratives of|spaces of|politics of)\b/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- 1) Pick the books to classify ----
const enriched = Object.values(JSON.parse(readFileSync(IN, "utf8")));
const cache = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, "utf8"))
  : { books: {}, usage: { input: 0, output: 0, calls: 0 } };
const save = () => writeFileSync(OUT, JSON.stringify(cache));

let skipped = { noDesc: 0, blocked: 0 };
let todo = [];
for (const b of enriched) {
  if (!b.checked) continue;
  const about = [b.description ?? "", b.gDescription ?? ""]
    .sort((x, y) => y.length - x.length)[0]
    .replace(/<[^>]*>/g, "")
    .slice(0, 700);
  if (about.length < 150) {
    skipped.noDesc++;
    continue;
  }
  if (BLOCKED.test(`${b.title} ${about}`) || ACADEMIC.test(b.title)) {
    skipped.blocked++;
    continue;
  }
  todo.push({ ...b, about });
}
todo.sort((a, b) => b.nytScore - a.nytScore);
console.log(
  `enriched ${enriched.length}, usable ${todo.length}, skipped`,
  skipped,
);
if (LIMIT) todo = todo.slice(0, LIMIT);
todo = todo.filter((b) => !cache.books[b.isbn13]);
console.log(`to classify now: ${todo.length}`);

// ---- 2) Ask Claude ----
async function classify(b) {
  const prompt = `You help build a mood-based book recommendation catalog.

Book: ${b.title} by ${b.author}
Description: ${b.about}
NYT bestseller lists it appeared on: ${b.lists.join(", ")}

Tasks:
1. "genres": choose 1 or 2 genre keys from this list, best first (add a second only if it clearly applies):
${GENRES.join(", ")}
Genre meanings:
- fiction: general, literary, contemporary or historical novels (and classics) that fit no more specific genre
- mystery: detective stories, whodunits, crime puzzles
- thriller: suspense, psychological thrillers, action
- romance: love stories
- fantasy: fantasy and science fiction, magic, other worlds, dystopias
- humor: funny novels, memoirs or essays
- biography: memoirs, biographies, and true stories about real people or events (including narrative history)
- self-growth: self-help, habits, productivity, money, career, relationships advice
- mind: psychology, philosophy, how people and society think
- science: science, nature, medicine, technology
- travel: travel writing and adventure memoirs (NOT guidebooks)
- childlike: warm, whimsical books written for children or teens that adults also love for their wonder and gentleness
Rules:
- Books written mainly for children or teenagers (picture books, middle grade, young adult) may ONLY be "childlike", and only if adults would enjoy them for their warmth and wonder. Otherwise return an empty list. Never give them other genres.
- If no genre fits (cookbooks, politics, religion, crafts, reference), return an empty list.
2. "moods": rate how well the book suits a reader in each mood, 0 to 1.
Mood definitions:
- comfort: warm and gentle
- excited: fun and fast
- thrill: edge of your seat
- calm: slow and quiet
- think: makes you think
- laugh: light and funny
- escape: takes you away
- nostalgia: warm and familiar
- boost: fired up, motivating
- romance: butterflies
- learn: teaches something
- courage: helps you be brave
Scoring rules:
- Most moods should be below 0.3 for any book.
- Use 0.7 or higher only for the 2 or 3 moods that clearly fit.
- For comfort, calm, and boost, give low scores to books centered on abuse, suicide, or trauma.

3. "maturity": one of
- "all_ages": suitable for young children
- "teen": mild peril or romance, suitable for teenagers
- "adult": mature themes (war, loss, violence, sexuality in context) but not graphic
- "explicit": pornographic content, material that sexualizes minors, or hate propaganda
Books widely sold in mainstream bookstores, bestsellers, classics, and award winners are NOT "explicit", even with mature themes. Use "explicit" rarely.

4. "blurb": exactly 2 warm sentences describing the book. Use ONLY facts stated in the description above. Do not invent characters, plot points, or endings. No spoilers.

5. "later_in_series": true only if this book is clearly NOT the first book of a series (the description says so, or you are sure from the title). Otherwise false.

Reply with JSON only:
{"genres": ["..."], "maturity": "adult", "moods": {"comfort": 0.8, ...all 12 moods}, "blurb": "...", "later_in_series": false}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1200,
        thinking: { type: "disabled" },
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (res.status === 429 || res.status >= 500) {
      await sleep(3000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
    const json = await res.json();
    cache.usage.input += json.usage?.input_tokens ?? 0;
    cache.usage.output += json.usage?.output_tokens ?? 0;
    cache.usage.calls += 1;
    const text = json.content?.find((c) => c.type === "text")?.text ?? "";
    if (!text.includes("{")) throw new Error("No JSON in response");
    const r = JSON.parse(
      text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1),
    );

    // Validate everything the model returned
    const genres = (Array.isArray(r.genres) ? r.genres : [])
      .filter((g) => GENRES.includes(g))
      .slice(0, 2);

    if (!["all_ages", "teen", "adult", "explicit"].includes(r.maturity))
      throw new Error("bad maturity");
    const moods = {};
    for (const m of MOODS) {
      const s = Number(r.moods?.[m]);
      moods[m] = s >= 0 && s <= 1 ? s : 0;
    }
    return {
      genres,
      maturity: r.maturity,
      moods,
      blurb: typeof r.blurb === "string" ? r.blurb : null,
      laterInSeries: r.later_in_series === true,
    };
  }
  throw new Error("failed after retries");
}

let next = 0;
let done = 0;
async function worker() {
  while (next < todo.length) {
    const b = todo[next++];
    try {
      cache.books[b.isbn13] = await classify(b);
    } catch (err) {
      console.error(`Failed: ${b.title}: ${err.message}`);
    }
    done++;
    if (done % 20 === 0) {
      save();
      console.log(`${done}/${todo.length}`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
save();

// ---- 3) Summary ----
const results = Object.values(cache.books);
const byGenre = {};
for (const r of results)
  byGenre[r.genres[0] ?? "(none)"] =
    (byGenre[r.genres[0] ?? "(none)"] ?? 0) + 1;
const byMaturity = {};
for (const r of results)
  byMaturity[r.maturity] = (byMaturity[r.maturity] ?? 0) + 1;
const u = cache.usage;
const cost = u.input * PRICE_IN + u.output * PRICE_OUT;
console.log("\nclassified:", results.length);
console.log("main genre:", byGenre);
console.log("maturity:", byMaturity);
console.log("later in series:", results.filter((r) => r.laterInSeries).length);
console.log(
  `tokens in ${u.input}, out ${u.output}, calls ${u.calls} -> about $${cost.toFixed(3)}` +
    (u.calls
      ? ` ($${((cost / u.calls) * 1000).toFixed(2)} per 1000 books)`
      : ""),
);
