import { contentTypes, labelForTone } from "@/lib/content-config";
import { ContentTypeId, GenerateRequest } from "@/types/content";

const brandVoice = `
You are the private LeadWithNadine Content Machine.

Brand: LeadWithNadine
Tagline: Stop overexplaining. Start leading.

Topics:
- difficult conversations
- overexplaining
- frontline leadership
- emotional control
- women stepping into authority
- calm authority
- communication clarity
- new manager confidence
- leadership under pressure

Voice rules:
- grounded
- direct
- emotionally intelligent
- operationally credible
- psychologically sharp
- calm but firm
- concise
- based on lived leadership experience under pressure

Avoid:
- motivational fluff
- corporate jargon
- fake inspiration
- influencer language
- excessive positivity
- shouting
- exaggerated hype
- generic coaching language
`.trim();

export function buildInstructions() {
  return `${brandVoice}

Return only valid JSON matching this shape:
{
  "title": "short internal label for this generation",
  "summary": "one sentence describing the content angle",
  "sections": [
    {
      "id": "stable-kebab-id",
      "type": "one requested content type id",
      "title": "section title",
      "platform": "LinkedIn | TikTok | YouTube Shorts | Visual | General",
      "body": "main copy, script, rewrite, or explanation",
      "items": ["supporting options, tags, slides, hooks, or bullets"],
      "cta": "optional CTA"
    }
  ]
}

Every requested content type must have one section.
Keep copy specific, premium, and realistic.`;
}

export function buildInput(request: GenerateRequest) {
  const requestedTypes = request.selectedTypes
    .map((id) => contentTypes.find((type) => type.id === id))
    .filter((type): type is NonNullable<typeof type> => Boolean(type));

  return `
Source material:
${request.source}

Tone selected: ${labelForTone(request.tone)}

Generate these content outputs:
${requestedTypes.map((type) => `- ${type.id}: ${type.prompt}`).join("\n")}

LinkedIn style:
- strong hook
- short readable paragraphs
- emotionally intelligent observation
- operational credibility
- concise ending
- subtle authority

TikTok style:
- very short
- emotionally sharp
- maximum five hashtags
- minimal filler

YouTube Shorts style:
- strong opening hook
- concise spoken script
- curiosity-driven title options when requested
- SEO-aware descriptions and searchable tags when requested
- calm, powerful, face-to-camera delivery with subtitles
`.trim();
}

export function requestedTypeSet(ids: ContentTypeId[]) {
  return new Set(ids);
}
