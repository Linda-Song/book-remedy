// src/app/data/prescription_history.ts
export type PrescriptionRecord = {
  title: string;
  author: string;
  mood: string;
  genre: string;
  status: "To read" | "Reading" | "Finished";
};

export const PRESCRIPTION_DAYS = [3, 7, 8, 12, 15, 19, 20, 21];

export const PRESCRIPTION_HISTORY: Record<number, PrescriptionRecord[]> = {
  3: [
    {
      title: "The Quiet Orchard",
      author: "Elena Marsh",
      mood: "Want to laugh",
      genre: "Fiction",
      status: "Finished",
    },
  ],
  7: [
    {
      title: "Every Window Lit",
      author: "Owen Hart",
      mood: "Deep thoughts",
      genre: "Fiction",
      status: "Finished",
    },
  ],
  8: [
    {
      title: "The Lantern Keeper",
      author: "Ines Calder",
      mood: "Feel excited",
      genre: "Fantasy",
      status: "Reading",
    },
  ],
  12: [
    {
      title: "Salt & Marigold",
      author: "Priya Nair",
      mood: "Want calm",
      genre: "Fiction",
      status: "To read",
    },
  ],
  15: [
    {
      title: "A Year of Small Mercies",
      author: "Tomas Reed",
      mood: "Need comfort",
      genre: "Memoir",
      status: "Finished",
    },
  ],
  19: [
    {
      title: "The Last Lighthouse Post",
      author: "Mara Quinn",
      mood: "Need to escape",
      genre: "Mystery",
      status: "To read",
    },
  ],
  20: [
    {
      title: "The Midnight Library",
      author: "Matt Haig",
      mood: "Need comfort",
      genre: "Fiction",
      status: "To read",
    },
  ],
  21: [
    {
      title: "The Midnight Library",
      author: "Matt Haig",
      mood: "Need comfort",
      genre: "Fiction",
      status: "To read",
    },
    {
      title: "A Year of Small Mercies",
      author: "Tomas Reed",
      mood: "Need comfort",
      genre: "Memoir",
      status: "To read",
    },
  ],
};
