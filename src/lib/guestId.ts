export function getGuestId(): string {
  if (typeof window === "undefined") return "";
  let guestId = localStorage.getItem("guest_id");
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guest_id", guestId);
  }
  return guestId;
}
