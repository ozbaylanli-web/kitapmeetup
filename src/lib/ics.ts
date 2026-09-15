/**
 * Minimal .ics (iCalendar) üretici — dış bir pakete gerek kalmadan, Apple
 * Takvim / Google Takvim / Outlook'un hepsinin anladığı standart formatta
 * tek bir VEVENT bloğu üretir.
 */
export function buildIcsEvent(event: {
  uid: string;
  title: string;
  description?: string | null;
  location?: string | null;
  url?: string | null;
  startsAt: string;
  /** Verilmezse başlangıçtan 2 saat sonrası varsayılır. */
  endsAt?: string | null;
}): string {
  const toIcsDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  const start = event.startsAt;
  const end = event.endsAt ?? new Date(new Date(event.startsAt).getTime() + 2 * 60 * 60 * 1000).toISOString();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kitapmeetup//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}@kitapmeetup.com`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escape(event.title)}`,
    event.description ? `DESCRIPTION:${escape(event.description)}` : null,
    event.location ? `LOCATION:${escape(event.location)}` : null,
    event.url ? `URL:${event.url}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((l): l is string => Boolean(l));

  return lines.join("\r\n");
}
