"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodayRange = getTodayRange;
function getTimezoneOffsetMs(date, timeZone) {
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
        .reduce((acc, p) => {
        acc[p.type] = p.value;
        return acc;
    }, {});
    const asIfUTC = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
    return asIfUTC - date.getTime();
}
function getTodayRange(timeZone, now = new Date()) {
    const dateKey = now.toLocaleDateString('en-CA', { timeZone });
    const midnightAsUTC = new Date(`${dateKey}T00:00:00.000Z`);
    const offsetMs = getTimezoneOffsetMs(midnightAsUTC, timeZone);
    const start = new Date(midnightAsUTC.getTime() - offsetMs);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { start, end, dateKey };
}
//# sourceMappingURL=timezone.js.map