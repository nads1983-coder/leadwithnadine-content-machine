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
  canvas: { width: number; height: number };
}> = [
  {
    id: "instagram",
    label: "Instagram square",
    size: "square",
    apiSize: "1024x1024",
    canvas: { width: 1080, height: 1080 }
  },
  {
    id: "tiktok",
    label: "TikTok vertical",
    size: "portrait",
    apiSize: "1024x1536",
    canvas: { width: 1080, height: 1350 }
  },
  {
    id: "xTwitter",
    label: "X/Twitter graphic",
    size: "landscape",
    apiSize: "1536x1024",
    canvas: { width: 1200, height: 675 }
  },
  {
    id: "facebook",
    label: "Facebook graphic",
    size: "square",
    apiSize: "1024x1024",
    canvas: { width: 1080, height: 1080 }
  },
  {
    id: "youtube",
    label: "YouTube community",
    size: "landscape",
    apiSize: "1536x1024",
    canvas: { width: 1200, height: 675 }
  }
];

export const imageStyleOptions: Array<{
  id: ImageStyleId;
  label: string;
  prompt: string;
  layout: "quote" | "editorial" | "creator";
}> = [
  {
    id: "premium-quote",
    label: "Authority Quote Card",
    prompt:
      "premium abstract editorial background, quiet authority, subtle vignette, space for a strong quote",
    layout: "quote"
  },
  {
    id: "minimal-leadership",
    label: "Dark Editorial Post",
    prompt:
      "minimal dark editorial background, executive studio atmosphere, restrained texture, calm premium feel",
    layout: "editorial"
  },
  {
    id: "bold-social",
    label: "Clean Creator Post",
    prompt:
      "clean creator post background, modern premium gradient, subtle geometric depth, high contrast space",
    layout: "creator"
  },
  {
    id: "carousel-cover",
    label: "Clean carousel cover",
    prompt:
      "clean carousel cover background, premium editorial frame, spacious composition, subtle gold accent",
    layout: "editorial"
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
