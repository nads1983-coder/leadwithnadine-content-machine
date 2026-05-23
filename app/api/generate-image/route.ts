import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import {
  ImagePlatformId,
  ImageStyleId,
  imagePlatformOption,
  imagePlatformOptions,
  imageStyleOption,
  imageStyleOptions
} from "@/lib/image-generation";

export const runtime = "nodejs";

const platformIds = new Set(imagePlatformOptions.map((option) => option.id));
const styleIds = new Set(imageStyleOptions.map((option) => option.id));

type ImageRequest = {
  postText?: unknown;
  platform?: unknown;
  style?: unknown;
  customInstruction?: unknown;
};

function sanitizeInput(value: string) {
  return value
    .replace(/\[object Object\]/g, "")
    .replace(/\b(?:blob:|https?:\/\/|www\.)\S+/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function normalizeImageRequest(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid image request.");
  }

  const candidate = body as ImageRequest;
  const postText =
    typeof candidate.postText === "string" ? sanitizeInput(candidate.postText) : "";
  const platform = platformIds.has(candidate.platform as ImagePlatformId)
    ? (candidate.platform as ImagePlatformId)
    : "instagram";
  const style = styleIds.has(candidate.style as ImageStyleId)
    ? (candidate.style as ImageStyleId)
    : "premium-quote";
  const customInstruction =
    typeof candidate.customInstruction === "string"
      ? sanitizeInput(candidate.customInstruction).slice(0, 600)
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

function buildImagePrompt(request: ReturnType<typeof normalizeImageRequest>) {
  const platform = imagePlatformOption(request.platform);
  const style = imageStyleOption(request.style);

  return `
Create one premium LeadWithNadine social media graphic.

Use this post text as the source:
${request.postText}

Image direction:
- ${style.prompt}
- Platform target: ${platform.label}
- Brand feel: deep purple, charcoal black, subtle gold accents, clean premium layout, high contrast, modern leadership communication brand
- Text treatment: use a short, readable headline or quote extracted from the source. Do not place the entire post on the image.
- Mood: calm authority, direct, emotionally controlled, operationally credible
- Composition: uncluttered, mobile-readable, editorial social graphic, strong hierarchy
- Avoid generic corporate stock imagery, AI-looking clutter, fake motivational energy, police imagery, badges, weapons, courtroom scenes, and real people unless explicitly requested
- Do not include URLs, metadata, UI chrome, watermarks, or fake app screenshots
${request.customInstruction ? `- Custom direction: ${request.customInstruction}` : ""}
`.trim();
}

export async function POST(nextRequest: NextRequest) {
  let request: ReturnType<typeof normalizeImageRequest>;

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
          "OPENAI_API_KEY is not configured. Add the LeadWithNadine key to .env.local or your deployment environment."
      },
      { status: 500 }
    );
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  const platform = imagePlatformOption(request.platform);
  const prompt = buildImagePrompt(request);

  try {
    const response = await client.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
      prompt,
      size: platform.apiSize,
      quality: "medium",
      n: 1
    });

    const imageBase64 = response.data?.[0]?.b64_json;

    if (!imageBase64) {
      throw new Error("The image model did not return an image.");
    }

    return NextResponse.json({
      imageDataUrl: `data:image/png;base64,${imageBase64}`,
      prompt,
      platform: request.platform,
      style: request.style,
      size: platform.apiSize,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          "Image generation failed. Try a shorter post, a different size, or a simpler custom instruction."
      },
      { status: 500 }
    );
  }
}
