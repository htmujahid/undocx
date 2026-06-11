import type { Folder } from "@/lib/data/folders"

export interface FolderCallbacks {
  onToggle: (id: string) => void
  onSelect?: (folderId: string | null) => void
  onCreateSubfolder: (parentId: string | null) => void
  onCreateArtifact: (folderId: string) => void
  onEdit: (folder: Folder) => void
  onDelete: (folder: Folder) => void
}
