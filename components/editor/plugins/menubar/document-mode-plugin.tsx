"use client";

import { useEffect } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ChevronDown, Eye, MessageSquare, Pencil } from "lucide-react";

import {
  DocumentMode,
  useEditorContext,
} from "@/components/editor/context/editor-context";
import { useDocumentAccess } from "@/components/editor/editor-hooks/use-document-access";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

const modeConfig = {
  editing: {
    label: "Editing",
    icon: Pencil,
    description: "Make changes to the document",
  },
  viewing: {
    label: "Viewing",
    icon: Eye,
    description: "View the document without editing",
  },
  commenting: {
    label: "Commenting",
    icon: MessageSquare,
    description: "Add comments to the document",
  },
} as const;

export function DocumentModePlugin() {
  const [editor] = useLexicalComposerContext();
  const { documentMode, setDocumentMode } = useEditorContext();

  // Get user's access permissions using the reusable hook
  const { canEdit, canComment, canView } = useDocumentAccess();

  const currentMode = modeConfig[documentMode];
  const ModeIcon = currentMode.icon;

  function isModeAvailable(mode: DocumentMode) {
    if (mode === "editing") {
      return canEdit;
    }

    if (mode === "commenting") {
      return canComment;
    }

    if (mode === "viewing") {
      return canView;
    }

    return false;
  }

  useEffect(() => {
    // Set initial mode based on highest available permission
    if (canEdit) {
      setDocumentMode("editing");
    } else if (canComment) {
      setDocumentMode("commenting");
    } else if (canView) {
      setDocumentMode("viewing");
    } else {
      setDocumentMode("viewing"); // Default to viewing if no permissions
    }
  }, [canEdit, canComment, canView, setDocumentMode]);

  useEffect(() => {
    // Update editor's editable state when documentMode changes
    editor.setEditable(documentMode === "editing");
  }, [editor, documentMode]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ModeIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentMode.label}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px] [--radius:0.65rem]">
        {(
          Object.entries(modeConfig) as Array<
            [DocumentMode, (typeof modeConfig)[DocumentMode]]
          >
        ).map(([mode, config]) => {
          const Icon = config.icon;
          return (
            <DropdownMenuItem
              key={mode}
              onClick={() => {
                // Only editing mode allows full editing
                editor.setEditable(mode === "editing");
                setDocumentMode(mode);
              }}
              disabled={!isModeAvailable(mode)}
              className="cursor-pointer p-0"
            >
              <Item size="sm" className="w-full p-2">
                <ItemMedia>
                  <Icon className="h-4 w-4" />
                </ItemMedia>
                <ItemContent className="gap-0.5">
                  <ItemTitle>{config.label}</ItemTitle>
                  <ItemDescription>{config.description}</ItemDescription>
                </ItemContent>
                {documentMode === mode && (
                  <span className="text-primary ml-auto">✓</span>
                )}
              </Item>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
