// "2026-10-02" -> "Oct 2, 2026" (US) or "2 Oct 2026" (AU), by the reader's locale
export function formatDate(value: string) {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  // Build the date in local time; new Date("2026-10-02") would be read as UTC
  // and can show the day before.
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
