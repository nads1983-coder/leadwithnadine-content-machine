import {
  CtaModeId,
  ContentTypeId,
  FilterId,
  SharpnessId,
  ToneId
} from "@/types/content";

export type ContentTypeConfig = {
  id: ContentTypeId;
  label: string;
  shortLabel: string;
  group: FilterId;
  prompt: string;
};

export const contentTypes: ContentTypeConfig[] = [
  {
    id: "linkedin",
    label: "LinkedIn Posts",
    shortLabel: "LinkedIn",
    group: "linkedin",
    prompt: "One natural LinkedIn post with a strong first line, clean paragraph spacing, lived operational credibility, and an emotionally intelligent ending."
  },
  {
    id: "instagram",
    label: "Instagram Captions",
    shortLabel: "Instagram",
    group: "instagram",
    prompt: "Three Instagram captions with a strong first line, grounded emotional clarity, natural paragraph rhythm, and no more than seven hashtags each."
  },
  {
    id: "tiktok",
    label: "TikTok Captions",
    shortLabel: "TikTok",
    group: "tiktok",
    prompt: "Three short TikTok captions with sharp emotional framing, strong hooks, minimal filler, and no more than five hashtags each."
  },
  {
    id: "hooks",
    label: "Hooks",
    shortLabel: "Hooks",
    group: "hooks",
    prompt: "Eight tension-driven hooks that feel emotionally accurate, psychologically observant, and leadership credible."
  },
  {
    id: "carousel",
    label: "Carousel Slide Concepts",
    shortLabel: "Carousel",
    group: "carousel",
    prompt: "A carousel concept with slide-by-slide headlines, concise supporting points, and less symmetry than a generic template."
  },
  {
    id: "ctas",
    label: "CTA Suggestions",
    shortLabel: "CTAs",
    group: "all",
    prompt: "Five CTA options matched to the selected CTA mode, useful and not salesy."
  },
  {
    id: "imagePrompts",
    label: "Image Generation Prompts",
    shortLabel: "Images",
    group: "visuals",
    prompt: "Three image generation prompts for premium dark LeadWithNadine visuals using purple and gold accents."
  },
  {
    id: "threads",
    label: "Thread Variations",
    shortLabel: "Threads",
    group: "all",
    prompt: "One concise thread variation with natural sequencing and calm authority."
  },
  {
    id: "platformHashtags",
    label: "Platform Hashtags",
    shortLabel: "Hashtags",
    group: "hashtags",
    prompt: "Hashtag sets for LinkedIn, TikTok, Instagram, YouTube Shorts, and Threads. Keep each set platform-appropriate and avoid generic motivational tags."
  },
  {
    id: "videoHooks",
    label: "Short-form Video Hooks",
    shortLabel: "Video Hooks",
    group: "hooks",
    prompt: "Eight face-to-camera short-form video hooks with controlled pacing, tension, and no hype."
  },
  {
    id: "quoteGraphics",
    label: "Quote Graphics",
    shortLabel: "Quotes",
    group: "visuals",
    prompt: "Six quote graphic lines that are direct, grounded, and visually strong."
  },
  {
    id: "rewrites",
    label: "Leadership Rewrites",
    shortLabel: "Rewrites",
    group: "rewrites",
    prompt: "Rewrite the source into clearer leadership language, removing overexplaining, softening, and robotic polish."
  },
  {
    id: "youtubeScripts",
    label: "YouTube Shorts Scripts",
    shortLabel: "YT Scripts",
    group: "youtube",
    prompt: "One YouTube Shorts hook and concise spoken script with conversational pacing, retention beats, and natural face-to-camera delivery."
  },
  {
    id: "youtubeTitles",
    label: "YouTube Shorts Titles",
    shortLabel: "YT Titles",
    group: "youtube",
    prompt: "Eight curiosity-driven YouTube Shorts titles that are searchable without sounding clickbait or exaggerated."
  },
  {
    id: "youtubeDescriptions",
    label: "YouTube Descriptions",
    shortLabel: "YT Desc",
    group: "youtube",
    prompt: "Two SEO-aware YouTube Shorts descriptions in the LeadWithNadine voice."
  },
  {
    id: "youtubeTags",
    label: "YouTube Tags",
    shortLabel: "YT Tags",
    group: "youtube",
    prompt: "A searchable YouTube tag set for leadership communication, difficult conversations, and overexplaining."
  }
];

export const tones: Array<{ id: ToneId; label: string; description: string }> = [
  {
    id: "calm-authority",
    label: "Calm Authority",
    description: "Clear, composed, and firm without sounding harsh."
  },
  {
    id: "direct-reset",
    label: "Direct Reset",
    description: "Sharper correction for overexplaining or unclear leadership."
  },
  {
    id: "operational-credibility",
    label: "Operational Credibility",
    description: "Grounded in frontline pressure, standards, and decisions."
  },
  {
    id: "emotionally-sharp",
    label: "Emotionally Sharp",
    description: "Psychologically precise, direct, and human."
  },
  {
    id: "firm-but-human",
    label: "Firm But Human",
    description: "Warm enough to land, firm enough to lead."
  }
];

export const sharpnessModes: Array<{
  id: SharpnessId;
  label: string;
  description: string;
}> = [
  {
    id: "soft",
    label: "Soft",
    description: "Gentler framing with lower intensity and more warmth."
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Clear authority with emotional control and restraint."
  },
  {
    id: "direct",
    label: "Direct",
    description: "Shorter, firmer, and more psychologically pointed."
  },
  {
    id: "very-direct",
    label: "Very Direct",
    description: "Blunt, concise, and high authority without hype."
  }
];

export const ctaModes: Array<{
  id: CtaModeId;
  label: string;
  description: string;
}> = [
  {
    id: "none",
    label: "No CTA",
    description: "End with the idea. No prompt to comment, click, or buy."
  },
  {
    id: "soft",
    label: "Soft CTA",
    description: "Use a quiet reflection or conversation prompt."
  },
  {
    id: "website",
    label: "Website CTA",
    description: "Invite the reader toward LeadWithNadine calmly."
  },
  {
    id: "product",
    label: "Product CTA",
    description: "Point to a guide, reset, or paid offer without pressure."
  }
];

export const filters: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "hashtags", label: "Hashtags" },
  { id: "hooks", label: "Hooks" },
  { id: "carousel", label: "Carousel" },
  { id: "youtube", label: "YouTube" },
  { id: "rewrites", label: "Rewrites" },
  { id: "visuals", label: "Visuals" },
  { id: "saved", label: "Saved" }
];

export const defaultSelectedTypes: ContentTypeId[] = [
  "linkedin",
  "instagram",
  "hooks",
  "youtubeScripts",
  "tiktok",
  "platformHashtags",
  "imagePrompts"
];

export function labelForContentType(id: ContentTypeId) {
  return contentTypes.find((type) => type.id === id)?.label ?? id;
}

export function labelForTone(id: ToneId) {
  return tones.find((tone) => tone.id === id)?.label ?? "Calm Authority";
}

export function labelForSharpness(id: SharpnessId) {
  return sharpnessModes.find((mode) => mode.id === id)?.label ?? "Balanced";
}

export function labelForCtaMode(id: CtaModeId) {
  return ctaModes.find((mode) => mode.id === id)?.label ?? "Soft CTA";
}
