export function relativeDay(date: Date) {
  const value = new Date(date);
  const days = Math.floor((Date.now() - value.getTime()) / 86_400_000);
  if (days < 1 && new Date().getDate() === value.getDate()) return `Today, ${value.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  if (days < 2) return "Yesterday";
  return value.toLocaleDateString([], { day: "numeric", month: "long" });
}

export function groupByDay<T>(items: T[], dateOf: (item: T) => Date) {
  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const today = startOfDay(new Date());
  const day = 86_400_000;
  const groups = [
    { label: "Today", items: [] as T[] },
    { label: "Yesterday", items: [] as T[] },
    { label: "Previous 7 days", items: [] as T[] },
    { label: "Older", items: [] as T[] },
  ];
  for (const item of items) {
    const age = today - startOfDay(new Date(dateOf(item)));
    groups[age < day ? 0 : age < 2 * day ? 1 : age < 7 * day ? 2 : 3].items.push(item);
  }
  return groups.filter((group) => group.items.length > 0);
}
