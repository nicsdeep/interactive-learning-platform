import type { DesignReferenceProvider, DesignTargetSurface } from "@/lib/admin-workspace";

const PROVIDERS = ["pinterest", "behance", "dribbble", "awwwards", "manual", "other"] as const;
const TARGETS = ["home", "dashboard", "mobile", "admin", "component", "other"] as const;

const providerNames: Record<DesignReferenceProvider, string> = {
  pinterest: "Pinterest",
  behance: "Behance",
  dribbble: "Dribbble",
  awwwards: "Awwwards",
  manual: "Your reference library",
  other: "External reference",
};

const targetPhrases: Record<DesignTargetSurface, string> = {
  home: "international learning homepage",
  dashboard: "learning dashboard",
  mobile: "mobile learning app",
  admin: "editorial admin workspace",
  component: "learning interface component",
  other: "digital learning interface",
};

const targetLabels: Record<DesignTargetSurface, string> = {
  home: "home page",
  dashboard: "dashboard",
  mobile: "mobile experience",
  admin: "administration workspace",
  component: "component",
  other: "interface",
};

const signalTags: Array<{ pattern: RegExp; tags: string[]; focus: string }> = [
  { pattern: /mobile|phone|touch|small screen/i, tags: ["mobile", "touch-targets", "responsive"], focus: "mobile hierarchy and touch targets" },
  { pattern: /dashboard|data|analytics|progress/i, tags: ["dashboard", "information-hierarchy", "progress"], focus: "clear information hierarchy" },
  { pattern: /navigation|menu|header|footer/i, tags: ["navigation", "wayfinding", "responsive"], focus: "clear wayfinding at every breakpoint" },
  { pattern: /learning|education|school|student|curriculum/i, tags: ["learning", "curriculum", "human-centered"], focus: "an encouraging learning context" },
  { pattern: /serif|editorial|typography|type/i, tags: ["editorial", "typography", "readability"], focus: "editorial type hierarchy and reading comfort" },
  { pattern: /global|international|country|region/i, tags: ["international", "regional-context", "inclusive"], focus: "international clarity without flattening local context" },
  { pattern: /dark|contrast|accessible|accessibility/i, tags: ["accessibility", "contrast", "inclusive"], focus: "legible contrast and inclusive interaction" },
];

const stopWords = new Set(["a", "an", "and", "as", "at", "be", "by", "for", "from", "in", "is", "it", "of", "on", "or", "that", "the", "to", "with", "want", "need", "make", "design", "create"]);

export type DesignStudioProposal = {
  source: "rules";
  version: "design-studio-rules-v1";
  searchQuery: string;
  sourceSearchUrl: string | null;
  title: string;
  purpose: string;
  tags: string[];
  notes: string;
  rationale: string;
  safetyNotes: string[];
};

export type DesignStudioResult =
  | { ok: true; proposal: DesignStudioProposal }
  | { ok: false; error: string };

function asProvider(value: unknown): DesignReferenceProvider | undefined {
  return typeof value === "string" && (PROVIDERS as readonly string[]).includes(value)
    ? value as DesignReferenceProvider
    : undefined;
}

function asTarget(value: unknown): DesignTargetSurface | undefined {
  return typeof value === "string" && (TARGETS as readonly string[]).includes(value)
    ? value as DesignTargetSurface
    : undefined;
}

function normalizeBrief(value: unknown) {
  if (typeof value !== "string") return undefined;
  const brief = value.replace(/\s+/g, " ").trim();
  return brief.length >= 8 && brief.length <= 1_200 ? brief : undefined;
}

function wordsFrom(brief: string) {
  return brief
    .toLocaleLowerCase("en-US")
    .match(/[a-z0-9][a-z0-9-]*/g)
    ?.filter((word) => word.length > 2 && !stopWords.has(word))
    .slice(0, 9) ?? [];
}

function titlePhrase(brief: string) {
  const compact = brief.replace(/[.!?].*$/, "").trim();
  return compact.length <= 68 ? compact : `${compact.slice(0, 65).trimEnd()}…`;
}

function uniqueTags(tags: string[]) {
  return [...new Set(tags.map((tag) => tag.toLocaleLowerCase("en-US")))].slice(0, 10);
}

function sourceSearchUrl(provider: DesignReferenceProvider, query: string) {
  const encoded = encodeURIComponent(query);
  switch (provider) {
    case "pinterest": return `https://www.pinterest.com/search/pins/?q=${encoded}`;
    case "behance": return `https://www.behance.net/search/projects?search=${encoded}`;
    case "dribbble": return `https://dribbble.com/search?q=${encoded}`;
    case "awwwards": return `https://www.awwwards.com/websites/`;
    default: return null;
  }
}

/**
 * This is an intentionally deterministic design-brief assistant. It works
 * only from an administrator's own brief and product design tokens; it never
 * fetches, copies, or analyses third-party artwork. A future approved model
 * provider can replace this adapter without changing the review workflow.
 */
export function createDesignStudioProposal(input: { provider?: unknown; brief?: unknown; targetSurface?: unknown }): DesignStudioResult {
  const provider = asProvider(input.provider);
  const targetSurface = asTarget(input.targetSurface);
  const brief = normalizeBrief(input.brief);
  if (!provider || !targetSurface || !brief) {
    return { ok: false, error: "Describe the direction in at least a few words so the studio assistant can prepare a useful brief." };
  }

  const matchingSignals = signalTags.filter((signal) => signal.pattern.test(brief));
  const focus = matchingSignals[0]?.focus ?? "a clear, confident learning experience";
  const tags = uniqueTags([
    targetSurface,
    "trussline",
    "editorial",
    "responsive",
    ...matchingSignals.flatMap((signal) => signal.tags),
    ...wordsFrom(brief).slice(0, 4),
  ]);
  const searchQuery = `${targetPhrases[targetSurface]} ${wordsFrom(brief).slice(0, 7).join(" ")}`.trim().slice(0, 180);
  const sourceName = providerNames[provider];

  return {
    ok: true,
    proposal: {
      source: "rules",
      version: "design-studio-rules-v1",
      searchQuery,
      sourceSearchUrl: sourceSearchUrl(provider, searchQuery),
      title: `${sourceName} direction · ${titlePhrase(brief)}`,
      purpose: `Study ${focus} for this ${targetLabels[targetSurface]}, then translate the principle into Trussline’s warm, editorial system.`,
      tags,
      notes: `Brief: ${brief}\n\nUse this as a direction, not a template. Keep the final Trussline work responsive, accessible, and recognisably its own.`,
      rationale: `This brief prioritises ${focus} and keeps the search focused on the selected ${targetLabels[targetSurface]}.`,
      safetyNotes: [
        "Save the original link you chose; do not copy source artwork or wording.",
        "Check the idea at phone width before using it in a page or component.",
        "Keep text contrast, reading comfort, and clear keyboard focus in the final design.",
      ],
    },
  };
}
