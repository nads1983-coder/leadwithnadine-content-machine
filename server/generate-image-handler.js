import { NextResponse } from "next/server";
import {
  imagePlatformOption,
  imagePlatformOptions,
  imageStyleOption,
  imageStyleOptions
} from "@/lib/image-generation";

const platformIds = new Set(imagePlatformOptions.map((option) => option.id));
const styleIds = new Set(imageStyleOptions.map((option) => option.id));
const brand = {
  name: "GetContentOS",
  ink: "#09070f",
  purple: "#28113f",
  violet: "#7b2ff2",
  gold: "#d8a928",
  bone: "#f4efe7",
  muted: "#c9c1b6"
};

function sanitizeInput(value) {
  return String(value ?? "")
    .replace(/\[object Object\]/g, "")
    .replace(/\b(?:blob:|https?:\/\/|www\.)\S+/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function sanitizePosterText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return sanitizeInput(value)
    .replace(/[{}[\]<>]/g, "")
    .replace(/\s+\n/g, "\n")
    .slice(0, maxLength)
    .trim();
}

function normalizeImageRequest(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid image request.");
  }

  const postText = typeof body.postText === "string" ? sanitizeInput(body.postText) : "";
  const platform = platformIds.has(body.platform) ? body.platform : "instagram";
  const style = styleIds.has(body.style) ? body.style : "premium-quote";
  const customInstruction =
    typeof body.customInstruction === "string"
      ? sanitizeInput(body.customInstruction).slice(0, 400)
      : "";

  if (postText.length < 12) {
    throw new Error("Add a little more post text before generating an image.");
  }

  return {
    postText: postText.slice(0, 1800),
    platform,
    style,
    customInstruction
  };
}

