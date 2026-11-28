"use client";

import { Tabs, TabsList, TabsPanel, TabsTab } from "~@/components/ui/tabs";
import type { CreatedSource } from "~@/lib/sources/actions";
import { cn } from "~@/lib/utils";
import { LibraryPanel } from "./library-source-panel";
import { LinkPanel } from "./link-source-panel";
import { TextPanel } from "./text-source-panel";
import { UploadPanel } from "./upload-source-panel";

export function AddSourcePanels({ documentId, onAdded, className }: { documentId?: string; onAdded: (source: CreatedSource) => void; className?: string }) {
  const hasLibrary = Boolean(documentId);
  return (
    <Tabs defaultValue={hasLibrary ? "library" : "upload"} className={cn("grid gap-4", className)}>
      <TabsList aria-label="Source type">
        {hasLibrary ? <TabsTab value="library">Library</TabsTab> : null}
        <TabsTab value="upload">Upload</TabsTab>
        <TabsTab value="text">Paste text</TabsTab>
        <TabsTab value="link">Link</TabsTab>
      </TabsList>
      {hasLibrary && documentId ? (
        <TabsPanel value="library">
          <LibraryPanel documentId={documentId} onAdded={onAdded} />
        </TabsPanel>
      ) : null}
      <TabsPanel value="upload">
        <UploadPanel documentId={documentId} onAdded={onAdded} />
      </TabsPanel>
      <TabsPanel value="text">
        <TextPanel documentId={documentId} onAdded={onAdded} />
      </TabsPanel>
      <TabsPanel value="link">
        <LinkPanel documentId={documentId} onAdded={onAdded} />
      </TabsPanel>
    </Tabs>
  );
}
