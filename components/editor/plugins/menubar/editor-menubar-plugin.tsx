"use client";

import Link from "next/link";

import { useEditorContext } from "@/components/editor/context/editor-context";
import { Button } from "@/components/ui/button";

import { AppMenuPlugin } from "./app-menu-plugin";
import { DocumentModePlugin } from "./document-mode-plugin";
import { DocumentTitlePlugin } from "./document-title-plugin";
import { PresencePlugin } from "./presence-plugin";
import { SaveStatusPlugin } from "./save-status-plugin";
import { ShareDocumentPlugin } from "./share-document-plugin";
import { ThemeTogglePlugin } from "./theme-toggle-plugin";
import { UserMenuPlugin } from "./user-menu-plugin";

/**
 * EditorMenubarPlugin - Main menubar component for the Lexical editor
 *
 * A composition of standalone modular plugins:
 * - AppMenuPlugin: Hamburger menu with app-level actions
 * - DocumentTitlePlugin: Editable document title
 * - SaveStatusPlugin: Shows document save status (saving/saved)
 * - PresencePlugin: Shows active users editing the document
 * - DocumentModePlugin: Switch between editing/viewing/commenting modes
 * - ShareDocumentPlugin: Share document with permission controls
 * - ThemeTogglePlugin: Dark/light theme switcher
 * - UserMenuPlugin: User avatar and user menu
 *
 * Each plugin is completely self-contained and manages its own state.
 */
export function EditorMenubarPlugin() {
  const { user, document } = useEditorContext();
  return (
    <div className="flex h-12 w-full items-center justify-between gap-3 border-b px-2">
      {/* Left Section: App Menu + Document Title */}
      <div className="flex items-center gap-2">
        {user && <AppMenuPlugin />}
        <DocumentTitlePlugin />
      </div>

      {/* Right Section: Save Status + Active Users + Mode Switcher + Share + Theme Toggle + User Menu */}
      <div className="flex items-center gap-2">
        {user && <SaveStatusPlugin />}
        {user && <PresencePlugin />}
        <DocumentModePlugin />
        {user && <ShareDocumentPlugin />}
        <ThemeTogglePlugin />
        {user && <UserMenuPlugin />}
        {!user && (
          <Button variant="default" size="sm" asChild>
            <Link href={`/auth/login?redirect=/editor/${document?.id}`}>
              Login
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