function fallbackPosterCopy(postText) {
  const clean = sanitizeInput(postText);
  const lines = clean.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const hashtags = Array.from(clean.matchAll(/#[\p{L}\p{N}_]+/gu))
    .map((match) => match[0])
    .slice(0, 5);
  const textLines = lines.filter((line) => !/^#/.test(line));
  const headline = textLines[0] ?? "Clear leadership does not need noise";
  const body = textLines.slice(1, 4).join(" ");

  return {
    headline: sanitizePosterText(headline, 86),
    body: sanitizePosterText(body, 190),
    cta: "",
    hashtags
  };
}

function normalizePosterCopy(value, postText) {
  const fallback = fallbackPosterCopy(postText);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallback;
  }

  const headline = sanitizePosterText(value.headline, 90) || fallback.headline;
  const body = sanitizePosterText(value.body, 220) || fallback.body;
  const cta = sanitizePosterText(value.cta, 70);
  const hashtags = Array.isArray(value.hashtags)
    ? value.hashtags
        .filter((tag) => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter((tag) => /^#[\p{L}\p{N}_]+$/u.test(tag))
        .slice(0, 5)
    : fallback.hashtags;

  return { headline, body, cta, hashtags };
}

function extractResponseText(value) {
  if (!value || typeof value !== "object") {
    return "";
  }

  if (typeof value.output_text === "string") {
    return value.output_text;
  }

  const output = Array.isArray(value.output) ? value.output : [];
  for (const item of output) {
    const content = item && typeof item === "object" ? item.content : null;
    if (!Array.isArray(content)) {
      continue;
    }

    for (const part of content) {
      const text = part && typeof part === "object" ? part.text : "";
      if (typeof text === "string") {
        return text;
      }
    }
  }

  return "";
}

async function buildPosterCopy(postText) {
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5.2",
        instructions:
          "Extract concise poster copy from social media text. Return JSON only. Do not invent facts. No em dashes.",
        input: `Create clean social graphic copy from this content:\n${postText}`,
        text: {
          format: {
            type: "json_schema",
            name: "poster_copy",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["headline", "body", "cta", "hashtags"],
              properties: {
                headline: { type: "string" },
                body: { type: "string" },
                cta: { type: "string" },
                hashtags: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error("Poster copy generation failed.");
    }

    const outputText = extractResponseText(await response.json());
    return normalizePosterCopy(JSON.parse(outputText), postText);
  } catch {
    return fallbackPosterCopy(postText);
  }
}

function buildBackgroundPrompt(request) {
  const platform = imagePlatformOption(request.platform);
  const style = imageStyleOption(request.style);

  return `
Create a premium abstract background for a social media leadership graphic.

Background only. Absolutely no text. No letters. No typography. No words. No numbers. No logos. No symbols. No icons. No handwriting. No signage. No badges.

Style:
- ${style.prompt}
- Platform crop target: ${platform.label}
- Palette: near-black, deep purple, restrained violet glow, subtle gold accent, off-white space
- Mood: calm authority, premium editorial, psychologically sharp, operationally credible
- Composition: uncluttered background with safe negative space for app-rendered text
- Avoid generic corporate stock-photo style, people, faces, police imagery, weapons, fake UI, watermarks, and visible writing
${request.customInstruction ? `- Extra non-text visual direction: ${request.customInstruction}` : ""}
`.trim();
}

async function generateBackground(request) {
  const platform = imagePlatformOption(request.platform);
  const prompt = buildBackgroundPrompt(request);

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
        prompt,
        size: platform.apiSize,
        quality: "medium",
        n: 1
      })
    });

    if (!response.ok) {
      throw new Error("Background generation failed.");
    }

    const data = await response.json();
    const imageBase64 = data?.data?.[0]?.b64_json;
    return {
      dataUrl: imageBase64 ? `data:image/png;base64,${imageBase64}` : "",
      prompt,
      generated: Boolean(imageBase64)
    };
  } catch {
    return { dataUrl: "", prompt, generated: false };
  }
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text, maxChars) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    if (word.length > maxChars) {
      if (current) {
        lines.push(current);
        current = "";
      }
      lines.push(word.slice(0, maxChars));
      continue;
    }

    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function fitText(text, maxWidth, maxLines, startSize, minSize) {
  for (let fontSize = startSize; fontSize >= minSize; fontSize -= 2) {
    const maxChars = Math.max(12, Math.floor(maxWidth / (fontSize * 0.54)));
    const lines = wrapText(text, maxChars);
    if (lines.length <= maxLines) {
      return { lines, fontSize, lineHeight: Math.round(fontSize * 1.12), truncated: false };
    }
  }

  const maxChars = Math.max(12, Math.floor(maxWidth / (minSize * 0.54)));
  const lines = wrapText(text, maxChars).slice(0, maxLines);
  const last = lines[lines.length - 1] ?? "";
  lines[lines.length - 1] = `${last.replace(/[.,;:!?]$/, "").slice(0, Math.max(0, maxChars - 1))}…`;
  return { lines, fontSize: minSize, lineHeight: Math.round(minSize * 1.12), truncated: true };
}

function renderLines(block, x, y, color, weight, anchor = "start") {
  return block.lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * block.lineHeight}" text-anchor="${anchor}" fill="${color}" font-family="Inter, Arial, sans-serif" font-size="${block.fontSize}" font-weight="${weight}">${escapeXml(line)}</text>`
    )
    .join("");
}

