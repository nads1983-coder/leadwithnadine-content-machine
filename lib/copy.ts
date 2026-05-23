const readableFieldOrder = [
  "text",
  "content",
  "body",
  "caption",
  "post",
  "thread",
  "prompt",
  "subject",
  "subjectLine",
  "preview",
  "previewLine",
  "openingLine",
  "value",
  "description",
  "script",
  "title"
] as const;

const platformFieldOrder = [
  "linkedin",
  "linkedIn",
  "instagram",
  "tiktok",
  "tikTok",
  "twitter",
  "x",
  "xTwitter",
  "facebook",
  "youtube",
  "youTube",
  "threads",
  "thread",
  "carousel",
  "generalPost",
  "imagePrompt",
  "email"
] as const;

const excludedKeyPattern =
  /(url|href|link|blob|media|asset|src|thumbnail|imageUrl|video|file|download|metadata|createdAt|updatedAt|id|type|platform)/i;

export type NormaliseCopyOptions = {
  includeTitle?: boolean;
};

function cleanString(value: string) {
  let text = value
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n?/g, "\n")
    .replace(/\[object Object\]/g, "")
    .replace(/\bblob:[^\s]+/gi, "")
    .replace(/\bdata:image\/[^\s]+/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  text = text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();

  return text;
}

function maybeParseJsonString(value: string) {
  const trimmed = value.trim();

  if (!trimmed || !/^[{[]/.test(trimmed)) {
    return null;
  }

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function collectText(value: unknown, options: NormaliseCopyOptions): string[] {
  if (typeof value === "string") {
    const parsed = maybeParseJsonString(value);

    if (parsed !== null) {
      return collectText(parsed, options);
    }

    const cleaned = cleanString(value);
    return cleaned ? [cleaned] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectText(item, options));
  }

  if (!isRecord(value)) {
    return [];
  }

  if (Array.isArray(value.sections)) {
    return value.sections.flatMap((section) => collectText(section, options));
  }

  const parts: string[] = [];

  for (const key of readableFieldOrder) {
    if (key === "title" && !options.includeTitle) {
      continue;
    }

    if (key in value && !excludedKeyPattern.test(key)) {
      parts.push(...collectText(value[key], options));
    }
  }

  if (Array.isArray(value.items)) {
    parts.push(...collectText(value.items, options));
  }

  if (typeof value.cta === "string" && value.cta.trim()) {
    parts.push(...collectText(value.cta, options));
  }

  for (const key of platformFieldOrder) {
    if (key in value) {
      parts.push(...collectText(value[key], options));
    }
  }

  return parts;
}

export function normaliseCopyText(
  value: unknown,
  options: NormaliseCopyOptions = {}
) {
  const seen = new Set<string>();
  const text = collectText(value, options)
    .map(cleanString)
    .filter(Boolean)
    .filter((part) => {
      if (seen.has(part)) {
        return false;
      }

      seen.add(part);
      return true;
    })
    .join("\n\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();

  if (!text) {
    throw new Error("No clean plain text was available to copy.");
  }

  return text;
}

export async function copyPlainText(
  value: unknown,
  options: NormaliseCopyOptions = {}
) {
  const text = normaliseCopyText(value, options);

  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard ||
    typeof navigator.clipboard.writeText !== "function"
  ) {
    throw new Error("Clipboard is not available in this browser.");
  }

  await navigator.clipboard.writeText(text);
  return text;
}
