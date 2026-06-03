export function formatDateShort(date: Date) {
  return date.toISOString().slice(0, 10);
}
