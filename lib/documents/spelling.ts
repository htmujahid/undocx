export type SpellingVariant = "american" | "british" | "canadian" | "australian";

type Pair = { us: string; uk: string; family: "ize" | "other" };

const iseWords = ["organize", "recognize", "realize", "optimize", "prioritize", "customize", "summarize", "finalize", "emphasize", "apologize", "authorize", "capitalize", "specialize", "utilize", "standardize", "categorize", "centralize", "digitize", "modernize", "personalize", "visualize", "minimize", "maximize", "memorize", "criticize", "mobilize", "normalize", "legalize", "localize", "monetize", "harmonize", "synchronize", "itemize", "sanitize", "stabilize", "penalize", "publicize", "generalize", "familiarize", "characterize", "commercialize", "computerize", "industrialize", "revolutionize", "subsidize"];
const iseSuffixes = ["ize", "izes", "ized", "izing", "ization", "izations", "izer", "izers"];

const yzeWords = ["analyze", "paralyze"];
const yzeSuffixes = ["yze", "yzes", "yzed", "yzing", "yzer", "yzers"];

const ourWords = ["color", "favor", "behavior", "honor", "labor", "neighbor", "flavor", "humor", "rumor", "harbor", "endeavor", "vapor", "savior", "armor", "odor", "parlor", "clamor"];
const ourSuffixes = ["", "s", "ed", "ing", "ful", "less", "able", "ably", "ite", "ites"];

const reWords = ["center", "theater", "fiber", "liter", "caliber", "somber", "specter", "meager"];
const reSuffixes = ["", "s", "ed", "ing"];

const llWords = ["travel", "cancel", "label", "model", "signal", "fuel", "total", "level", "counsel", "marvel", "tunnel", "channel", "quarrel", "shovel"];
const llSuffixes = ["ed", "ing", "er", "ers"];

const explicit: [string, string][] = [
  ["gray", "grey"], ["catalog", "catalogue"], ["catalogs", "catalogues"], ["dialog", "dialogue"], ["dialogs", "dialogues"], ["defense", "defence"], ["offense", "offence"], ["pretense", "pretence"],
  ["aluminum", "aluminium"], ["jewelry", "jewellery"], ["pajamas", "pyjamas"], ["mold", "mould"], ["molds", "moulds"], ["molded", "moulded"], ["molding", "moulding"], ["plow", "plough"],
  ["skeptic", "sceptic"], ["skeptics", "sceptics"], ["skeptical", "sceptical"], ["skepticism", "scepticism"], ["enroll", "enrol"], ["fulfill", "fulfil"], ["fulfills", "fulfils"],
  ["installment", "instalment"], ["installments", "instalments"], ["acknowledgment", "acknowledgement"], ["acknowledgments", "acknowledgements"], ["aging", "ageing"],
  ["cozy", "cosy"], ["sulfur", "sulphur"], ["mustache", "moustache"], ["maneuver", "manoeuvre"], ["maneuvers", "manoeuvres"], ["analog", "analogue"],
];

function pairs(): Pair[] {
  const list: Pair[] = [];
  for (const word of iseWords) for (const suffix of iseSuffixes) list.push({ us: word.slice(0, -3) + suffix, uk: word.slice(0, -3) + suffix.replace("iz", "is"), family: "ize" });
  for (const word of yzeWords) for (const suffix of yzeSuffixes) list.push({ us: word.slice(0, -3) + suffix, uk: word.slice(0, -3) + suffix.replace("yz", "ys"), family: "ize" });
  for (const word of ourWords) for (const suffix of ourSuffixes) {
    if (suffix === "ite" || suffix === "ites") {
      if (word !== "favor") continue;
      list.push({ us: `${word}${suffix}`, uk: `favour${suffix}`, family: "other" });
      continue;
    }
    list.push({ us: word + suffix, uk: word.replace(/or$/, "our") + suffix, family: "other" });
  }
  for (const word of reWords) {
    const stem = word.replace(/er$/, "re");
    for (const suffix of reSuffixes) {
      const uk = suffix === "ed" ? `${stem}d` : suffix === "ing" ? `${stem.slice(0, -1)}ing` : stem + suffix;
      list.push({ us: word + suffix, uk, family: "other" });
    }
  }
  for (const word of llWords) for (const suffix of llSuffixes) list.push({ us: word + suffix, uk: word + "l" + suffix, family: "other" });
  for (const [us, uk] of explicit) list.push({ us, uk, family: "other" });
  return list;
}

const all = pairs();
const cache = new Map<SpellingVariant, { map: Map<string, string>; pattern: RegExp }>();

function tableFor(variant: SpellingVariant) {
  const cached = cache.get(variant);
  if (cached) return cached;
  const map = new Map<string, string>();
  for (const pair of all) {
    if (variant === "american") map.set(pair.uk, pair.us);
    else if (variant === "canadian" && pair.family === "ize") continue;
    else map.set(pair.us, pair.uk);
  }
  const keys = [...map.keys()].sort((a, b) => b.length - a.length);
  const built = { map, pattern: new RegExp(`(?<![\\p{L}\\p{N}])(?:${keys.join("|")})(?![\\p{L}\\p{N}])`, "giu") };
  cache.set(variant, built);
  return built;
}

function matchCase(original: string, replacement: string) {
  if (original === original.toUpperCase() && original.length > 1) return replacement.toUpperCase();
  if (original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()) return replacement[0].toUpperCase() + replacement.slice(1);
  return replacement;
}

export type TextIssue = { start: number; end: number; text: string; replacement: string | null };

export function findSpelling(text: string, variant: SpellingVariant): TextIssue[] {
  const { map, pattern } = tableFor(variant);
  const issues: TextIssue[] = [];
  for (const match of text.matchAll(pattern)) {
    const replacement = map.get(match[0].toLowerCase());
    if (replacement) issues.push({ start: match.index, end: match.index + match[0].length, text: match[0], replacement: matchCase(match[0], replacement) });
  }
  return issues;
}

export function findBanned(text: string, words: string[]): TextIssue[] {
  const terms = words.map((word) => word.trim()).filter(Boolean);
  if (terms.length === 0) return [];
  const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(?:${escaped.join("|")})(?![\\p{L}\\p{N}])`, "giu");
  return [...text.matchAll(pattern)].map((match) => ({ start: match.index, end: match.index + match[0].length, text: match[0], replacement: null }));
}
