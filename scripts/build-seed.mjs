import { writeFileSync } from "node:fs";

const GOOGLE_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-haiku-5-5"; // check the current model name in the Anthropic docs
const PER_GENRE = 30;
const MAX_PER_AUTHOR = 3;
const PAGES = 3; // 40 results per page
const POPULAR_RATINGS = 50;

if (!GOOGLE_KEY || !ANTHROPIC_KEY) {
  console.error("Missing GOOGLE_BOOKS_API_KEY or ANTHROPIC_API_KEY");
  process.exit(1);
}

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

// genre key -> several Google Books queries (merged, then deduplicated)
const GENRES = {
  fiction: ["subject:fiction+literary", "subject:fiction+contemporary"],
  mystery: ["subject:mystery", "subject:detective", "subject:crime"],
  thriller: ["subject:thrillers", "subject:suspense"],
  romance: ["subject:romance", "subject:love+stories"],
  fantasy: ["subject:fantasy", "subject:magic"],
  scifi: ["subject:science+fiction", "subject:dystopian"],
  historical: ["subject:historical+fiction"],
  humor: ["subject:humor", "subject:comedy"],
  classics: ["subject:classics", "subject:literary+collections"],
  kids: ["subject:juvenile+fiction", "subject:picture+books"],
  teen: ['subject:"young adult fiction"', "subject:teen"],
  biography: ["subject:biography", "subject:memoir"],
  "self-growth": [
    'subject:"self-help"',
    "subject:motivational",
    "subject:habits",
  ],
  psychology: ["subject:psychology", "subject:mental+health"],
  philosophy: ["subject:philosophy"],
  science: ["subject:science", "subject:popular+science"],
  nature: ["subject:nature", "subject:animals"],
  history: ["subject:history", "subject:world+history"],
  poetry: ["subject:poetry"],
  travel: ["subject:travel", "subject:adventure"],
};

const TIMELESS = new Set(["classics", "poetry"]);
const YOUNG_GENRES = new Set(["kids", "teen"]);

const BLOCKED =
  /\b(erotic|erotica|bdsm|porn|pornographic|sexually explicit|xxx|fetish)\b/i;
const BLOCKED_YOUNG =
  /\b(murder|suicide|self-harm|rape|gore|drugs?|cocaine|heroin|torture|massacre|abuse|sex|sexual)\b/i;
// Edition noise in titles, removed before comparing titles
const EDITION_NOISE =
  /\((movie tie-in|illustrated|annotated|reprint|anniversary|deluxe)[^)]*\)|\b(movie tie-in|illustrated edition|illustrated|annotated|anniversary edition)\b/gi;
// Scholarly books that sneak into fiction searches (kept narrow on purpose)
const ACADEMIC =
  /\b(rethinking|essays on|companion to|studies in|narratives of|spaces of|politics of)\b/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/'/g, "''");
const normalize = (title, author) =>
  `${title
    .replace(EDITION_NOISE, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")}|${author.toLowerCase().replace(/[^a-z]/g, "")}`;

function priority(v, genre) {
  const ratings = v.ratingsCount ?? 0;
  const avg = v.averageRating ?? 0;
  const year = v.publishedDate ? parseInt(v.publishedDate.slice(0, 4)) : 0;

  let score = Math.min(5, Math.log10(ratings + 1) * 2);
  if (avg >= 4) score += 2;
  if ((v.description ?? "").length >= 300) score += 1;

  if (!TIMELESS.has(genre)) {
    if (year >= 2010) score += 3;
    else if (year >= 2000) score += 2;
    else if (year >= 1980) score += 1;
  }
  return score;
}

async function searchPage(query, startIndex) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=en&orderBy=relevance&printType=books&maxResults=40&startIndex=${startIndex}&key=${GOOGLE_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Books API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.items ?? [];
}

