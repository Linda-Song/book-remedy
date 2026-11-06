// Step 5: choose the final books and check the "core" genre x mood cells.
// Reads nyt-enriched.json + nyt-classified.json, writes scripts/nyt-selected.json.
import { readFileSync, writeFileSync } from "node:fs";

const enriched = JSON.parse(readFileSync("scripts/nyt-enriched.json", "utf8"));
const classified = JSON.parse(readFileSync("scripts/nyt-classified.json", "utf8")).books;

// 11 genres (travel books are merged into biography). Max books per main genre.
const CAPS = {
  fiction: 190, mystery: 150, thriller: 150, romance: 170, fantasy: 200, humor: 80,
  biography: 220, "self-growth": 150, mind: 100, science: 120, childlike: 80,
};
// Moods each genre should cover well ("core" cells need enough books)
const CORE = {
  mystery: ["thrill", "excited", "escape", "think"],
  thriller: ["thrill", "excited", "escape"],
  romance: ["romance", "comfort", "escape", "courage"],
  fantasy: ["escape", "excited", "courage", "comfort"],
  humor: ["laugh", "comfort", "excited"],
  fiction: ["comfort", "think", "escape", "calm"],
  biography: ["courage", "boost", "learn", "think"],
  "self-growth": ["boost", "courage", "learn", "calm"],
  mind: ["think", "learn", "calm", "boost"],
  science: ["learn", "think", "calm"],
  childlike: ["comfort", "calm", "nostalgia", "laugh", "courage", "escape"],
};
const CORE_MIN = 10; // books a core cell should have
const MAX_PER_AUTHOR = 3;
const MIN_YEAR = 2000;
// Titles that say they are a later book: "The 20th Victim", "Book 3", "#5", "Volume 2"
const SERIES_TITLE = /^(the\s+)?([2-9]|[1-9]\d+)(st|nd|rd|th)\b|\b(book|vol\.?|volume|part)\s*([2-9]|[1-9]\d+)\b|#\s*([2-9]|[1-9]\d+)\b/i;
const YOUNG_LIST = /young-adult|middle-grade|childrens|picture|series/;

// ---- 1) Apply the rules ----
const drop = { series: 0, explicit: 0, noGenre: 0, youngOnly: 0, tooOld: 0 };
const eligible = [];
for (const [isbn, r] of Object.entries(classified)) {
  const b = enriched[isbn];
  if (!b) continue;
  if (r.laterInSeries || SERIES_TITLE.test(b.title ?? "")) { drop.series++; continue; }
  if (r.maturity === "explicit") { drop.explicit++; continue; }

  let genres = [
    ...new Set(r.genres.map((g) => (g === "travel" ? "biography" : g))),
  ].filter((g) => g in CAPS);
  if (genres.length === 0) { drop.noGenre++; continue; }

  // Rule: books only on children/teen lists must be "childlike" and all_ages, otherwise out
  const youngOnly = b.lists.every((l) => YOUNG_LIST.test(l));
  if (youngOnly) {
    if (!genres.includes("childlike") || r.maturity !== "all_ages") { drop.youngOnly++; continue; }
    genres = ["childlike"];
  } else if (r.maturity !== "all_ages") {
    // Rule: childlike needs all_ages everywhere
    genres = genres.filter((g) => g !== "childlike");
    if (genres.length === 0) { drop.noGenre++; continue; }
  }

  // Rule: no old books
  const year = b.year ?? 0;
  if (year > 0 && year < MIN_YEAR) { drop.tooOld++; continue; }

  const recency = year >= 2020 ? 3 : year >= 2015 ? 2 : year >= 2010 ? 1 : 0;
  const rating = (b.avgRating ?? 0) >= 4 ? 0.5 : 0;
  eligible.push({
    isbn13: isbn,
    title: b.title,
    author: b.author,
    publisher: b.publisher ?? null,
    cover: b.cover ?? null,
    about: r.about ?? [b.description ?? "", b.gDescription ?? ""].sort((x, y) => y.length - x.length)[0].replace(/<[^>]*>/g, "").slice(0, 700),
    pages: b.pages ?? null,
    year: b.year ?? null,
    ratingsCount: b.ratingsCount ?? 0,
    avgRating: b.avgRating ?? null,
    genres,
    maturity: r.maturity,
    moods: r.moods,
    blurb: r.blurb,
    rank: b.nytScore + recency + rating,
  });
}

// ---- 2) Pick per main genre with caps and an author limit ----
eligible.sort((a, b) => b.rank - a.rank);
const perGenre = {};
const perAuthor = {};
const selected = [];
for (const b of eligible) {
  const main = b.genres[0];
  if ((perGenre[main] ?? 0) >= CAPS[main]) continue;
  if ((perAuthor[b.author] ?? 0) >= MAX_PER_AUTHOR) continue;
  perGenre[main] = (perGenre[main] ?? 0) + 1;
  perAuthor[b.author] = (perAuthor[b.author] ?? 0) + 1;
  selected.push(b);
}
writeFileSync("scripts/nyt-selected.json", JSON.stringify(selected));
console.log("dropped:", drop);
console.log(`eligible ${eligible.length} -> selected ${selected.length}\n`);

// ---- 3) Core cells: books per genre and mood (mood score >= 0.5) ----
let weak = 0;
let total = 0;
for (const g of Object.keys(CAPS)) {
  const inGenre = selected.filter((b) => b.genres.includes(g));
  const cells = CORE[g].map((m) => {
    const n = inGenre.filter((b) => (b.moods[m] ?? 0) >= 0.5).length;
    total++;
    if (n < CORE_MIN) weak++;
    return `${m} ${n}${n < CORE_MIN ? "!" : ""}`;
  });
  console.log(`${g.padEnd(12)} ${String(inGenre.length).padStart(4)} | ${cells.join(", ")}`);
}
console.log(`\ncore cells with fewer than ${CORE_MIN} books ("!"): ${weak} of ${total}`);
