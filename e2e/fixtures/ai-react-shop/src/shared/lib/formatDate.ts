const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

// Shows an ISO date as plain words, for example Oct 12, 2026.
export function formatDate(isoDate: string): string {
  return dateFormat.format(new Date(isoDate));
}
