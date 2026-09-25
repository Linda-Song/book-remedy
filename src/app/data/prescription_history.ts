export const PRESCRIPTION_DAYS = [3, 7, 8, 12, 15, 19, 20, 21, 25];

export const PRESCRIPTION_HISTORY: Record<
  number,
  { title: string; author: string }[]
> = {
  3: [{ title: "The Quiet Orchard", author: "Elena Marsh" }],
  7: [{ title: "Every Window Lit", author: "Owen Hart" }],
  8: [{ title: "The Lantern Keeper", author: "Ines Calder" }],
  12: [{ title: "Salt & Marigold", author: "Priya Nair" }],
  15: [{ title: "A Year of Small Mercies", author: "Tomas Reed" }],
  19: [{ title: "The Last Lighthouse Post", author: "Mara Quinn" }],
  20: [{ title: "The Midnight Library", author: "Matt Haig" }],
  21: [
    { title: "The Midnight Library", author: "Matt Haig" },
    { title: "A Year of Small Mercies", author: "Tomas Reed" },
  ],
};
