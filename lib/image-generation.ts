import type { ContentTypeId } from "@/types/content";

export type ImagePlatformId = "instagram" | "tiktok" | "xTwitter" | "facebook" | "youtube";

export type ImageStyleId =
  | "premium-quote"
  | "minimal-leadership"
  | "bold-social"
  | "carousel-cover";

export type ImageSizeId = "square" | "portrait" | "landscape";

export const imagePlatformOptions: Array<{
  id: ImagePlatformId;
  label: string;
  size: ImageSizeId;
  apiSize: "1024x1024" | "1024x1536" | "1536x1024";
}> = [
  { id: "instagram", label: "Instagram square", size: "square", apiSize: "1024x1024" },
  { id: "tiktok", label: "TikTok vertical", size: "portrait", apiSize: "1024x1536" },
  { id: "xTwitter", label: "X/Twitter graphic", size: "landscape", apiSize: "1536x1024" },
  { id: "facebook", label: "Facebook graphic", size: "square", apiSize: "1024x1024" },
  { id: "youtube", label: "YouTube community", size: "landscape", apiSize: "1536x1024" }
];

export const imageStyleOptions: Array<{
  id: ImageStyleId;
  label: string;
  prompt: string;
}> = [
  {
    id: "premium-quote",
    label: "Premium quote graphic",
    prompt:
      "premium quote graphic, strong editorial typography, one concise leadership quote, balanced negative space"
  },
  {
    id: "minimal-leadership",
    label: "Minimal leadership post",
    prompt:
      "minimal leadership post, clean hierarchy, restrained text, executive communication studio feel"
  },
  {
    id: "bold-social",
    label: "Bold social graphic",
    prompt:
      "bold social media graphic, high contrast headline treatment, confident visual weight, still uncluttered"
  },
  {
    id: "carousel-cover",
    label: "Clean carousel cover",
    prompt:
      "clean carousel cover, strong opening title, premium editorial layout, designed as the first slide"
  }
];

export function defaultImagePlatformForContentType(type: ContentTypeId): ImagePlatformId {
  if (type === "instagram") {
    return "instagram";
  }

  if (type === "tiktok" || type === "youtubeScripts") {
    return "tiktok";
  }

  if (type === "xTwitter" || type === "threads") {
    return "xTwitter";
  }

  if (type === "facebook") {
    return "facebook";
  }

  if (type.startsWith("youtube")) {
    return "youtube";
  }

  return "instagram";
}

export function imagePlatformOption(id: ImagePlatformId) {
  return imagePlatformOptions.find((option) => option.id === id) ?? imagePlatformOptions[0];
}

export function imageStyleOption(id: ImageStyleId) {
  return imageStyleOptions.find((option) => option.id === id) ?? imageStyleOptions[0];
}
