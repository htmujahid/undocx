import { notFound } from "next/navigation";
import { getCurrentUser } from "~@/lib/auth/session";
import { findRuleSet } from "~@/lib/db/repository/rule-set";
import { RuleSetEditor } from "./rule-set-editor";

export async function RuleSetContent({ id }: { id: string }) {
  const set = await findRuleSet((await getCurrentUser()).id, id);
  if (!set) notFound();
  return (
    <RuleSetEditor
      key={set.id}
      set={{ id: set.id, name: set.name, description: set.description }}
      rules={set.rules.map((rule) => ({
        id: rule.id,
        kind: rule.kind,
        value: rule.value,
      }))}
    />
  );
}
