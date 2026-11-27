import "server-only";

import { findProfile } from "~@/lib/db/repository/profile";
import { listDocumentSources } from "~@/lib/db/repository/source";
import { findRuleSet } from "~@/lib/db/repository/rule-set";
import { findVoice } from "~@/lib/db/repository/voice";

export async function loadContext(userId: string, picks: { id: string; profileId: string | null; voiceId: string | null; ruleSetId: string | null }) {
  const [profile, voice, ruleSet, sources] = await Promise.all([
    picks.profileId ? findProfile(userId, picks.profileId) : null,
    picks.voiceId ? findVoice(userId, picks.voiceId) : null,
    picks.ruleSetId ? findRuleSet(userId, picks.ruleSetId) : null,
    listDocumentSources(userId, picks.id, true),
  ]);
  return { profile, voice, ruleSet, sources };
}
