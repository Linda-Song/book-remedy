// Summarizes scripts/nyt-books.json (no API calls)
import { readFileSync } from "node:fs";

const { books } = JSON.parse(readFileSync("scripts/nyt-books.json", "utf8"));
const all = Object.values(books);
console.log("total:", all.length);

// books per NYT list
const perList = {};
for (const b of all) for (const l of b.lists) perList[l] = (perList[l] ?? 0) + 1;
console.log("\nper list:");
for (const [l, n] of Object.entries(perList).sort((a, b) => b[1] - a[1]))
  console.log(`  ${String(n).padStart(5)}  ${l}`);

// description length
const noDesc = all.filter((b) => b.description.length < 40).length;
console.log("\nshort/no description (<40 chars):", noDesc);

// how long they stayed on lists
const buckets = { "1": 0, "2-4": 0, "5-9": 0, "10+": 0 };
for (const b of all) {
  const w = b.maxWeeks;
  if (w <= 1) buckets["1"]++;
  else if (w <= 4) buckets["2-4"]++;
  else if (w <= 9) buckets["5-9"]++;
  else buckets["10+"]++;
}
console.log("\nweeks on list:", buckets);

// likely sequels (description hints)
const seq = all.filter((b) =>
  /\b(sequel|book (two|2|three|3|four|4|five|5)|the (second|third|fourth) (book|novel)|return to)\b/i.test(
    b.description,
  ),
);
console.log("\nlikely sequels by description:", seq.length);

console.log("\ntop 15 by weeks on list:");
for (const b of all.sort((a, b) => b.maxWeeks - a.maxWeeks).slice(0, 15))
  console.log(`  ${b.maxWeeks}w  ${b.title} - ${b.author}`);
