import type { Metadata } from "next";
import { FilesIcon } from "~@/components/ui/icons";
import { EmptyPane } from "../_components/empty-pane";

export const metadata: Metadata = {
  title: "Sources",
  description: "Files, text and links Undocx can read and cite.",
};

export default function SourcesPage() {
  return (
    <EmptyPane icon={FilesIcon} title="Sources">
      Files, pasted text and links you can attach to any document. Undocx reads them, writes from them and cites them. Free keeps 10 sources, Pro keeps 100.
    </EmptyPane>
  );
}
