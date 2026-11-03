// Genres shown on the genre page, in display order.
// `key` is stored in the database; `label` is what the reader sees.
export const GENRES = [
  { key: "mystery", label: "Mystery" },
  { key: "thriller", label: "Thriller" },
  { key: "romance", label: "Romance" },
  { key: "fantasy", label: "Fantasy" },
  { key: "fiction", label: "Fiction" },
  { key: "humor", label: "Humor" },
  { key: "biography", label: "Biography" },
  { key: "self-growth", label: "Self-Help" },
  { key: "mind", label: "Mind" },
  { key: "science", label: "Science" },
  { key: "childlike", label: "Childlike" },
];

// Turns a stored genre key into the label shown to readers.
// Unknown (older) keys are shown as they are.
export function genreLabel(key: string | null | undefined): string {
  if (!key) return "";
  return GENRES.find((g) => g.key === key)?.label ?? key;
}
