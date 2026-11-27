import type { findProfile } from "~@/lib/db/repository/profile";
import type { findRuleSet } from "~@/lib/db/repository/rule-set";
import type { findVoice } from "~@/lib/db/repository/voice";

type Profile = NonNullable<Awaited<ReturnType<typeof findProfile>>>;
type Voice = NonNullable<Awaited<ReturnType<typeof findVoice>>>;
type RuleSet = NonNullable<Awaited<ReturnType<typeof findRuleSet>>>;

import type { BriefAnswers, BriefQuestion, OutlineMode } from "~@/lib/documents/brief";
import { documentLimits } from "~@/lib/documents/limits";
import { documentTypes, findDocumentType } from "~@/lib/documents/types";

const limits = { document: 40_000, sample: 1_500, samples: 3, source: 6_000, sources: 40_000 } as const;

type Source = { id: string; kind: string; title: string; url: string | null; content: string };

function fields(entries: [string, string | null | undefined][]) {
  return entries
    .filter(([, value]) => value && value.trim())
    .map(([label, value]) => `- ${label}: ${value!.trim()}`)
    .join("\n");
}

function profileSection(profile: Profile) {
  const body = fields([
    ["Name of this profile", profile.name],
    ["Role", profile.role],
    ["Organisation", profile.organization],
    ["Industry", profile.industry],
    ["About the writer", profile.about],
    ["Region", profile.region],
    ["First language", profile.firstLanguage],
    ["Writes in", profile.writingLanguage],
    ["Currency", profile.currency],
    ["Units", profile.units],
    ["Date format", profile.dateFormat],
    ["Audience", profile.audience],
    ["Audience familiarity", profile.audienceLevel],
    ["Facts to treat as true", profile.facts],
    ["Sign-off", profile.signoff],
    ["Contact details", profile.contact],
  ]);
  return body ? `## Who is writing\n${body}` : "";
}

function voiceSection(voice: Voice) {
  const samples = voice.samples.filter((sample) => sample.isIncluded).slice(0, limits.samples);
  const parts = [`## Voice: ${voice.name}`, "Match the style of these samples. They show style only; never take facts from them."];
  if (voice.notes.trim()) parts.push(`Notes: ${voice.notes.trim()}`);
  for (const sample of samples) parts.push(`<sample title="${sample.title}">\n${sample.content.slice(0, limits.sample)}\n</sample>`);
  return parts.join("\n\n");
}

function rulesSection(set: RuleSet) {
  const of = (kind: string) => set.rules.filter((rule) => rule.kind === kind).map((rule) => rule.value);
  const lines: string[] = [];
  const spelling = of("spelling")[0];
  if (spelling) lines.push(`- Use ${spelling} spelling.`);
  const banned = of("banned_word");
  if (banned.length > 0) lines.push(`- Never use these words or phrases: ${banned.join(", ")}.`);
  for (const format of of("format")) lines.push(`- Format: ${format}`);
  for (const custom of of("custom")) lines.push(`- ${custom}`);
  return lines.length > 0 ? `## Rules to follow\n${lines.join("\n")}` : "";
}

type Context = { profile: Profile | null; voice: Voice | null; ruleSet: RuleSet | null; sources: Source[] };

function sourcesSection(sources: Source[]) {
  if (sources.length === 0) return "";
  let budget = limits.sources;
  const blocks = sources.map((item) => {
    const text = item.kind === "link" ? "(a link; its content was not read)" : item.content.slice(0, Math.min(limits.source, Math.max(budget, 0)));
    budget -= text.length;
    const url = item.url ? ` url="${item.url}"` : "";
    return `<source id="${item.id}" title="${item.title}"${url}>\n${text}\n</source>`;
  });
  return ["## Sources the writer attached", "Treat these as evidence. Do not state facts they do not support. Refer to a source by its title, and cite it by its id when asked.", ...blocks].join("\n\n");
}

