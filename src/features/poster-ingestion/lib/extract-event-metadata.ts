import { slugify } from "@/lib/utils/slugify";
import type { EventCategory } from "@/types/supabase";

interface ExtractedEventMetadata {
  title: string | null;
  slug: string | null;
  eventDate: string | null;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  category: EventCategory | null;
  confidence: number;
}

const MONTHS = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
} as const;

function cleanLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function parseDate(rawText: string) {
  const patterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d{2})/,
    /(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s*,?\s*(20\d{2})/i,
    /([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s*(20\d{2})/i,
  ];

  for (const pattern of patterns) {
    const match = rawText.match(pattern);
    if (!match) {
      continue;
    }

    let day = 0;
    let month = 0;
    let year = 0;

    if (pattern === patterns[0]) {
      day = Number(match[1]);
      month = Number(match[2]) - 1;
      year = Number(match[3]);
    } else if (pattern === patterns[1]) {
      day = Number(match[1]);
      month = MONTHS[match[2].toLowerCase() as keyof typeof MONTHS] ?? -1;
      year = Number(match[3]);
    } else {
      month = MONTHS[match[1].toLowerCase() as keyof typeof MONTHS] ?? -1;
      day = Number(match[2]);
      year = Number(match[3]);
    }

    if (month < 0 || !day || !year) {
      continue;
    }

    const date = new Date(Date.UTC(year, month, day));
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    return date.toISOString().slice(0, 10);
  }

  return null;
}

function convertTimeTo24Hour(hours: number, minutes: number, meridiem?: string) {
  let normalizedHours = hours;

  if (meridiem) {
    const lower = meridiem.toLowerCase();
    if (lower === "pm" && normalizedHours < 12) {
      normalizedHours += 12;
    }
    if (lower === "am" && normalizedHours === 12) {
      normalizedHours = 0;
    }
  }

  return `${String(normalizedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

function parseTimes(rawText: string) {
  const match = rawText.match(
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
  );

  if (match) {
    return {
      startTime: convertTimeTo24Hour(
        Number(match[1]),
        Number(match[2] ?? "0"),
        match[3],
      ),
      endTime: convertTimeTo24Hour(
        Number(match[4]),
        Number(match[5] ?? "0"),
        match[6] ?? match[3],
      ),
    };
  }

  const single = rawText.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (!single) {
    return {
      startTime: null,
      endTime: null,
    };
  }

  return {
    startTime: convertTimeTo24Hour(
      Number(single[1]),
      Number(single[2] ?? "0"),
      single[3],
    ),
    endTime: null,
  };
}

function parseVenue(lines: string[]) {
  const match = lines.find((line) => /^(venue|location|place)\s*[:\-]/i.test(line));
  if (match) {
    return cleanLine(match.replace(/^(venue|location|place)\s*[:\-]\s*/i, ""));
  }

  const indexed = lines.find((line) => /auditorium|hall|lab|campus|block|room/i.test(line));
  return indexed ? cleanLine(indexed) : null;
}

function inferCategory(rawText: string): EventCategory | null {
  const lower = rawText.toLowerCase();

  if (lower.includes("membership")) return "Membership Drive";
  if (lower.includes("seminar")) return "Seminar";
  if (lower.includes("workshop")) return "Workshop";
  if (lower.includes("hackathon")) return "Hackathon";
  if (lower.includes("coding challenge") || lower.includes("code rush") || lower.includes("contest")) {
    return "Coding Challenge";
  }

  return null;
}

function inferTitle(lines: string[], fileName?: string) {
  const candidates = lines.filter((line) => {
    const cleaned = cleanLine(line);
    if (!cleaned) return false;
    if (cleaned.length < 6) return false;
    if (/^(date|time|venue|location|place)\s*[:\-]/i.test(cleaned)) return false;
    if (/^\d/.test(cleaned)) return false;
    return true;
  });

  if (candidates.length) {
    return cleanLine(candidates[0]);
  }

  if (fileName) {
    return cleanLine(fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
  }

  return null;
}

export function extractEventMetadataFromPosterText(params: {
  rawText: string;
  fileName?: string;
}): ExtractedEventMetadata {
  const lines = params.rawText
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean);

  const title = inferTitle(lines, params.fileName);
  const eventDate = parseDate(params.rawText);
  const { startTime, endTime } = parseTimes(params.rawText);
  const venue = parseVenue(lines);
  const category = inferCategory(params.rawText);

  const score =
    (title ? 0.28 : 0) +
    (eventDate ? 0.24 : 0) +
    (startTime ? 0.16 : 0) +
    (venue ? 0.18 : 0) +
    (category ? 0.14 : 0);

  return {
    title,
    slug: title ? slugify(title) : null,
    eventDate,
    startTime,
    endTime,
    venue,
    category,
    confidence: Number(Math.min(score, 0.96).toFixed(3)),
  };
}
