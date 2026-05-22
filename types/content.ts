export type ContentTypeId =
  | "linkedin"
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
  | "youtubeTags";

export type ToneId =
  | "calm-authority"
  | "direct-reset"
  | "operational-credibility"
  | "emotionally-sharp"
  | "firm-but-human";

export type FilterId =
  | "all"
  | "linkedin"
  | "tiktok"
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
  selectedTypes: ContentTypeId[];
};
