// Known mood keys, used to interpret free text
export const MOOD_KEYS = [
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

export const GENRE_KEYS = [
  "fiction",
  "mystery",
  "thriller",
  "romance",
  "fantasy",
  "scifi",
  "historical",
  "humor",
  "classics",
  "kids",
  "teen",
  "biography",
  "self-growth",
  "psychology",
  "philosophy",
  "science",
  "nature",
  "history",
  "poetry",
  "travel",
];

export const MODEL = "claude-haiku-5-5"; // check the current model name in the Anthropic docs

// Which maturity levels each genre may show
export function allowedMaturity(genre: string | null): string[] {
  if (genre === "kids") return ["all_ages"];
  if (genre === "teen") return ["all_ages", "teen"];
  return ["all_ages", "teen", "adult"];
}
