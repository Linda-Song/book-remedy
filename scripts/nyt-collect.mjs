// Collects NYT bestseller books (many weeks) into scripts/nyt-books.json.
// Safe to stop and re-run: finished dates are skipped.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const KEY = process.env.NYT_API_KEY;
if (!KEY) {
  console.error("Missing NYT_API_KEY");
  process.exit(1);
}

const OUT = "scripts/nyt-books.json";
const YEARS = 6; // how far back
const WEEK_STEP = 2; // every 2nd week (books stay on lists for weeks)
const DELAY_MS = 13000; // stay under the rate limit
const SKIP = new Set([
  "audio-advice-how-to-and-miscellaneous",
  "audio-childrens",
  "audio-fiction",
  "audio-nonfiction",
  "graphic-books-and-manga",
]);

const state = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, "utf8"))
  : { doneDates: [], books: {} };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const save = () => writeFileSync(OUT, JSON.stringify(state));

async function fetchOverview(date) {
  const url =
    `https://api.nytimes.com/svc/books/v3/lists/overview.json?api-key=${KEY}` +
    (date ? `&published_date=${date}` : "");
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      console.log("  rate limited, waiting 60s...");
      await sleep(60000);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return (await res.json()).results;
  }
  throw new Error("rate limited twice");
}

function addLists(results) {
  for (const list of results.lists) {
    if (SKIP.has(list.list_name_encoded)) continue;
    for (const b of list.books) {
      const isbn = b.primary_isbn13;
      if (!isbn || !b.title || !b.author) continue;
      const cur = state.books[isbn] ?? {
        isbn13: isbn,
        title: b.title,
        author: b.author,
        description: b.description ?? "",
        publisher: b.publisher ?? null,
        image: b.book_image ?? null,
        lists: [],
        bestRank: 99,
        maxWeeks: 0,
        appearances: 0,
      };
      if (!cur.lists.includes(list.list_name_encoded))
        cur.lists.push(list.list_name_encoded);
      cur.bestRank = Math.min(cur.bestRank, b.rank ?? 99);
      cur.maxWeeks = Math.max(cur.maxWeeks, b.weeks_on_list ?? 0);
      cur.appearances += 1;
      if (!cur.description && b.description) cur.description = b.description;
      state.books[isbn] = cur;
    }
  }
}

// First call (no date) tells us the latest published date
const first = await fetchOverview(null);
const start = new Date(first.published_date + "T00:00:00Z");
console.log("latest list:", first.published_date);
if (!state.doneDates.includes(first.published_date)) {
  addLists(first);
  state.doneDates.push(first.published_date);
  save();
}

const totalSteps = Math.floor((YEARS * 52) / WEEK_STEP);
for (let i = 1; i <= totalSteps; i++) {
  const d = new Date(start.getTime() - i * WEEK_STEP * 7 * 86400000);
  const date = d.toISOString().slice(0, 10);
  if (state.doneDates.includes(date)) continue;

  await sleep(DELAY_MS);
  try {
    const results = await fetchOverview(date);
    addLists(results);
    state.doneDates.push(date);
    save();
    console.log(
      `${i}/${totalSteps} ${date} -> ${Object.keys(state.books).length} books`,
    );
  } catch (err) {
    console.error(`${date} failed:`, err.message);
    if (String(err.message).startsWith("401")) process.exit(1);
  }
}

console.log("Done:", Object.keys(state.books).length, "books");
