export type ContentTypeId =
  | "linkedin"
  | "instagram"
  | "tiktok"
  | "hooks"
  | "carousel"
  | "ctas"
  | "imagePrompts"
  | "threads"
  | "videoHooks"
  | "quoteGraphics"
  | "rewrites"
  | "youtubeScripts"
  | "youtubeTitles"
  | "youtubeDescriptions"
  | "youtubeTags"
  | "platformHashtags";

export type ToneId =
  | "calm-authority"
  | "direct-reset"
  | "operational-credibility"
  | "emotionally-sharp"
  | "firm-but-human";

export type SharpnessId = "soft" | "balanced" | "direct" | "very-direct";

export type CtaModeId = "none" | "soft" | "website" | "product";

export type PresetTopicId =
  | "none"
  | "difficult-conversations"
  | "overexplaining"
  | "frontline-leadership"
  | "new-manager-confidence"
  | "women-stepping-into-authority"
  | "emotional-control"
  | "calm-authority"
  | "communication-clarity"
  | "leadership-under-pressure"
  | "accountability-standards"
  | "managing-resistance";

export type FilterId =
  | "all"
  | "linkedin"
  | "instagram"
  | "tiktok"
  | "hashtags"
  | "hooks"
  | "carousel"
  | "youtube"
  | "rewrites"
  | "visuals"
  | "saved";

export type GeneratedSection = {
  id: string;
  type: ContentTypeId;
  title: string;
  platform: string;
  body: string;
  items: string[];
  cta?: string;
};

export type GenerationResult = {
  id: string;
  createdAt: string;
  source: string;
  tone: ToneId;
  sharpness?: SharpnessId;
  ctaMode?: CtaModeId;
  presetTopic?: PresetTopicId;
  selectedTypes: ContentTypeId[];
  title: string;
  summary: string;
  sections: GeneratedSection[];
};

export type Draft = {
  id: string;
  updatedAt: string;
  title: string;
  source: string;
  tone: ToneId;
  sharpness?: SharpnessId;
  ctaMode?: CtaModeId;
  presetTopic?: PresetTopicId;
  selectedTypes: ContentTypeId[];
};

export type StudioStore = {
  version: 1;
  recent: GenerationResult[];
  saved: GenerationResult[];
  drafts: Draft[];
};

export type GenerateRequest = {
  source: string;
  tone: ToneId;
  sharpness: SharpnessId;
  ctaMode: CtaModeId;
  presetTopic: PresetTopicId;
  selectedTypes: ContentTypeId[];
};
