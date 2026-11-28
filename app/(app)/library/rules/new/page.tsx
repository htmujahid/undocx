import type { Metadata } from "next";
import { RuleSetCreateForm } from "../_components/rule-set-create-form";

export const metadata: Metadata = { title: "New rule set" };

export default function NewRuleSetPage() {
  return <RuleSetCreateForm />;
}
