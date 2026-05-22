"use client";

import {
  Archive,
  Bookmark,
  BookmarkCheck,
  Bold,
  Check,
  ChevronRight,
  Clipboard,
  Copy,
  Eraser,
  FileText,
  History,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Menu,
  Monitor,
  PenLine,
  RefreshCcw,
  Save,
  Smartphone,
  Sparkles,
  Strikethrough,
  Type,
  Underline,
  Wand2,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import {
  ctaModes,
  contentTypes,
  defaultSelectedTypes,
  filters,
  labelForCtaMode,
  labelForSharpness,
  labelForContentType,
  labelForPresetTopic,
  labelForTone,
  presetTopics,
  sharpnessModes,
  tones
} from "@/lib/content-config";
import {
  addRecent,
  readStore,
  toggleSaved,
  upsertDraft,
  writeStore
} from "@/lib/storage";
import {
  ContentTypeId,
  CtaModeId,
  Draft,
  FilterId,
  GenerateRequest,
  GeneratedSection,
  GenerationResult,
  PresetTopicId,
  SharpnessId,
  StudioStore,
  ToneId
} from "@/types/content";

const starterText =
  "A new manager kept softening every decision because she did not want to seem difficult. The issue was not confidence. It was the fear that clear leadership would be interpreted as cruelty.";

const sampleCreatedAt = "2026-01-01T09:00:00.000Z";

const sampleResult: GenerationResult = {
  id: "sample",
  createdAt: sampleCreatedAt,
  source: starterText,
  tone: "calm-authority",
  sharpness: "balanced",
  ctaMode: "soft",
  presetTopic: "overexplaining",
  selectedTypes: defaultSelectedTypes,
  title: "Clarity Under Pressure",
  summary:
    "A grounded angle about replacing excessive reassurance with clear leadership.",
  sections: [
    {
      id: "sample-linkedin",
      type: "linkedin",
      title: "LinkedIn Post",
      platform: "LinkedIn",
      body:
        "A lot of new leaders do not struggle because they lack authority.\n\nThey struggle because they are still trying to make authority feel comfortable for everyone else.\n\nSo they soften the decision.\nThey explain it three different ways.\nThey apologise before they are even challenged.\n\nBut leadership under pressure requires clarity, not constant reassurance.\n\nPeople can respect a decision without liking it.\nYour job is not to remove every ounce of discomfort.\nYour job is to communicate the standard clearly enough that the team knows where the line is.\n\nYou do not need to become harsh.\nYou do need to stop disappearing inside your explanation.",
      items: ["Strong hook", "Short paragraphs", "Calm but firm ending"],
      cta: "Where are you still overexplaining a decision that already needs to be clear?"
    },
    {
      id: "sample-instagram",
      type: "instagram",
      title: "Instagram Caption",
      platform: "Instagram",
      body:
        "Sometimes the issue is not that you are unclear.\n\nIt is that you are trying to make the truth easier for everyone to receive.\n\nThat is where overexplaining starts.\n\nClear leadership does not need to be cold. It does need to stop apologising for having standards.",
      items: [
        "#calmauthority",
        "#leadershipcommunication",
        "#difficultconversations",
        "#newmanagers",
        "#womeninleadership"
      ],
      cta: "Save this for the next time clarity feels uncomfortable."
    },
    {
      id: "sample-hashtags",
      type: "platformHashtags",
      title: "Platform Hashtags",
      platform: "General",
      body: "Platform-specific hashtag sets for this content angle.",
      items: [
        "LinkedIn: #leadershipcommunication #difficultconversations #calmauthority #frontlineleadership",
        "Instagram: #calmauthority #leadershipcommunication #womeninleadership #newmanagers #difficultconversations",
        "TikTok: #leadershiptips #calmauthority #workplacecommunication #newmanager",
        "YouTube Shorts: leadership communication, difficult conversations, overexplaining, calm authority, new manager tips, frontline leadership",
        "Threads: #calmauthority #leadership"
      ],
      cta: ""
    },
    {
      id: "sample-hooks",
      type: "hooks",
      title: "Hooks",
      platform: "General",
      body: "Sharp openings for the same leadership angle.",
      items: [
        "You are not being unclear because you lack confidence.",
        "Some leaders overexplain because they are trying to make authority feel harmless.",
        "Clear leadership is not cruelty.",
        "The decision does not need three soft landings."
      ],
      cta: ""
    }
  ]
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function isSaved(store: StudioStore, result?: GenerationResult) {
  if (!result) {
    return false;
  }

  return store.saved.some((item) => item.id === result.id);
}

function sectionMatchesFilter(section: GeneratedSection, activeFilter: FilterId) {
  if (activeFilter === "all" || activeFilter === "saved") {
    return true;
  }

  if (activeFilter === "hashtags") {
    return section.type === "platformHashtags" || section.type === "youtubeTags";
  }

  if (activeFilter === "youtube") {
    return section.type.startsWith("youtube");
  }

  if (activeFilter === "visuals") {
    return section.type === "imagePrompts" || section.type === "quoteGraphics";
  }

  return contentTypes.find((type) => type.id === section.type)?.group === activeFilter;
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

type FormatterMode = "desktop" | "mobile";
type TextStyle = "bold" | "italic" | "boldItalic" | "underline" | "strikethrough";

const formatterStarterText =
  "Clear leadership is not about sounding harsh.\n\nIt is about saying what needs to be said without hiding inside a long explanation.\n\nPeople trust clarity.\nNot constant reassurance.";

const plainAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const boldAlphabet =
  "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳";
const italicAlphabet =
  "𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧";
const boldItalicAlphabet =
  "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛";
const plainDigits = "0123456789";
const boldDigits = "𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗";

function mapCharacters(text: string, alphabet: string, digitSet = plainDigits) {
  return Array.from(text)
    .map((character) => {
      const letterIndex = plainAlphabet.indexOf(character);
      if (letterIndex >= 0) {
        return Array.from(alphabet)[letterIndex] ?? character;
      }

      const digitIndex = plainDigits.indexOf(character);
      if (digitIndex >= 0) {
        return Array.from(digitSet)[digitIndex] ?? character;
      }

      return character;
    })
    .join("");
}

function addCombiningMark(text: string, mark: string) {
  return Array.from(text)
    .map((character) => (/\s/.test(character) ? character : `${character}${mark}`))
    .join("");
}

function styleText(text: string, style: TextStyle) {
  if (style === "bold") {
    return mapCharacters(text, boldAlphabet, boldDigits);
  }

  if (style === "italic") {
    return mapCharacters(text, italicAlphabet);
  }

  if (style === "boldItalic") {
    return mapCharacters(text, boldItalicAlphabet, boldDigits);
  }

  if (style === "underline") {
    return addCombiningMark(text, "\u0332");
  }

  return addCombiningMark(text, "\u0336");
}

function prefixSelectedLines(text: string, numbered: boolean) {
  const lines = text.split("\n");
  let count = 1;

  return lines
    .map((line) => {
      if (!line.trim()) {
        return line;
      }

      const prefix = numbered ? `${count}. ` : "• ";
      count += 1;
      return `${prefix}${line.replace(/^([•]|\d+\.)\s+/, "")}`;
    })
    .join("\n");
}

export function StudioShell() {
  const [source, setSource] = useState(starterText);
  const [tone, setTone] = useState<ToneId>("calm-authority");
  const [sharpness, setSharpness] = useState<SharpnessId>("balanced");
  const [ctaMode, setCtaMode] = useState<CtaModeId>("soft");
  const [presetTopic, setPresetTopic] = useState<PresetTopicId>("overexplaining");
  const [selectedTypes, setSelectedTypes] = useState<ContentTypeId[]>(defaultSelectedTypes);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [store, setStore] = useState<StudioStore>({
    version: 1,
    recent: [],
    saved: [],
    drafts: []
  });
  const [hasMounted, setHasMounted] = useState(false);
  const [result, setResult] = useState<GenerationResult>(sampleResult);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setStore(readStore());
      setHasMounted(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    writeStore(store);
  }, [hasMounted, store]);

  const visibleSections = useMemo(() => {
    const sourceResult =
      activeFilter === "saved" && store.saved.length ? store.saved[0] : result;

    return sourceResult.sections.filter((section) =>
      sectionMatchesFilter(section, activeFilter)
    );
  }, [activeFilter, result, store.saved]);

  const canGenerate = source.trim().length > 7 && selectedTypes.length > 0 && !isPending;

  function persistStore(nextStore: StudioStore) {
    setStore(nextStore);
    writeStore(nextStore);
  }

  async function generateContent(nextSource = source) {
    setError("");
    setIsPending(true);

    const payload: GenerateRequest = {
      source: nextSource,
      tone,
      sharpness,
      ctaMode,
      presetTopic,
      selectedTypes
    };

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as GenerationResult | { error?: string };

      if (!response.ok) {
        const message = "error" in data ? data.error : undefined;
        throw new Error(message ?? "Generation failed.");
      }

      if (!("sections" in data)) {
        throw new Error("Generation returned an unexpected response.");
      }

      setResult(data);
      persistStore(addRecent(readStore(), data));
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Generation failed. Try again."
      );
    } finally {
      setIsPending(false);
    }
  }

  function toggleType(id: ContentTypeId) {
    setSelectedTypes((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function saveDraft() {
    const draft: Draft = {
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
      title: source.trim().slice(0, 54) || "Untitled leadership note",
      source,
      tone,
      sharpness,
      ctaMode,
      presetTopic,
      selectedTypes
    };

    persistStore(upsertDraft(readStore(), draft));
  }

  function loadDraft(draft: Draft) {
    setSource(draft.source);
    setTone(draft.tone);
    setSharpness(draft.sharpness ?? "balanced");
    setCtaMode(draft.ctaMode ?? "soft");
    setPresetTopic(draft.presetTopic ?? "none");
    setSelectedTypes(draft.selectedTypes);
    setHistoryOpen(false);
  }

  function saveCurrent() {
    persistStore(toggleSaved(readStore(), result));
  }

  function scrollToStudioSection(target: "composer" | "outputs" | "formatter") {
    document.getElementById(target)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function handleRailAction(action: RailAction) {
    if (action === "studio") {
      scrollToStudioSection("composer");
      return;
    }

    if (action === "outputs") {
      setActiveFilter("all");
      scrollToStudioSection("outputs");
      return;
    }

    if (action === "formatter") {
      scrollToStudioSection("formatter");
      return;
    }

    if (action === "saved") {
      setActiveFilter("saved");
      scrollToStudioSection("outputs");
      return;
    }

    setHistoryOpen(true);
    window.setTimeout(() => {
      document.getElementById("history-drafts")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 80);
  }

  async function copySection(section: GeneratedSection) {
    const text = [
      section.title,
      section.body,
      ...section.items.map((item) => `- ${item}`),
      section.cta ? `CTA: ${section.cta}` : ""
    ]
      .filter(Boolean)
      .join("\n\n");

    await copyText(text);
    setCopiedId(section.id);
    window.setTimeout(() => setCopiedId(""), 1400);
  }

  return (
    <main className="min-h-screen pb-28 text-bone lg:pb-0">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute right-[-5rem] top-12 h-72 w-72 rounded-full bg-violet/20 blur-3xl" />
        <div className="absolute bottom-28 left-[-6rem] h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <TopBar
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((value) => !value)}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      <div className="relative mx-auto grid w-full max-w-7xl gap-4 px-4 pb-6 pt-4 sm:px-5 lg:grid-cols-[5rem_minmax(0,1fr)_22rem] lg:gap-5 lg:px-6 lg:pt-6">
        <DesktopRail onNavigate={handleRailAction} />

        <div className="min-w-0 space-y-4">
          <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <ComposerPanel
              id="composer"
              source={source}
              tone={tone}
              sharpness={sharpness}
              ctaMode={ctaMode}
              presetTopic={presetTopic}
              selectedTypes={selectedTypes}
              canGenerate={canGenerate}
              isPending={isPending}
              onSourceChange={setSource}
              onToneChange={setTone}
              onSharpnessChange={setSharpness}
              onCtaModeChange={setCtaMode}
              onPresetTopicChange={setPresetTopic}
              onToggleType={toggleType}
              onGenerate={() => generateContent()}
              onSaveDraft={saveDraft}
            />

            <OutputPanel
              id="outputs"
              result={result}
              activeFilter={activeFilter}
              visibleSections={visibleSections}
              error={error}
              copiedId={copiedId}
              isPending={isPending}
              onFilterChange={setActiveFilter}
              onCopySection={copySection}
              onRegenerate={() => generateContent()}
              onSaveCurrent={saveCurrent}
              isSaved={isSaved(store, result)}
            />
          </section>

          <LinkedInFormatterPanel id="formatter" />
        </div>

        <HistoryPanel
          store={store}
          current={result}
          renderTimestamps={hasMounted}
          isOpen={historyOpen || menuOpen}
          onClose={() => {
            setHistoryOpen(false);
            setMenuOpen(false);
          }}
          onLoadResult={(item) => {
            setResult(item);
            setSource(item.source);
            setTone(item.tone);
            setSharpness(item.sharpness ?? "balanced");
            setCtaMode(item.ctaMode ?? "soft");
            setPresetTopic(item.presetTopic ?? "none");
            setSelectedTypes(item.selectedTypes);
            setHistoryOpen(false);
            setMenuOpen(false);
          }}
          onLoadDraft={loadDraft}
        />
      </div>

      <BottomActionBar
        canGenerate={canGenerate}
        isPending={isPending}
        saved={isSaved(store, result)}
        onGenerate={() => generateContent()}
        onSave={saveCurrent}
        onSaveDraft={saveDraft}
        onOpenHistory={() => setHistoryOpen(true)}
      />
    </main>
  );
}

function TopBar({
  menuOpen,
  onToggleMenu,
  onOpenHistory
}: {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onOpenHistory: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/86 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center border border-gold/50 bg-gold/10 text-sm font-bold text-goldSoft shadow-gold">
            LN
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg uppercase tracking-normal text-bone">
              LeadWith<span className="text-goldSoft">Nadine</span>
            </p>
            <p className="truncate text-xs text-muted">
              Stop overexplaining. Start leading.
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded border border-line bg-white/[0.03] px-3 py-2 text-xs text-muted lg:flex">
          <span className="h-2 w-2 rounded-full bg-goldSoft" />
          Private content studio
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={onOpenHistory}
            className="grid h-10 w-10 place-items-center border border-white/10 bg-white/[0.04] text-muted"
            aria-label="Open history"
          >
            <History size={18} />
          </button>
          <button
            type="button"
            onClick={onToggleMenu}
            className="grid h-10 w-10 place-items-center border border-white/10 bg-white/[0.04] text-muted"
            aria-label="Open menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}

type RailAction = "studio" | "drafts" | "saved" | "outputs" | "formatter";

function DesktopRail({ onNavigate }: { onNavigate: (action: RailAction) => void }) {
  const items = [
    { icon: PenLine, label: "Studio", action: "studio" as const },
    { icon: Archive, label: "Drafts", action: "drafts" as const },
    { icon: Bookmark, label: "Saved", action: "saved" as const },
    { icon: FileText, label: "Outputs", action: "outputs" as const },
    { icon: Type, label: "Formatter", action: "formatter" as const }
  ];

  return (
    <aside className="hidden rounded border border-white/10 bg-white/[0.035] p-3 lg:block">
      <div className="flex h-full flex-col items-center gap-3">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            title={item.label}
            onClick={() => onNavigate(item.action)}
            className="grid h-11 w-11 place-items-center border border-white/10 bg-ink/80 text-muted transition hover:border-violet/60 hover:text-bone"
          >
            <item.icon size={18} />
          </button>
        ))}
      </div>
    </aside>
  );
}

function ComposerPanel({
  id,
  source,
  tone,
  sharpness,
  ctaMode,
  presetTopic,
  selectedTypes,
  canGenerate,
  isPending,
  onSourceChange,
  onToneChange,
  onSharpnessChange,
  onCtaModeChange,
  onPresetTopicChange,
  onToggleType,
  onGenerate,
  onSaveDraft
}: {
  id: string;
  source: string;
  tone: ToneId;
  sharpness: SharpnessId;
  ctaMode: CtaModeId;
  presetTopic: PresetTopicId;
  selectedTypes: ContentTypeId[];
  canGenerate: boolean;
  isPending: boolean;
  onSourceChange: (value: string) => void;
  onToneChange: (value: ToneId) => void;
  onSharpnessChange: (value: SharpnessId) => void;
  onCtaModeChange: (value: CtaModeId) => void;
  onPresetTopicChange: (value: PresetTopicId) => void;
  onToggleType: (value: ContentTypeId) => void;
  onGenerate: () => void;
  onSaveDraft: () => void;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-20 min-w-0 rounded border border-white/10 bg-panel/78 p-4 shadow-violet backdrop-blur-xl sm:p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl uppercase leading-none tracking-normal text-bone sm:text-4xl">
            Content Machine
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
            Turn raw leadership pressure into clear, premium content.
          </p>
        </div>
        <div className="hidden border-l border-gold/50 pl-3 text-right text-xs text-goldSoft sm:block">
          Calm.
          <br />
          Clear.
          <br />
          Consistent.
        </div>
      </div>

      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-goldSoft">
        Source material
      </label>
      <textarea
        value={source}
        onChange={(event) => onSourceChange(event.target.value)}
        rows={10}
        className="studio-scroll mt-3 min-h-60 w-full resize-none rounded border border-line bg-ink/70 p-4 text-base leading-7 text-bone outline-none transition placeholder:text-muted/60 focus:border-violet/70 focus:ring-2 focus:ring-violet/20"
        placeholder="Paste notes, a voice memo transcript, a workplace situation, or the messy thought you want to turn into content."
      />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="flex min-h-12 items-center justify-center gap-2 rounded border border-violet/70 bg-violet px-4 text-sm font-semibold text-white shadow-violet transition hover:bg-violetDeep disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-muted"
        >
          {isPending ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
          Generate
        </button>
        <button
          type="button"
          onClick={onSaveDraft}
          className="flex min-h-12 items-center justify-center gap-2 rounded border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-bone transition hover:border-gold/60"
        >
          <Save size={17} />
          Save draft
        </button>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor="preset-topic"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-goldSoft"
          >
            Topic
          </label>
          <p className="truncate text-xs text-muted">{labelForPresetTopic(presetTopic)}</p>
        </div>
        <select
          id="preset-topic"
          value={presetTopic}
          onChange={(event) => onPresetTopicChange(event.target.value as PresetTopicId)}
          className="min-h-12 w-full rounded border border-line bg-ink/70 px-3 text-sm font-semibold text-bone outline-none transition focus:border-violet/70 focus:ring-2 focus:ring-violet/20"
        >
          {presetTopics.map((topic) => (
            <option key={topic.id} value={topic.id} className="bg-ink text-bone">
              {topic.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-goldSoft">
            Tone
          </p>
          <p className="text-xs text-muted">{labelForTone(tone)}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {tones.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onToneChange(item.id)}
              className={clsx(
                "rounded border p-3 text-left transition",
                tone === item.id
                  ? "border-gold/70 bg-gold/10 text-bone"
                  : "border-white/10 bg-white/[0.035] text-muted hover:border-violet/60"
              )}
            >
              <span className="block text-sm font-semibold text-bone">{item.label}</span>
              <span className="mt-1 block text-xs leading-5">{item.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-goldSoft">
            Sharpness
          </p>
          <p className="text-xs text-muted">{labelForSharpness(sharpness)}</p>
        </div>
        <div className="grid grid-cols-4 overflow-hidden rounded border border-white/10 bg-white/[0.03]">
          {sharpnessModes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSharpnessChange(item.id)}
              title={item.description}
              className={clsx(
                "min-h-11 border-r border-white/10 px-2 text-xs font-semibold transition last:border-r-0",
                sharpness === item.id
                  ? "bg-violet/25 text-bone"
                  : "text-muted hover:bg-white/[0.04] hover:text-bone"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-goldSoft">
            CTA
          </p>
          <p className="text-xs text-muted">{labelForCtaMode(ctaMode)}</p>
        </div>
        <div className="studio-scroll flex gap-2 overflow-x-auto pb-1">
          {ctaModes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onCtaModeChange(item.id)}
              title={item.description}
              className={clsx(
                "min-h-10 shrink-0 rounded border px-3 text-sm transition",
                ctaMode === item.id
                  ? "border-gold/70 bg-gold/10 text-bone"
                  : "border-white/10 bg-white/[0.03] text-muted hover:border-violet/50"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-goldSoft">
          Content types
        </p>
        <div className="studio-scroll flex snap-x gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible">
          {contentTypes.map((item) => {
            const active = selectedTypes.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggleType(item.id)}
                className={clsx(
                  "flex min-h-10 shrink-0 snap-start items-center gap-2 rounded border px-3 text-sm transition",
                  active
                    ? "border-violet/70 bg-violet/20 text-bone"
                    : "border-white/10 bg-white/[0.03] text-muted hover:border-violet/50"
                )}
              >
                {active ? <Check size={14} /> : <span className="h-3.5 w-3.5 rounded border border-current" />}
                {item.shortLabel}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function OutputPanel({
  id,
  result,
  activeFilter,
  visibleSections,
  error,
  copiedId,
  isPending,
  isSaved,
  onFilterChange,
  onCopySection,
  onRegenerate,
  onSaveCurrent
}: {
  id: string;
  result: GenerationResult;
  activeFilter: FilterId;
  visibleSections: GeneratedSection[];
  error: string;
  copiedId: string;
  isPending: boolean;
  isSaved: boolean;
  onFilterChange: (value: FilterId) => void;
  onCopySection: (section: GeneratedSection) => void;
  onRegenerate: () => void;
  onSaveCurrent: () => void;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-20 min-w-0 rounded border border-white/10 bg-coal/86 p-4 backdrop-blur-xl sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-goldSoft">
            Output workspace
          </p>
          <h2 className="mt-2 truncate font-display text-2xl uppercase tracking-normal text-bone">
            {result.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">{result.summary}</p>
        </div>
        <button
          type="button"
          onClick={onSaveCurrent}
          className={clsx(
            "grid h-11 w-11 shrink-0 place-items-center rounded border transition",
            isSaved
              ? "border-gold/70 bg-gold/15 text-goldSoft"
              : "border-white/10 bg-white/[0.04] text-muted hover:border-gold/60"
          )}
          aria-label="Save output"
        >
          {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded border border-gold/40 bg-gold/10 p-3 text-sm leading-6 text-bone">
          {error}
        </div>
      ) : null}

      <div className="studio-scroll mt-4 flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange(filter.id)}
            className={clsx(
              "min-h-10 shrink-0 rounded border px-3 text-sm transition",
              activeFilter === filter.id
                ? "border-gold/70 bg-gold/10 text-bone"
                : "border-white/10 bg-white/[0.035] text-muted hover:border-violet/50"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3">
        {isPending ? (
          <LoadingCard />
        ) : visibleSections.length ? (
          visibleSections.map((section) => (
            <OutputCard
              key={section.id}
              section={section}
              copied={copiedId === section.id}
              onCopy={() => onCopySection(section)}
            />
          ))
        ) : (
          <div className="rounded border border-white/10 bg-white/[0.03] p-4 text-sm text-muted">
            No outputs in this filter yet.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onRegenerate}
        disabled={isPending}
        className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-bone transition hover:border-violet/60 disabled:cursor-not-allowed disabled:text-muted"
      >
        <RefreshCcw size={17} />
        Regenerate current set
      </button>
    </section>
  );
}

function LinkedInFormatterPanel({ id }: { id: string }) {
  const [text, setText] = useState(formatterStarterText);
  const [previewMode, setPreviewMode] = useState<FormatterMode>("desktop");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function replaceSelection(transform: (value: string) => string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setText((current) => transform(current));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const hasSelection = start !== end;
    const targetText = hasSelection ? text.slice(start, end) : text;
    const replacement = transform(targetText);
    const nextText = hasSelection
      ? `${text.slice(0, start)}${replacement}${text.slice(end)}`
      : replacement;

    setText(nextText);
    window.requestAnimationFrame(() => {
      textarea.focus();
      if (hasSelection) {
        textarea.setSelectionRange(start, start + replacement.length);
      }
    });
  }

  function applyStyle(style: TextStyle) {
    replaceSelection((value) => styleText(value, style));
  }

  function applyList(numbered: boolean) {
    replaceSelection((value) => prefixSelectedLines(value, numbered));
  }

  async function copyFormattedText() {
    await copyText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section
      id={id}
      className="scroll-mt-20 rounded border border-white/10 bg-panel/78 p-4 shadow-violet backdrop-blur-xl sm:p-5"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-goldSoft">
            LinkedIn formatter
          </p>
          <h2 className="mt-2 font-display text-2xl uppercase tracking-normal text-bone">
            Format Post Text
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Select text, apply LinkedIn-safe formatting, preview the post, then copy it.
          </p>
        </div>

        <div className="grid grid-cols-2 overflow-hidden rounded border border-white/10 bg-white/[0.03] sm:w-48">
          <button
            type="button"
            onClick={() => setPreviewMode("desktop")}
            className={clsx(
              "flex min-h-10 items-center justify-center gap-2 border-r border-white/10 px-3 text-xs font-semibold",
              previewMode === "desktop"
                ? "bg-gold/10 text-bone"
                : "text-muted hover:text-bone"
            )}
          >
            <Monitor size={15} />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode("mobile")}
            className={clsx(
              "flex min-h-10 items-center justify-center gap-2 px-3 text-xs font-semibold",
              previewMode === "mobile"
                ? "bg-gold/10 text-bone"
                : "text-muted hover:text-bone"
            )}
          >
            <Smartphone size={15} />
            Mobile
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="min-w-0">
          <div className="studio-scroll mb-3 flex gap-2 overflow-x-auto pb-1">
            <FormatterButton label="Bold" onClick={() => applyStyle("bold")}>
              <Bold size={16} />
            </FormatterButton>
            <FormatterButton label="Italic" onClick={() => applyStyle("italic")}>
              <Italic size={16} />
            </FormatterButton>
            <FormatterButton
              label="Bold Italic"
              onClick={() => applyStyle("boldItalic")}
            >
              <span className="text-xs font-black italic">BI</span>
            </FormatterButton>
            <FormatterButton label="Underline" onClick={() => applyStyle("underline")}>
              <Underline size={16} />
            </FormatterButton>
            <FormatterButton
              label="Strikethrough"
              onClick={() => applyStyle("strikethrough")}
            >
              <Strikethrough size={16} />
            </FormatterButton>
            <FormatterButton label="Bullets" onClick={() => applyList(false)}>
              <List size={16} />
            </FormatterButton>
            <FormatterButton label="Numbers" onClick={() => applyList(true)}>
              <ListOrdered size={16} />
            </FormatterButton>
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={12}
            className="studio-scroll min-h-80 w-full resize-none rounded border border-line bg-ink/70 p-4 text-base leading-7 text-bone outline-none transition placeholder:text-muted/60 focus:border-violet/70 focus:ring-2 focus:ring-violet/20"
            placeholder="Write or paste your LinkedIn post here."
          />

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto_auto]">
            <p className="col-span-2 self-center text-xs text-muted sm:col-span-1">
              {text.length.toLocaleString()} characters
            </p>
            <button
              type="button"
              onClick={() => setText("")}
              className="flex min-h-11 items-center justify-center gap-2 rounded border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-bone transition hover:border-violet/60"
            >
              <Eraser size={16} />
              Clear
            </button>
            <button
              type="button"
              onClick={copyFormattedText}
              className="flex min-h-11 items-center justify-center gap-2 rounded border border-violet/70 bg-violet px-4 text-sm font-semibold text-white shadow-violet transition hover:bg-violetDeep"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div
          className={clsx(
            "min-w-0 rounded border border-white/10 bg-ink/70 p-4",
            previewMode === "mobile" ? "mx-auto w-full max-w-sm" : "w-full"
          )}
        >
          <div className="rounded bg-[#f4f2ee] p-4 text-[#191919]">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#231832] text-sm font-bold text-[#e0bb58]">
                LN
              </div>
              <div className="min-w-0">
                <p className="font-semibold leading-5">Nadine Pierre</p>
                <p className="text-xs leading-4 text-[#666666]">
                  Leadership Communication | LeadWithNadine
                </p>
                <p className="text-xs leading-4 text-[#666666]">12h •</p>
              </div>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6">
              {text || "Your formatted LinkedIn post preview will appear here."}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-[#d6d3cc] pt-3 text-xs text-[#666666]">
              <span>Like</span>
              <span>Comment</span>
              <span>Share</span>
              <span>Send</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FormatterButton({
  label,
  onClick,
  children
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="grid h-10 w-10 shrink-0 place-items-center rounded border border-white/10 bg-white/[0.04] text-bone transition hover:border-violet/60"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function OutputCard({
  section,
  copied,
  onCopy
}: {
  section: GeneratedSection;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <article className="rounded border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-violet">
            {section.platform}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-bone">{section.title}</h3>
          <p className="mt-1 text-xs text-muted">{labelForContentType(section.type)}</p>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="flex min-h-10 shrink-0 items-center gap-2 rounded border border-white/10 bg-ink/70 px-3 text-xs font-semibold text-bone transition hover:border-violet/60"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {section.body ? (
        <p className="whitespace-pre-line text-[0.95rem] leading-7 text-bone/92">
          {section.body}
        </p>
      ) : null}

      {section.items.length ? (
        <ul className="mt-4 grid gap-2">
          {section.items.map((item) => (
            <li
              key={item}
              className="border-l-2 border-gold/70 bg-ink/42 py-2 pl-3 text-sm leading-6 text-muted"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {section.cta ? (
        <div className="mt-4 rounded border border-violet/40 bg-violet/10 p-3 text-sm leading-6 text-bone">
          {section.cta}
        </div>
      ) : null}
    </article>
  );
}

function LoadingCard() {
  return (
    <div className="rounded border border-violet/30 bg-violet/10 p-5">
      <div className="flex items-center gap-3">
        <Loader2 className="animate-spin text-goldSoft" size={20} />
        <div>
          <p className="font-semibold text-bone">Building the content set</p>
          <p className="mt-1 text-sm text-muted">
            Keeping it direct, credible, and calm.
          </p>
        </div>
      </div>
    </div>
  );
}

function HistoryPanel({
  store,
  current,
  renderTimestamps,
  isOpen,
  onClose,
  onLoadResult,
  onLoadDraft
}: {
  store: StudioStore;
  current: GenerationResult;
  renderTimestamps: boolean;
  isOpen: boolean;
  onClose: () => void;
  onLoadResult: (value: GenerationResult) => void;
  onLoadDraft: (value: Draft) => void;
}) {
  const recent = store.recent.length ? store.recent : [current];

  return (
    <>
      <button
        type="button"
        aria-label="Close history"
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-40 bg-black/60 transition lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        className={clsx(
          "fixed bottom-0 right-0 top-0 z-50 w-full max-w-md border-l border-white/10 bg-coal p-4 transition-transform duration-300 lg:static lg:z-auto lg:block lg:max-w-none lg:translate-x-0 lg:rounded lg:border lg:bg-white/[0.035] lg:p-4",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-goldSoft">
              History
            </p>
            <h2 className="mt-1 text-lg font-semibold text-bone">Recent work</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center border border-white/10 bg-white/[0.04] text-muted lg:hidden"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="studio-scroll max-h-[calc(100vh-7rem)] space-y-5 overflow-y-auto pr-1">
          <HistoryGroup
            title="Recent generations"
            empty="Generated work will appear here."
            items={recent}
            render={(item) => (
              <HistoryButton
                key={item.id}
                title={item.title}
                meta={
                  renderTimestamps
                    ? `${formatDate(item.createdAt)} · ${labelForTone(item.tone)}`
                    : labelForTone(item.tone)
                }
                onClick={() => onLoadResult(item)}
              />
            )}
          />

          <HistoryGroup
            title="Saved outputs"
            empty="Saved outputs will appear here."
            items={store.saved}
            render={(item) => (
              <HistoryButton
                key={item.id}
                title={item.title}
                meta={
                  renderTimestamps
                    ? `${formatDate(item.createdAt)} · ${item.sections.length} sections`
                    : `${item.sections.length} sections`
                }
                onClick={() => onLoadResult(item)}
              />
            )}
          />

          <HistoryGroup
            id="history-drafts"
            title="Drafts"
            empty="Drafts will appear here."
            items={store.drafts}
            render={(item) => (
              <HistoryButton
                key={item.id}
                title={item.title}
                meta={
                  renderTimestamps
                    ? `${formatDate(item.updatedAt)} · ${labelForTone(item.tone)}`
                    : labelForTone(item.tone)
                }
                onClick={() => onLoadDraft(item)}
              />
            )}
          />
        </div>
      </aside>
    </>
  );
}

function HistoryGroup<T>({
  id,
  title,
  empty,
  items,
  render
}: {
  id?: string;
  title: string;
  empty: string;
  items: T[];
  render: (item: T) => React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {title}
      </h3>
      <div className="grid gap-2">
        {items.length ? (
          items.map(render)
        ) : (
          <p className="rounded border border-white/10 bg-white/[0.03] p-3 text-sm text-muted">
            {empty}
          </p>
        )}
      </div>
    </section>
  );
}

function HistoryButton({
  title,
  meta,
  onClick
}: {
  title: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-16 w-full items-center justify-between gap-3 rounded border border-white/10 bg-ink/55 p-3 text-left transition hover:border-violet/60"
    >
      <span className="min-w-0">
        <span className="line-clamp-2 block text-sm font-semibold leading-5 text-bone">
          {title}
        </span>
        <span className="mt-1 block truncate text-xs text-muted">{meta}</span>
      </span>
      <ChevronRight className="shrink-0 text-goldSoft" size={17} />
    </button>
  );
}

function BottomActionBar({
  canGenerate,
  isPending,
  saved,
  onGenerate,
  onSave,
  onSaveDraft,
  onOpenHistory
}: {
  canGenerate: boolean;
  isPending: boolean;
  saved: boolean;
  onGenerate: () => void;
  onSave: () => void;
  onSaveDraft: () => void;
  onOpenHistory: () => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/92 px-3 py-3 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded border border-violet/70 bg-violet text-[0.68rem] font-semibold text-white disabled:border-white/10 disabled:bg-white/10 disabled:text-muted"
        >
          {isPending ? <Loader2 className="animate-spin" size={17} /> : <Sparkles size={17} />}
          Generate
        </button>
        <button
          type="button"
          onClick={onSave}
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded border border-white/10 bg-white/[0.04] text-[0.68rem] font-semibold text-bone"
        >
          {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
          Save
        </button>
        <button
          type="button"
          onClick={onSaveDraft}
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded border border-white/10 bg-white/[0.04] text-[0.68rem] font-semibold text-bone"
        >
          <Clipboard size={17} />
          Draft
        </button>
        <button
          type="button"
          onClick={onOpenHistory}
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded border border-white/10 bg-white/[0.04] text-[0.68rem] font-semibold text-bone"
        >
          <History size={17} />
          History
        </button>
      </div>
    </nav>
  );
}
