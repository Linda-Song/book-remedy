// Step 1: pick the best NYT candidates, then add Google Books info (no AI cost).
// Writes scripts/nyt-enriched.json. Safe to stop and re-run.
// Test first:  LIMIT=20 node --env-file=.env scripts/nyt-enrich.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const GOOGLE_KEY = process.env.GOOGLE_BOOKS_API_KEY;
if (!GOOGLE_KEY) {
  console.error("Missing GOOGLE_BOOKS_API_KEY");
  process.exit(1);
}

const POOL = 4000; // how many candidates to keep
const LIMIT = Number(process.env.LIMIT ?? 0); // 0 = no limit (use a small number to test)
const OUT = "scripts/nyt-enriched.json";
// Lists we do not use: series entries and picture books
const EXCLUDE_LISTS = new Set(["series-books", "picture-books"]);

const SEQUEL =
  /\b(sequel to|book (two|2|three|3|four|4|five|5|six|6)\b|the (second|third|fourth|fifth) (book|novel|installment)|next (book|installment) in)\b|^\s*return to\b/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const normalize = (title, author) =>
  `${title.toLowerCase().replace(/[^a-z0-9]/g, "")}|${author.toLowerCase().replace(/[^a-z]/g, "")}`;

// "DIARY OF A WIMPY KID" -> "Diary of a Wimpy Kid"
const SMALL = new Set(["a", "an", "the", "of", "and", "in", "on", "to", "for", "at", "by", "or"]);
function fixTitle(t) {
  if (t !== t.toUpperCase()) return t;
  return t
    .toLowerCase()
    .split(" ")
    .map((w, i) => (i > 0 && SMALL.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

// ---- 1) Choose candidates from the NYT data ----
const nyt = Object.values(JSON.parse(readFileSync("scripts/nyt-books.json", "utf8")).books);

const merged = new Map(); // normalized title|author -> best entry
let droppedLists = 0;
let droppedSequels = 0;
for (const b of nyt) {
  const lists = b.lists.filter((l) => !EXCLUDE_LISTS.has(l));
  if (lists.length === 0) {
    droppedLists++;
    continue;
  }
  if (b.description && SEQUEL.test(b.description)) {
    droppedSequels++;
    continue;
  }
  const score =
    Math.log2(b.maxWeeks + 1) * 2 +
    Math.min(b.appearances, 10) * 0.4 +
    (b.bestRank <= 3 ? 1.5 : b.bestRank <= 7 ? 0.7 : 0);
  const title = fixTitle(b.title);
  const key = normalize(title, b.author);
  const entry = { ...b, title, lists, nytScore: score };
  const prev = merged.get(key);
  if (!prev) merged.set(key, entry);
  else {
    // Same book in another edition: combine the lists, keep the better one
    const keep = prev.nytScore >= entry.nytScore ? prev : entry;
    keep.lists = [...new Set([...prev.lists, ...entry.lists])];
    keep.nytScore = Math.max(prev.nytScore, entry.nytScore);
    merged.set(key, keep);
  }
}
let pool = [...merged.values()].sort((a, b) => b.nytScore - a.nytScore).slice(0, POOL);
console.log(
  `NYT ${nyt.length} -> dropped by list ${droppedLists}, sequels ${droppedSequels}, merged ${merged.size}, pool ${pool.length}`,
);
if (LIMIT) pool = pool.slice(0, LIMIT);

// ---- 2) Add Google Books info (cached per isbn) ----
const cache = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const save = () => writeFileSync(OUT, JSON.stringify(cache));

async function lookup(isbn) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${GOOGLE_KEY}`;
  const res = await fetch(url);
  if (res.status === 429 || res.status === 403) return "quota";
  if (!res.ok) throw new Error(`Books API ${res.status}`);
  const v = (await res.json()).items?.[0]?.volumeInfo;
  if (!v) return null;
  return {
    gDescription: (v.description ?? "").replace(/<[^>]*>/g, ""),
    pages: v.pageCount ?? null,
    year: v.publishedDate ? parseInt(v.publishedDate.slice(0, 4)) : null,
    cover: v.imageLinks?.thumbnail?.replace("http://", "https://") ?? null,
    ratingsCount: v.ratingsCount ?? 0,
    avgRating: v.averageRating ?? null,
    maturityRating: v.maturityRating ?? null,
    categories: v.categories ?? [],
  };
}

let done = 0;
for (const [i, b] of pool.entries()) {
  if (cache[b.isbn13]?.checked) continue;
  let info;
  try {
    info = await lookup(b.isbn13);
  } catch (err) {
    console.error(`${b.title}: ${err.message}`);
    continue;
  }
  if (info === "quota") {
    console.log("Google quota reached. Progress saved. Run again later (or tomorrow).");
    save();
    process.exit(0);
  }
  cache[b.isbn13] = { ...b, ...(info ?? {}), checked: true, found: !!info };
  done++;
  if (done % 25 === 0) {
    save();
    console.log(`${i + 1}/${pool.length}`);
  }
  await sleep(200);
}
save();

// ---- 3) Summary ----
const rows = pool.map((b) => cache[b.isbn13]).filter(Boolean);
const found = rows.filter((r) => r.found).length;
const withDesc = rows.filter(
  (r) => Math.max((r.description ?? "").length, (r.gDescription ?? "").length) >= 150,
).length;
const withCover = rows.filter((r) => r.cover).length;
const recent = rows.filter((r) => (r.year ?? 0) >= 2015).length;
console.log(
  `\nDone. checked ${rows.length}, found on Google ${found}, usable description ${withDesc}, cover ${withCover}, published 2015+ ${recent}`,
);