async function fetchGenre(genre, queries) {
  const byKey = new Map();

  for (const query of queries) {
    for (let page = 0; page < PAGES; page++) {
      let items;
      try {
        items = await searchPage(query, page * 40);
      } catch (err) {
        console.error(`  ${genre} ${query} page ${page}:`, err.message);
        break;
      }
      if (items.length === 0) break;

      for (const item of items) {
        const v = item.volumeInfo;
        const isbn = v.industryIdentifiers?.find(
          (i) => i.type === "ISBN_13",
        )?.identifier;

        if (!isbn || !v.title || !v.authors?.length) continue;
        if (!v.description || v.description.length < 200) continue;

        const text = `${v.title} ${v.description}`;
        if (BLOCKED.test(text)) continue;
        if (ACADEMIC.test(v.title)) continue;
        if (YOUNG_GENRES.has(genre) && BLOCKED_YOUNG.test(text)) continue;

        const popular = (v.ratingsCount ?? 0) >= POPULAR_RATINGS;
        if (
          v.maturityRating === "MATURE" &&
          (!popular || YOUNG_GENRES.has(genre))
        )
          continue;

        const key = normalize(v.title, v.authors[0]);
        const book = {
          isbn13: isbn,
          title: v.title.replace(EDITION_NOISE, "").trim(),
          author: v.authors[0],
          publisher: v.publisher ?? null,
          about: v.description.replace(/<[^>]*>/g, "").slice(0, 700),
          pages: v.pageCount ?? null,
          year: v.publishedDate ? parseInt(v.publishedDate.slice(0, 4)) : null,
          cover:
            v.imageLinks?.thumbnail?.replace("http://", "https://") ?? null,
          ratingsCount: v.ratingsCount ?? 0,
          avgRating: v.averageRating ?? null,
          score: priority(v, genre),
          genres: [genre],
        };

        // Keep the better-scored edition when the same book appears twice
        const existing = byKey.get(key);
        if (!existing || book.score > existing.score) byKey.set(key, book);
      }
      await sleep(250);
    }
  }

  const candidates = [...byKey.values()].sort((a, b) => b.score - a.score);
  const perAuthor = {};
  const picked = [];
  for (const b of candidates) {
    perAuthor[b.author] = (perAuthor[b.author] ?? 0) + 1;
    if (perAuthor[b.author] > MAX_PER_AUTHOR) continue;
    picked.push(b);
    if (picked.length >= PER_GENRE) break;
  }
  return picked;
}

