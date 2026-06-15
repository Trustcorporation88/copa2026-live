const BR_TZ = "America/Sao_Paulo";

export function brazilDateKey(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-CA", { timeZone: BR_TZ });
}

export function todayBrazilDateKey(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: BR_TZ });
}

export function isMatchTodayInBrazil(isoDate: string): boolean {
  return brazilDateKey(isoDate) === todayBrazilDateKey();
}

export function formatKickoffBrazil(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString("pt-BR", {
    timeZone: BR_TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTodaySectionLabel(): string {
  const label = new Date().toLocaleDateString("pt-BR", {
    timeZone: BR_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function sortByKickoffAsc<T extends { date: string }>(matches: T[]): T[] {
  return [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function sortOtherMatches<T extends { date: string; status: string }>(
  matches: T[]
): T[] {
  const statusOrder = { LIVE: 0, FINISHED: 1, PENDING: 2 } as const;
  return [...matches].sort((a, b) => {
    const sa = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
    const sb = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
    if (sa !== sb) return sa - sb;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export function splitTodayAndOther<T extends { date: string; status: string }>(
  matches: T[]
): { today: T[]; other: T[] } {
  const today: T[] = [];
  const other: T[] = [];
  for (const m of matches) {
    if (isMatchTodayInBrazil(m.date)) today.push(m);
    else other.push(m);
  }
  return { today: sortByKickoffAsc(today), other: sortOtherMatches(other) };
}
