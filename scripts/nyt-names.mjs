// Prints every NYT bestseller list (from the overview endpoint)
const key = process.env.NYT_API_KEY;
if (!key) {
  console.error("Missing NYT_API_KEY");
  process.exit(1);
}

const res = await fetch(
  `https://api.nytimes.com/svc/books/v3/lists/overview.json?api-key=${key}`,
);
if (!res.ok) {
  console.error("NYT error:", res.status, await res.text());
  process.exit(1);
}

const { results } = await res.json();
console.log(`published ${results.published_date}, ${results.lists.length} lists\n`);
for (const l of results.lists) {
  console.log(`${l.list_name_encoded} | ${l.display_name} | ${l.updated}`);
}
