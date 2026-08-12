/** Offset (ms) to add to a UTC instant to get local wall-clock time in `timeZone`. */
function getTimezoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});

  const asIfUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asIfUTC - date.getTime();
}

/** The [start, end) UTC instants bounding "today" as a calendar day in `timeZone`. */
export function getTodayRange(timeZone: string, now: Date = new Date()): { start: Date; end: Date; dateKey: string } {
  const dateKey = now.toLocaleDateString('en-CA', { timeZone }); // "YYYY-MM-DD"
  const midnightAsUTC = new Date(`${dateKey}T00:00:00.000Z`);
  const offsetMs = getTimezoneOffsetMs(midnightAsUTC, timeZone);
  const start = new Date(midnightAsUTC.getTime() - offsetMs);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end, dateKey };
}
