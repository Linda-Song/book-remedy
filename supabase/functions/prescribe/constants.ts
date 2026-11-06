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
  "mystery",
  "thriller",
  "romance",
  "fantasy",
  "fiction",
  "humor",
  "biography",
  "self-growth",
  "mind",
  "science",
  "childlike",
];

export const MODEL = "claude-haiku-5-5"; // check the current model name in the Anthropic docs

// Which maturity levels each genre may show
export function allowedMaturity(genre: string | null): string[] {
  if (genre === "childlike") return ["all_ages"];
  return ["all_ages", "teen", "adult"];
}
// Clear statements about suicide or self-harm
const CRISIS_PATTERNS = [
  /\b(suicid\w*|kill myself|end (my life|it all)|want to die|wanna die|take my own life|better off dead|no reason to live|self[- ]?harm\w*|hurt myself|cut myself)\b/i,
  /\b(don'?t want to (live|be alive|exist))\b/i,
];

export function isCrisisText(text: string): boolean {
  return CRISIS_PATTERNS.some((p) => p.test(text));
}

// Fixed line appended when the reader sounds heavy (never written by the AI)
export const SUPPORT_NOTE =
  "If things feel heavy, talking to someone you trust or a health professional can help.";
