// Converts a timestamp into a short relative string, e.g. "3d ago", "just now".
// Falls back to a plain date once something is older than 30 days, since
// "47 days ago" is less useful to read than an actual date at that point.
export function timeAgo(dateInput) {
  const date = new Date(dateInput);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}
