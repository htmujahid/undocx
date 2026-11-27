import type { Metadata } from "next";
import { ProfileIcon } from "~@/components/ui/icons";
import { EmptyPane } from "../_components/empty-pane";

export const metadata: Metadata = {
  title: "Writer profiles",
  description:
    "Who you are, who you write for, and the facts Undocx should rely on.",
};

export default function ProfilesPage() {
  return (
    <EmptyPane icon={ProfileIcon} title="Writer profiles">
      Who you are, where you write from, who reads you and the facts to rely on.
      Pick one on a new document and Undocx stops asking what it already knows.
    </EmptyPane>
  );
}