function renderPosterSvg(request, poster, backgroundDataUrl) {
  const platform = imagePlatformOption(request.platform);
  const style = imageStyleOption(request.style);
  const { width, height } = platform.canvas;
  const margin = Math.round(width * 0.085);
  const contentWidth = width - margin * 2;
  const headline = fitText(poster.headline, contentWidth, style.layout === "quote" ? 5 : 3, height > 1000 ? 82 : 62, 38);
  const body = fitText(poster.body, contentWidth, height > 1000 ? 5 : 3, height > 1000 ? 38 : 30, 24);
  const cta = fitText(poster.cta, contentWidth, 2, 30, 22);
  const tags = fitText(poster.hashtags.join(" "), contentWidth, 2, 28, 20);
  const warning = headline.truncated || body.truncated || cta.truncated || tags.truncated;
  const bg = backgroundDataUrl
    ? `<image href="${backgroundDataUrl}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" opacity="0.82"/>`
    : `<rect width="${width}" height="${height}" fill="url(#fallbackBg)"/>`;
  const panel =
    style.layout === "creator"
      ? `<rect x="${margin - 24}" y="${margin + 34}" width="${contentWidth + 48}" height="${height - margin * 2 - 68}" rx="34" fill="#09070f" opacity="0.78" stroke="${brand.gold}" stroke-opacity="0.28"/>`
      : "";
  const headlineY = style.layout === "quote" ? Math.round(height * 0.24) : margin + 116;
  const bodyY = headlineY + headline.lines.length * headline.lineHeight + 42;
  const ctaY = height - margin - (poster.hashtags.length ? 96 : 48);
  const tagY = height - margin - 26;

  return {
    warning,
    svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="fallbackBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${brand.ink}"/>
      <stop offset="48%" stop-color="${brand.purple}"/>
      <stop offset="100%" stop-color="#120817"/>
    </linearGradient>
    <radialGradient id="glow" cx="82%" cy="12%" r="65%">
      <stop offset="0%" stop-color="${brand.violet}" stop-opacity="0.54"/>
      <stop offset="100%" stop-color="${brand.violet}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${brand.ink}"/>
  ${bg}
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <rect width="${width}" height="${height}" fill="${brand.ink}" opacity="0.42"/>
  ${panel}
  <line x1="${margin}" y1="${margin}" x2="${margin}" y2="${margin + 118}" stroke="${brand.gold}" stroke-width="6" stroke-linecap="round"/>
  <text x="${margin + 24}" y="${margin + 22}" fill="${brand.gold}" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="4">${escapeXml(style.label.toUpperCase())}</text>
  ${renderLines(headline, margin, headlineY, style.layout === "quote" ? brand.gold : brand.bone, 800)}
  ${poster.body ? renderLines(body, margin, bodyY, brand.bone, 500) : ""}
  ${poster.cta ? `<rect x="${margin}" y="${ctaY - 38}" width="${contentWidth}" height="${cta.lines.length * cta.lineHeight + 38}" rx="20" fill="${brand.purple}" opacity="0.64" stroke="${brand.gold}" stroke-opacity="0.34"/>${renderLines(cta, margin + 24, ctaY, brand.bone, 700)}` : ""}
  ${poster.hashtags.length ? renderLines(tags, margin, tagY, brand.gold, 700) : ""}
  <text x="${width - margin}" y="${height - 34}" text-anchor="end" fill="${brand.muted}" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700">${escapeXml(brand.name)}</text>
</svg>`
  };
}

function svgDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function handleGenerateImage(nextRequest) {
  let request;

  try {
    request = normalizeImageRequest(await nextRequest.json());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid image request." },
      { status: 400 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is not configured. Add the existing OpenAI key to .env.local or your deployment environment."
      },
      { status: 500 }
    );
  }

  const poster = await buildPosterCopy(request.postText);
  const background = await generateBackground(request);
  const rendered = renderPosterSvg(request, poster, background.dataUrl);
  const warnings = [
    rendered.warning ? "Some long text was resized or truncated to keep the graphic readable." : "",
    background.generated ? "" : "AI background failed, so a clean template background was used."
  ].filter(Boolean);

  return NextResponse.json({
    imageDataUrl: svgDataUrl(rendered.svg),
    imageMimeType: "image/svg+xml",
    prompt: background.prompt,
    poster,
    platform: request.platform,
    style: request.style,
    size: `${imagePlatformOption(request.platform).canvas.width}x${imagePlatformOption(request.platform).canvas.height}`,
    backgroundGenerated: background.generated,
    warnings,
    createdAt: new Date().toISOString()
  });
}
