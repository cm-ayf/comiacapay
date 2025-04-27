export function getISODateString(date: string | Date) {
  const [d] = new Date(date).toISOString().split("T");
  return d!;
}