async function scoreBook(book) {
  const prompt = `You help build a mood-based book recommendation catalog.

Book: ${book.title} by ${book.author}
Description: ${book.about}

Tasks:
1. Rate how well the book suits a reader in each mood, from 0 to 1.
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

2. Set "maturity" to one of:
- "all_ages": suitable for young children
- "teen": mild peril or romance, suitable for teenagers
- "adult": mature themes (war, loss, violence, sexuality in context) but not graphic
- "explicit": pornographic content, material that sexualizes minors, or hate propaganda
Books widely sold in mainstream bookstores, bestsellers, classics, and award winners are NOT "explicit", even with mature themes. Use "explicit" rarely.

3. Write "blurb": exactly 2 warm sentences describing the book. Use ONLY facts stated in the description above. Do not invent characters, plot points, or endings. No spoilers.

Reply with JSON only:
{"maturity": "adult", "moods": {"comfort": 0.8, ...all 12 moods}, "blurb": "..."}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
  const json = await res.json();
  // The first block may not be text (e.g. a thinking block), so look for the text block
  const text = json.content?.find((c) => c.type === "text")?.text ?? "";
  if (!text.includes("{")) {
    console.log("RAW:", JSON.stringify(json).slice(0, 400));
    throw new Error("No JSON in response");
  }
  return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
}

function allowed(genre, maturity) {
  if (maturity === "explicit") return false;
  if (genre === "kids") return maturity === "all_ages";
  if (genre === "teen") return maturity === "all_ages" || maturity === "teen";
  return ["all_ages", "teen", "adult"].includes(maturity);
}

// ---- 1) Collect ----
// A book found under several genres keeps all of them in its genres array
const byIsbn = new Map();
const seenTitles = new Map(); // normalized title|author -> isbn

for (const [genre, queries] of Object.entries(GENRES)) {
  const books = await fetchGenre(genre, queries);
  for (const b of books) {
    const key = normalize(b.title, b.author);
    const knownIsbn = seenTitles.get(key);
    if (knownIsbn) {
      const existing = byIsbn.get(knownIsbn);
      if (!existing.genres.includes(genre)) existing.genres.push(genre);
      continue;
    }
    seenTitles.set(key, b.isbn13);
    byIsbn.set(b.isbn13, b);
  }
  console.log(`${genre}: ${books.length} books`);
}

const all = [...byIsbn.values()];
console.log(`Scoring ${all.length} books...`);

// ---- 2) Score with Claude ----
const finalBooks = [];
for (const [i, b] of all.entries()) {
  try {
    const result = await scoreBook(b);
    const strictGenre = b.genres.find((g) => YOUNG_GENRES.has(g));
    // A book in kids or teen must pass that genre's maturity rule
    const ok = b.genres.every((g) => allowed(g, result.maturity));
    if (!ok) {
      // Drop only the young genre tag if the book is fine for general readers
      const generalGenres = b.genres.filter((g) => !YOUNG_GENRES.has(g));
      if (
        strictGenre &&
        generalGenres.length > 0 &&
        allowed(generalGenres[0], result.maturity)
      ) {
        b.genres = generalGenres;
      } else {
        console.log(
          `Excluded (${result.maturity}, ${b.genres.join("/")}): ${b.title}`,
        );
        continue;
      }
    }
    b.moods = result.moods ?? {};
    b.maturity = result.maturity;
    b.blurb = typeof result.blurb === "string" ? result.blurb : null;
    finalBooks.push(b);
  } catch (err) {
    console.error(`Scoring failed for ${b.title}:`, err.message);
  }
  if (i % 20 === 0) console.log(`${i}/${all.length}`);
  await sleep(150);
}

// ---- 3) Build SQL (upsert, safe to re-run on a live database) ----
const arr = (a) => `ARRAY[${a.map((g) => `'${g}'`).join(",")}]`;

let sql = "-- Generated by scripts/build-seed.mjs\n\n";
sql +=
  "insert into books (isbn13, title, author, publisher, cover_url, genres, about, blurb, published_year, pages, language, maturity, ratings_count, avg_rating) values\n";
sql += finalBooks
  .map(
    (b) =>
      `('${b.isbn13}', '${esc(b.title)}', '${esc(b.author)}', ${b.publisher ? `'${esc(b.publisher)}'` : "null"}, ${b.cover ? `'${esc(b.cover)}'` : "null"}, ${arr(b.genres)}, '${esc(b.about)}', ${b.blurb ? `'${esc(b.blurb)}'` : "null"}, ${b.year ?? "null"}, ${b.pages ?? "null"}, 'English', '${b.maturity}', ${b.ratingsCount}, ${b.avgRating ?? "null"})`,
  )
  .join(",\n");
sql += `
on conflict (isbn13) do update set
  title = excluded.title,
  author = excluded.author,
  publisher = excluded.publisher,
  cover_url = excluded.cover_url,
  genres = excluded.genres,
  about = excluded.about,
  blurb = excluded.blurb,
  published_year = excluded.published_year,
  pages = excluded.pages,
  maturity = excluded.maturity,
  ratings_count = excluded.ratings_count,
  avg_rating = excluded.avg_rating;\n\n`;

const moodRows = [];
for (const b of finalBooks) {
  for (const mood of MOODS) {
    const s = Number(b.moods[mood]);
    if (!(s >= 0.3 && s <= 1)) continue;
    moodRows.push(`('${b.isbn13}', '${mood}', ${s.toFixed(2)})`);
  }
}
sql += "insert into book_moods (isbn13, mood_key, score) values\n";
sql += moodRows.join(",\n");
sql +=
  "\non conflict (isbn13, mood_key) do update set score = excluded.score;\n";

writeFileSync("supabase/seed.generated.sql", sql);
console.log(
  `Done: ${finalBooks.length} books, ${moodRows.length} mood rows -> supabase/seed.generated.sql`,
);
