import "server-only";

import { getEntitlement } from "~@/lib/db/repository/billing";
import { findProfile } from "~@/lib/db/repository/profile";
import { listDocumentSources } from "~@/lib/db/repository/source";
import { findRuleSet } from "~@/lib/db/repository/rule-set";
import { findVoice } from "~@/lib/db/repository/voice";

export async function loadContext(userId: string, picks: { id: string; profileId: string | null; voiceId: string | null; ruleSetId: string | null }) {
  const [{ limits }, profile, voice, ruleSet, allSources] = await Promise.all([
    getEntitlement(userId),
    picks.profileId ? findProfile(userId, picks.profileId) : null,
    picks.voiceId ? findVoice(userId, picks.voiceId) : null,
    picks.ruleSetId ? findRuleSet(userId, picks.ruleSetId) : null,
    listDocumentSources(userId, picks.id, true),
  ]);
  let budget = limits.sourceChars;
  const sources = allSources.map((item) => {
    const content = item.content.slice(0, Math.max(budget, 0));
    budget -= content.length;
    return { ...item, content };
  });
  return { profile, voice, ruleSet, sources };
}
