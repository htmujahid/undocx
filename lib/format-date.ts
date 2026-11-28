export function relativeDay(date: Date) {
  const value = new Date(date);
  const days = Math.floor((Date.now() - value.getTime()) / 86_400_000);
  if (days < 1 && new Date().getDate() === value.getDate()) return `Today, ${value.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  if (days < 2) return "Yesterday";
  return value.toLocaleDateString([], { day: "numeric", month: "long" });
}
