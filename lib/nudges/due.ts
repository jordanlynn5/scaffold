// Is this person's nudge due now? (spec.md > Components > Nudge Sender)
// The bell rings once an hour, on the hour. A nudge is due from its chosen
// time until an hour later. That catches the next bell even where the clock
// is offset by half an hour (India, for example, where the nudge arrives
// 30 minutes after the chosen time), but moving your nudge time to earlier in
// the day doesn't send one straight away.
// No imports, so scripts/check-nudges.mjs can test it directly.

export const DUE_WINDOW_MINUTES = 60;

// The date and minute of the day where the person lives.
export function clockInZone(timeZone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    minute: Number(part("hour")) * 60 + Number(part("minute")),
  };
}

// nudgeTime is "HH:MM" or "HH:MM:SS".
export function isDue(nudgeTime: string, timeZone: string, now = new Date()) {
  const [hours, minutes] = nudgeTime.split(":").map(Number);
  const start = hours * 60 + minutes;
  const { minute } = clockInZone(timeZone, now);
  return minute >= start && minute < start + DUE_WINDOW_MINUTES;
}
