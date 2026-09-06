const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HTML_TAGS = /<[^>]*>/g;

export function sanitizeText(value: string) {
  return value
    .replace(CONTROL_CHARACTERS, "")
    .replace(HTML_TAGS, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeMultilineText(value: string) {
  return value
    .replace(CONTROL_CHARACTERS, "")
    .replace(HTML_TAGS, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function sanitizeUrl(value: string) {
  const clean = sanitizeText(value);
  if (!clean) return "";

  try {
    const parsed = new URL(clean.startsWith("http") ? clean : `https://${clean}`);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : "";
  } catch {
    return "";
  }
}
