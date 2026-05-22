import {
  ContentTypeId,
  FilterId,
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
    prompt: "One polished LinkedIn post with a strong hook, short paragraphs, lived operational credibility, and a concise ending."
  },
  {
    id: "tiktok",
    label: "TikTok Captions",
    shortLabel: "TikTok",
    group: "tiktok",
    prompt: "Three very short TikTok captions with emotional sharpness, minimal filler, and no more than five hashtags each."
  },
  {
    id: "hooks",
    label: "Hooks",
    shortLabel: "Hooks",
    group: "hooks",
    prompt: "Eight strong hooks for leadership communication content."
  },
  {
    id: "carousel",
    label: "Carousel Slide Concepts",
    shortLabel: "Carousel",
    group: "carousel",
    prompt: "A carousel concept with slide-by-slide headlines and concise supporting points."
  },
  {
    id: "ctas",
    label: "CTA Suggestions",
    shortLabel: "CTAs",
    group: "all",
    prompt: "Five subtle CTA options that feel confident, useful, and not salesy."
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
    prompt: "One concise thread variation with clear sequencing and calm authority."
  },
  {
    id: "videoHooks",
    label: "Short-form Video Hooks",
    shortLabel: "Video Hooks",
    group: "hooks",
    prompt: "Eight face-to-camera short-form video hooks with controlled pacing and no hype."
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
    prompt: "Rewrite the source into clearer leadership language, removing overexplaining and softening."
  },
  {
    id: "youtubeScripts",
    label: "YouTube Shorts Scripts",
    shortLabel: "YT Scripts",
    group: "youtube",
    prompt: "One YouTube Shorts hook and concise spoken script for face-to-camera delivery with subtitles."
  },
  {
    id: "youtubeTitles",
    label: "YouTube Shorts Titles",
    shortLabel: "YT Titles",
    group: "youtube",
    prompt: "Eight curiosity-driven YouTube Shorts titles that are searchable without sounding clickbait."
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

export const filters: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "tiktok", label: "TikTok" },
  { id: "hooks", label: "Hooks" },
  { id: "carousel", label: "Carousel" },
  { id: "youtube", label: "YouTube" },
  { id: "rewrites", label: "Rewrites" },
  { id: "visuals", label: "Visuals" },
  { id: "saved", label: "Saved" }
];

export const defaultSelectedTypes: ContentTypeId[] = [
  "linkedin",
  "hooks",
  "youtubeScripts",
  "tiktok",
  "imagePrompts"
];

export function labelForContentType(id: ContentTypeId) {
  return contentTypes.find((type) => type.id === id)?.label ?? id;
}

export function labelForTone(id: ToneId) {
  return tones.find((tone) => tone.id === id)?.label ?? "Calm Authority";
}
