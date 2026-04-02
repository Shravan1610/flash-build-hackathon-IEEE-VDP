export function formatEventDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function parseTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();

  date.setHours(hours ?? 0, minutes ?? 0, 0, 0);

  return date;
}

export function formatEventTimeRange(startTime: string | null, endTime: string | null) {
  if (!startTime) {
    return "Time pending review";
  }

  const formatter = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  const startLabel = formatter.format(parseTime(startTime));

  if (!endTime) {
    return startLabel;
  }

  return `${startLabel} - ${formatter.format(parseTime(endTime))}`;
}

export function summarizeEventText(value: string | null) {
  if (!value) {
    return "Structured metadata generated from the original event poster.";
  }

  const cleaned = value.replace(/\s+/g, " ").trim();

  if (cleaned.length <= 140) {
    return cleaned;
  }

  return `${cleaned.slice(0, 137).trimEnd()}...`;
}