function contextSections({ profile, voice, ruleSet, sources }: Context) {
  return [profile ? profileSection(profile) : "", voice ? voiceSection(voice) : "", ruleSet ? rulesSection(ruleSet) : "", sourcesSection(sources)].filter(Boolean);
}

export function assistantInstructions({ documentText, ...context }: Context & { documentText: string }) {
  const sections = [
    "You are Undocx, a writing assistant inside a document editor. You help one person plan, write and improve the document they are working on.",
    "Be direct and concrete. Answer in plain text without markdown headings. Keep answers short unless asked for more.",
    "You can read the document but you cannot edit it yet. When you suggest wording, give the exact text so the writer can paste it.",
    "Never invent facts, numbers, quotes or sources. If something is missing, say what is missing and ask for it.",
    ...contextSections(context),
    documentText.trim() ? `## The document so far\n<document>\n${documentText.slice(0, limits.document)}\n</document>` : "## The document so far\nThe document is empty.",
  ];
  return sections.filter(Boolean).join("\n\n");
}

export function questionsInstructions(context: Context & { typeKey: string | null }) {
  const known = documentTypes.map((type) => `${type.key} (${type.label}: ${type.extra})`).join("; ");
  const chosen = findDocumentType(context.typeKey);
  return [
    "You are Undocx. A writer is starting a new document and has described it in a short brief.",
    `Decide what you still need to know to write a good first draft, then ask at most ${documentLimits.questions} short questions. Ask fewer when the brief is already clear.`,
    "Each question must be answerable in one line. Give 2 to 4 short, concrete choices that fit the document. Give each question a short lowercase id.",
    "Never ask something the brief, the profile, the voice or the rules already answer. Never ask about spelling or tone when a voice or rules are given, and never ask for facts the attached sources already contain. Ask about things only this document needs, such as price, dates, length, the reader's decision.",
    chosen ? `The writer chose the type ${chosen.key}. Ask what a ${chosen.label} needs: ${chosen.extra}.` : `The writer did not choose a type. Infer it from the brief. Known types: ${known}. Use "other" when none fits.`,
    "Also say whether an outline would help this document. Recommend one for long or structured documents, and not for short letters or emails. Give the reason in one sentence.",
    ...contextSections(context),
  ].join("\n\n");
}

export function draftInstructions({ outline, advice, typeKey, ...context }: Context & { outline: OutlineMode; advice: boolean | null; typeKey: string | null }) {
  const chosen = findDocumentType(typeKey);
  const useOutline = outline === "on" || (outline === "auto" && advice !== false);
  return [
    "You are Undocx. Write the first draft of the document the writer describes, ready for them to edit.",
    chosen ? `It is a ${chosen.label}. A typical structure is: ${chosen.outline.join(", ")}. Adapt it to this document.` : "",
    useOutline ? "Give it a clear structure: one title, then sections with short headings." : "Write it as flowing text with few or no headings. A title is still required.",
    "Start with the title as the first block. Use only facts that appear in the brief, the answers, the profile or the rules. When a needed fact is missing, write a clear placeholder in square brackets, such as [price] or [date]. Never invent numbers, names, quotes or sources.",
    "Write plain text in each block, with no markdown symbols. Use lists and tables only when they help the reader.",
    context.sources.length > 0 ? "When a paragraph rests on an attached source, put that source's id in the paragraph's cites list. Cite only ids that appear in the sources. Leave cites empty otherwise." : "Leave every cites list empty.",
    "Also write a short note to the writer: one or two sentences on what you assumed and what they still need to fill in.",
    ...contextSections(context),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function briefMessage({ prompt, questions, answers }: { prompt: string; questions: BriefQuestion[]; answers: BriefAnswers }) {
  const answered = questions.filter((question) => answers[question.id]).map((question) => `- ${question.question} ${answers[question.id]}`);
  return [`Brief: ${prompt}`, answered.length > 0 ? `Answers:\n${answered.join("\n")}` : ""].filter(Boolean).join("\n\n");
}
