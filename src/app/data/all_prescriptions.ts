export type PrescriptionRecord = {
  id: number;
  title: string;
  author: string;
  publisher: string;
  mood: string;
  genre: string;
  status: "To read" | "Reading" | "Finished" | "Not for me";
  date: string;
  coverColor: string;
  about: string;
  reason: string;
  freeText: string;
  startedDate?: string;
  finishedDate?: string;
  review?: {
    rating: number;
    shareLine: string;
    quotePage?: number;
    quoteText?: string;
    text: string;
    isPublic: boolean;
  };
};

export const ALL_PRESCRIPTIONS: PrescriptionRecord[] = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    publisher: "Canongate · 2020 · 304 pages · English",
    mood: "Need comfort",
    genre: "Fiction",
    status: "To read",
    date: "Sep 21",
    coverColor: "#16332E",
    about:
      "Nora Seed finds herself in a library between life and death, where every book is a different version of her life. She gets to try them one by one and see what she really wants.",
    reason:
      'You said your mind won\'t switch off after a long day. This is a gentle, page-turning story about regrets and second chances, and it lets you wonder "what if" from a safe distance. It ends kindly.',
    freeText: "Can't stop thinking about everything, need something gentle.",
  },
  {
    id: 2,
    title: "Salt & Marigold",
    author: "Priya Nair",
    publisher: "Harrow House · 2021 · 288 pages · English",
    mood: "Want calm",
    genre: "Fiction",
    status: "To read",
    date: "Sep 19",
    coverColor: "#8FCBB8",
    about:
      "Two sisters reopen their late grandmother's spice shop in a rainy coastal town and slowly rediscover each other, one recipe at a time.",
    reason:
      "You wanted something slow for a rainy evening. This is a quiet, warm story where not much happens fast, and every chapter ends with a small comfort.",
    freeText: "Rainy evening, want something slow.",
  },
  {
    id: 3,
    title: "The Lantern Keeper",
    author: "Ines Calder",
    publisher: "Driftwood Press · 2019 · 336 pages · English",
    mood: "Feel excited",
    genre: "Fantasy",
    status: "Reading",
    date: "Sep 19",
    coverColor: "#F6E39A",
    about:
      "A young lighthouse keeper discovers her lantern can open doors to other worlds, and must choose which one to call home.",
    reason:
      "You wanted something fast and fun. This story moves quickly, with a new surprise waiting behind every chapter.",
    freeText: "Need something to keep me up late in a good way.",
    startedDate: "Sep 19, 2026",
  },
  {
    id: 4,
    title: "A Year of Small Mercies",
    author: "Tomas Reed",
    publisher: "Willow & Finch · 2018 · 256 pages · English",
    mood: "Need comfort",
    genre: "Memoir",
    status: "Finished",
    date: "Sep 15",
    coverColor: "#F2B0A4",
    about:
      "A gentle memoir following one ordinary year, where the author learns to notice the small kindnesses that carried him through.",
    reason:
      "You said you needed comfort, not answers. This book doesn't try to fix anything — it just sits beside you.",
    freeText: "Hard month. Not looking for advice, just company.",
    startedDate: "Sep 13, 2026",
    finishedDate: "Sep 15, 2026",
    review: {
      rating: 4,
      shareLine: "Exactly the quiet company I needed this month.",
      quotePage: 88,
      quoteText: "Some days the only job is to notice one small kindness.",
      text: "Didn't expect to tear up so much over such an ordinary year. It never rushes to comfort you, it just sits there with you, which is what I needed.",
      isPublic: true,
    },
  },
  {
    id: 5,
    title: "The Quiet Orchard",
    author: "Elena Marsh",
    publisher: "Canongate · 2022 · 312 pages · English",
    mood: "Want to laugh",
    genre: "Fiction",
    status: "Finished",
    date: "Sep 12",
    coverColor: "#C3E978",
    about:
      "A clumsy city girl inherits a failing orchard and a town full of opinionated neighbors who won't leave her alone.",
    reason:
      "You wanted to laugh. This book is full of warm, silly moments and characters who mean well even when they meddle.",
    freeText: "Just want something light and funny.",
    startedDate: "Sep 12, 2026",
    finishedDate: "Sep 15, 2026",
    review: {
      rating: 5,
      shareLine: "I read it in two evenings and didn't want it to end.",
      quotePage: 142,
      quoteText: "Some day you'll understand why rain feels like company.",
      text: "Slow, warm and full of small kindnesses. The orchard scenes stayed with me for days, and the ending felt just right.",
      isPublic: false,
    },
  },
  {
    id: 6,
    title: "Every Window Lit",
    author: "Owen Hart",
    publisher: "Harrow House · 2020 · 224 pages · English",
    mood: "Deep thoughts",
    genre: "Fiction",
    status: "Not for me",
    date: "Sep 8",
    coverColor: "#16332E",
    about:
      "A quiet novel following one night in an apartment building, moving window to window through the lives of strangers.",
    reason:
      "You wanted something to think about. This book lingers on small moments and asks what connects strangers living side by side.",
    freeText: "In a reflective mood tonight.",
    startedDate: "Sep 8, 2026",
  },
  {
    id: 7,
    title: "The Midnight Library",
    author: "Matt Haig",
    publisher: "Canongate · 2020 · 304 pages · English",
    mood: "Need comfort",
    genre: "Fiction",
    status: "To read",
    date: "Sep 21",
    coverColor: "#16332E",
    about:
      "Nora Seed finds herself in a library between life and death, where every book is a different version of her life. She gets to try them one by one and see what she really wants.",
    reason:
      'You said your mind won\'t switch off after a long day. This is a gentle, page-turning story about regrets and second chances, and it lets you wonder "what if" from a safe distance. It ends kindly.',
    freeText: "Can't stop thinking about everything, need something gentle.",
  },
  {
    id: 8,
    title: "Salt & Marigold",
    author: "Priya Nair",
    publisher: "Harrow House · 2021 · 288 pages · English",
    mood: "Want calm",
    genre: "Fiction",
    status: "To read",
    date: "Sep 19",
    coverColor: "#d7153a",
    about:
      "Two sisters reopen their late grandmother's spice shop in a rainy coastal town and slowly rediscover each other, one recipe at a time.",
    reason:
      "You wanted something slow for a rainy evening. This is a quiet, warm story where not much happens fast, and every chapter ends with a small comfort.",
    freeText: "Rainy evening, want something slow.",
  },
  {
    id: 9,
    title: "The Lantern Keeper",
    author: "Ines Calder",
    publisher: "Driftwood Press · 2019 · 336 pages · English",
    mood: "Feel excited",
    genre: "Fantasy",
    status: "Reading",
    date: "Sep 19",
    coverColor: "#F6E39A",
    about:
      "A young lighthouse keeper discovers her lantern can open doors to other worlds, and must choose which one to call home.",
    reason:
      "You wanted something fast and fun. This story moves quickly, with a new surprise waiting behind every chapter.",
    freeText: "Need something to keep me up late in a good way.",
    startedDate: "Sep 19, 2026",
  },
  {
    id: 10,
    title: "A Year of Small Mercies",
    author: "Tomas Reed",
    publisher: "Willow & Finch · 2018 · 256 pages · English",
    mood: "Need comfort",
    genre: "Memoir",
    status: "Finished",
    date: "Sep 15",
    coverColor: "#00aa45",
    about:
      "A gentle memoir following one ordinary year, where the author learns to notice the small kindnesses that carried him through.",
    reason:
      "You said you needed comfort, not answers. This book doesn't try to fix anything — it just sits beside you.",
    freeText: "Hard month. Not looking for advice, just company.",
    startedDate: "Sep 12, 2026",
    finishedDate: "Sep 15, 2026",
    review: {
      rating: 4,
      shareLine: "A quiet book that stayed with me longer than I expected.",
      text: "Gentle and unhurried. Didn't solve anything for me, but it kept me company through a hard week.",
      isPublic: false,
    },
  },
  {
    id: 11,
    title: "The Quiet Orchard",
    author: "Elena Marsh",
    publisher: "Canongate · 2022 · 312 pages · English",
    mood: "Want to laugh",
    genre: "Fiction",
    status: "Finished",
    date: "Sep 12",
    coverColor: "#146cfd",
    about:
      "A clumsy city girl inherits a failing orchard and a town full of opinionated neighbors who won't leave her alone.",
    reason:
      "You wanted to laugh. This book is full of warm, silly moments and characters who mean well even when they meddle.",
    freeText: "Just want something light and funny.",
    startedDate: "Sep 9, 2026",
    finishedDate: "Sep 12, 2026",
    review: {
      rating: 5,
      shareLine: "Laughed out loud more than once, exactly what I needed.",
      quotePage: 61,
      quoteText: "The orchard did not need saving. It needed company.",
      text: "Warm, silly, and surprisingly moving by the end. The neighbors were a mess in the best way.",
      isPublic: true,
    },
  },
  {
    id: 12,
    title: "Every Window Lit",
    author: "Owen Hart",
    publisher: "Harrow House · 2020 · 224 pages · English",
    mood: "Deep thoughts",
    genre: "Fiction",
    status: "Not for me",
    date: "Sep 8",
    coverColor: "#d7153a",
    about:
      "A quiet novel following one night in an apartment building, moving window to window through the lives of strangers.",
    reason:
      "You wanted something to think about. This book lingers on small moments and asks what connects strangers living side by side.",
    freeText: "In a reflective mood tonight.",
    startedDate: "Sep 8, 2026",
  },
  {
    id: 13,
    title: "The Midnight Library",
    author: "Matt Haig",
    publisher: "Canongate · 2020 · 304 pages · English",
    mood: "Need comfort",
    genre: "Fiction",
    status: "To read",
    date: "Sep 21",
    coverColor: "#16332E",
    about:
      "Nora Seed finds herself in a library between life and death, where every book is a different version of her life. She gets to try them one by one and see what she really wants.",
    reason:
      'You said your mind won\'t switch off after a long day. This is a gentle, page-turning story about regrets and second chances, and it lets you wonder "what if" from a safe distance. It ends kindly.',
    freeText: "Can't stop thinking about everything, need something gentle.",
  },
  {
    id: 14,
    title: "Salt & Marigold",
    author: "Priya Nair",
    publisher: "Harrow House · 2021 · 288 pages · English",
    mood: "Want calm",
    genre: "Fiction",
    status: "To read",
    date: "Sep 19",
    coverColor: "#d7153a",
    about:
      "Two sisters reopen their late grandmother's spice shop in a rainy coastal town and slowly rediscover each other, one recipe at a time.",
    reason:
      "You wanted something slow for a rainy evening. This is a quiet, warm story where not much happens fast, and every chapter ends with a small comfort.",
    freeText: "Rainy evening, want something slow.",
  },
  {
    id: 15,
    title: "The Lantern Keeper",
    author: "Ines Calder",
    publisher: "Driftwood Press · 2019 · 336 pages · English",
    mood: "Feel excited",
    genre: "Fantasy",
    status: "Reading",
    date: "Sep 19",
    coverColor: "#F6E39A",
    about:
      "A young lighthouse keeper discovers her lantern can open doors to other worlds, and must choose which one to call home.",
    reason:
      "You wanted something fast and fun. This story moves quickly, with a new surprise waiting behind every chapter.",
    freeText: "Need something to keep me up late in a good way.",
    startedDate: "Sep 19, 2026",
  },
  {
    id: 16,
    title: "The Midnight Library",
    author: "Matt Haig",
    publisher: "Canongate · 2020 · 304 pages · English",
    mood: "Need comfort",
    genre: "Fiction",
    status: "To read",
    date: "Sep 21",
    coverColor: "#16332E",
    about:
      "Nora Seed finds herself in a library between life and death, where every book is a different version of her life. She gets to try them one by one and see what she really wants.",
    reason:
      'You said your mind won\'t switch off after a long day. This is a gentle, page-turning story about regrets and second chances, and it lets you wonder "what if" from a safe distance. It ends kindly.',
    freeText: "Can't stop thinking about everything, need something gentle.",
  },
  {
    id: 17,
    title: "Salt & Marigold",
    author: "Priya Nair",
    publisher: "Harrow House · 2021 · 288 pages · English",
    mood: "Want calm",
    genre: "Fiction",
    status: "To read",
    date: "Sep 19",
    coverColor: "#8FCBB8",
    about:
      "Two sisters reopen their late grandmother's spice shop in a rainy coastal town and slowly rediscover each other, one recipe at a time.",
    reason:
      "You wanted something slow for a rainy evening. This is a quiet, warm story where not much happens fast, and every chapter ends with a small comfort.",
    freeText: "Rainy evening, want something slow.",
  },
  {
    id: 18,
    title: "The Lantern Keeper",
    author: "Ines Calder",
    publisher: "Driftwood Press · 2019 · 336 pages · English",
    mood: "Feel excited",
    genre: "Fantasy",
    status: "Reading",
    date: "Sep 19",
    coverColor: "#F6E39A",
    about:
      "A young lighthouse keeper discovers her lantern can open doors to other worlds, and must choose which one to call home.",
    reason:
      "You wanted something fast and fun. This story moves quickly, with a new surprise waiting behind every chapter.",
    freeText: "Need something to keep me up late in a good way.",
    startedDate: "Sep 19, 2026",
  },
];
