import { DocumentsHeader } from "../documents/_components/documents-header";
import { LibraryTabs } from "./_components/library-tabs";

export default function LibraryLayout({ children }: LayoutProps<"/library">) {
  return (
    <div className="flex h-full flex-col">
      <DocumentsHeader />
      <div className="flex h-12 shrink-0 items-center justify-center border-b border-border px-4 sm:px-6">
        <LibraryTabs />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
