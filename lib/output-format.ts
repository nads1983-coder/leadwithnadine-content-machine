import type { ContentTypeId, GeneratedSection } from "@/types/content";

export type OutputDisplay = {
  platformLabel: string;
  title: string;
  hook?: string;
  subject?: string;
  preview?: string;
  youtubeTitle?: string;
  description?: string;
  paragraphs: string[];
  tweets: string[];
  supportingItems: string[];
  hashtags: string[];
  tags: string[];
  cta?: string;
};

const urlPattern = /\b(?:blob:|https?:\/\/|www\.)\S+/gi;
const metadataPattern = /\b(?:imageUrl|thumbnailUrl|metadata|createdAt|updatedAt|internalUrl)\b/gi;
const hashtagPattern = /#[\p{L}\p{N}_]+/gu;

const platformLabels: Partial<Record<ContentTypeId, string>> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  xTwitter: "X/Twitter",
  facebook: "Facebook",
  generalPost: "General Post",
  tiktok: "TikTok",
  threads: "Thread",
  youtubeScripts: "YouTube Shorts",
  youtubeTitles: "YouTube Shorts",
  youtubeDescriptions: "YouTube Shorts",
  youtubeTags: "YouTube Tags",
  email: "Email"
};

function cleanDisplayText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n?/g, "\n")
    .replace(/\[object Object\]/g, "")
    .replace(urlPattern, "")
    .replace(metadataPattern, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function parseJsonRecord(value: string) {
  const cleaned = cleanDisplayText(value);

  if (!/^[{[]/.test(cleaned)) {
    return null;
  }

  try {
    const parsed = JSON.parse(cleaned) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function stringFromRecord(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const cleaned = cleanDisplayText(value);
      if (cleaned) {
        return cleaned;
      }
    }
  }

  return "";
}

function stringsFromValue(value: unknown): string[] {
  if (typeof value === "string") {
    const cleaned = cleanDisplayText(value);
    return cleaned ? [cleaned] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(stringsFromValue);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return [
      stringFromRecord(record, ["text", "content", "body", "caption", "post", "tweet", "description", "prompt", "value"])
    ].filter(Boolean);
  }

  return [];
}

function splitParagraphs(value: string) {
  return cleanDisplayText(value)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function splitLineItems(value: string) {
  return cleanDisplayText(value)
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

function unique(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const cleaned = cleanDisplayText(value);
    if (!cleaned || seen.has(cleaned)) {
      return false;
    }

    seen.add(cleaned);
    return true;
  });
}

function isHashtagLine(value: string) {
  const cleaned = cleanDisplayText(value);
  if (!cleaned.includes("#")) {
    return false;
  }

  const withoutTags = cleaned.replace(hashtagPattern, "").replace(/[,\s|]+/g, "");
  return withoutTags.length === 0;
}

function hashtagsFrom(value: string) {
  return cleanDisplayText(value).match(hashtagPattern) ?? [];
}

function splitCaptionHashtags(paragraphs: string[]) {
  const body: string[] = [];
  const hashtags: string[] = [];

  for (const paragraph of paragraphs) {
    const lines = paragraph.split("\n");
    const bodyLines = lines.filter((line) => {
      if (isHashtagLine(line)) {
        hashtags.push(...hashtagsFrom(line));
        return false;
      }

      return true;
    });

    const cleaned = cleanDisplayText(bodyLines.join("\n"));
    if (cleaned) {
      body.push(cleaned);
    }
  }

  while (body.length && isHashtagLine(body[body.length - 1] ?? "")) {
    hashtags.unshift(...hashtagsFrom(body.pop() ?? ""));
  }

  return {
    body,
    hashtags
  };
}

function classifyItems(items: string[]) {
  const hooks: string[] = [];
  const tweets: string[] = [];
  const hashtags: string[] = [];
  const tags: string[] = [];
  const supportingItems: string[] = [];

  for (const item of items.flatMap(splitLineItems)) {
    const cleaned = cleanDisplayText(item);
    const normalized = cleaned.toLowerCase();
    const value = cleaned.replace(/^(hook|cta|tags?|hashtags?|tweet\s*\d*|post\s*\d*|title|description|subject|preview)\s*:\s*/i, "").trim();

    if (!value) {
      continue;
    }

    if (/^hook\s*:/i.test(cleaned)) {
      hooks.push(value);
    } else if (/^(tweet\s*\d*|post\s*\d*|\d+\/|\d+\.)/i.test(cleaned)) {
      tweets.push(value);
    } else if (normalized.includes("hashtag") || isHashtagLine(cleaned)) {
      hashtags.push(...(hashtagsFrom(value).length ? hashtagsFrom(value) : [value]));
    } else if (normalized.startsWith("tags:") || normalized.startsWith("tag:")) {
      tags.push(...value.split(/[,|]/).map((tag) => tag.trim()).filter(Boolean));
    } else {
      supportingItems.push(value);
    }
  }

  return {
    hooks: unique(hooks),
    tweets: unique(tweets),
    hashtags: unique(hashtags),
    tags: unique(tags),
    supportingItems: unique(supportingItems)
  };
}

function threadFromText(value: string) {
  const lines = splitLineItems(value);
  if (lines.length <= 1) {
    return [];
  }

  const numbered = lines.filter((line) => /^(\d+\/|\d+\.)\s*/.test(line));
  return numbered.length >= 2 ? numbered : [];
}

export function buildOutputDisplay(section: GeneratedSection): OutputDisplay {
  const bodyRecord = parseJsonRecord(section.body);
  const itemRecords = section.items
    .map(parseJsonRecord)
    .filter((record): record is Record<string, unknown> => Boolean(record));
  const records = [bodyRecord, ...itemRecords].filter(
    (record): record is Record<string, unknown> => Boolean(record)
  );

  const structuredBody =
    records.map((record) => stringFromRecord(record, ["body", "content", "caption", "post", "script"])).find(Boolean) ?? "";
  const description =
    records.map((record) => stringFromRecord(record, ["description"])).find(Boolean) ?? "";
  const plainBody = structuredBody || cleanDisplayText(section.body);
  const classified = classifyItems([
    ...section.items,
    ...records.flatMap((record) => [
      ...stringsFromValue(record.items),
      ...stringsFromValue(record.hashtags),
      ...stringsFromValue(record.tags),
      ...stringsFromValue(record.tweets),
      ...stringsFromValue(record.thread)
    ])
  ]);

  const hook =
    records.map((record) => stringFromRecord(record, ["hook", "opening", "firstLine"])).find(Boolean) ??
    classified.hooks[0];
  const subject =
    records.map((record) => stringFromRecord(record, ["subject", "subjectLine"])).find(Boolean) ||
    lineValue(plainBody, "subject") ||
    lineValue(plainBody, "subject line");
  const preview =
    records.map((record) => stringFromRecord(record, ["preview", "previewLine", "openingLine"])).find(Boolean) ||
    lineValue(plainBody, "preview") ||
    lineValue(plainBody, "opening line");
  const youtubeTitle =
    records.map((record) => stringFromRecord(record, ["youtubeTitle", "videoTitle", "title"])).find(Boolean) ||
    lineValue(plainBody, "title") ||
    (section.type === "youtubeTitles" ? classified.supportingItems[0] : "");

  let paragraphs = splitParagraphs(
    removeLabeledLines(plainBody, ["subject", "subject line", "preview", "opening line", "hook", "title"])
  );
  let hashtags = [...classified.hashtags];
  const tags = [...classified.tags];
  let tweets = [...classified.tweets];
  let supportingItems = [...classified.supportingItems];

  if (["instagram", "tiktok"].includes(section.type)) {
    const split = splitCaptionHashtags(paragraphs);
    paragraphs = split.body;
    hashtags = [...hashtags, ...split.hashtags];
  }

  if (section.type === "xTwitter" || section.type === "threads") {
    tweets = unique([...tweets, ...threadFromText(plainBody)]);
    if (tweets.length) {
      paragraphs = [];
    }
  }

  if (section.type.startsWith("youtube")) {
    const bodyTags = paragraphs.filter(isHashtagLine).flatMap(hashtagsFrom);
    hashtags = [...hashtags, ...bodyTags];
    paragraphs = paragraphs.filter((paragraph) => !isHashtagLine(paragraph));
    if (section.type === "youtubeDescriptions" && description) {
      paragraphs = splitParagraphs(description);
    }
    if (section.type === "youtubeTags") {
      tags.push(...supportingItems);
      supportingItems = [];
    }
  }

  if (section.type === "email") {
    paragraphs = paragraphs.filter((paragraph) => {
      const normalized = paragraph.toLowerCase();
      return !normalized.startsWith("subject:") && !normalized.startsWith("preview:");
    });
  }

  return {
    platformLabel: platformLabels[section.type] ?? section.platform,
    title: section.title,
    hook,
    subject,
    preview,
    youtubeTitle,
    description,
    paragraphs: unique(paragraphs),
    tweets: unique(tweets),
    supportingItems: unique(supportingItems),
    hashtags: unique(hashtags),
    tags: unique(tags),
    cta: cleanDisplayText(section.cta)
  };
}

function lineValue(value: string, label: string) {
  const match = cleanDisplayText(value).match(new RegExp(`^${label}\\s*:\\s*(.+)$`, "im"));
  return match?.[1]?.trim() ?? "";
}

function removeLabeledLines(value: string, labels: string[]) {
  const pattern = new RegExp(`^(${labels.join("|")})\\s*:\\s*.+$`, "gim");
  return cleanDisplayText(value).replace(pattern, "").trim();
}
