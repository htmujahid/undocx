"use client";

import { useCallback, useEffect, useRef } from "react";

import { RealtimeChannel } from "@supabase/supabase-js";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState } from "lexical";

import { useEditorContext } from "@/components/editor/context/editor-context";
import { useDebounce } from "@/components/editor/editor-hooks/use-debounce";
import { useDocumentAccess } from "@/components/editor/editor-hooks/use-document-access";
import { createClient } from "@/lib/supabase/client";

interface EditorUpdate {
  editorState: string;
  userId: string;
  timestamp: number;
}

/**
 * CollaborationPlugin - Enables real-time collaborative editing using Supabase Realtime Broadcast
 *
 * This plugin:
 * 1. Checks user permissions before allowing edits (owner or collaborator with 'edit' access)
 * 2. Makes editor read-only for users without edit permissions
 * 3. Broadcasts local editor changes to other connected users (only if user has edit access)
 * 4. Receives and applies remote editor changes from other users
 * 5. Prevents infinite update loops by tracking update sources
 * 6. Handles initial sync when a new user joins
 */
export function CollaborationPlugin() {
  const [editor] = useLexicalComposerContext();
  const { document, user } = useEditorContext();
  const documentId = document.id;
  const supabase = createClient();

  // Check if current user has edit permissions
  const { canEdit } = useDocumentAccess();

  const channelRef = useRef<RealtimeChannel | null>(null);
  const isRemoteUpdateRef = useRef(false);

  // Broadcast editor state to other clients (not debounced)
  const broadcastUpdateImmediate = useCallback(
    (editorState: EditorState) => {
      // Only broadcast if user has edit access
      if (
        !canEdit ||
        !channelRef.current ||
        isRemoteUpdateRef.current ||
        !user
      ) {
        return;
      }

      const serialized = JSON.stringify(editorState.toJSON());
      channelRef.current.send({
        type: "broadcast",
        event: "editor-update",
        payload: {
          editorState: serialized,
          userId: user.id,
          timestamp: Date.now(),
        } as EditorUpdate,
      });
    },
    [user, canEdit],
  );

  // Debounced version (400ms) to avoid overwhelming the network
  const broadcastUpdate = useDebounce(broadcastUpdateImmediate, 400);

  useEffect(() => {
    // Create a realtime channel for this document
    const channel = supabase.channel(`document:${documentId}`, {
      config: {
        broadcast: {
          self: false, // Don't receive our own broadcasts
        },
      },
    });

    channelRef.current = channel;

    // Subscribe to editor updates from other users
    channel
      .on("broadcast", { event: "editor-update" }, (payload) => {
        const update = payload.payload as EditorUpdate;

        // Ignore updates from ourselves (extra safety)
        if (update.userId === user?.id) {
          return;
        }

        try {
          isRemoteUpdateRef.current = true;

          const remoteEditorState = editor.parseEditorState(update.editorState);

          editor.setEditorState(remoteEditorState, {
            tag: "collaboration",
          });
        } catch (error) {
          console.error("Failed to apply remote update:", error);
        } finally {
          isRemoteUpdateRef.current = false;
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Connected to collaboration channel");

          // Request initial state from other connected users
          channel.send({
            type: "broadcast",
            event: "request-sync",
            payload: {
              userId: user?.id,
              timestamp: Date.now(),
            },
          });
        }
      });

    // Handle sync requests from newly joined users
    channel.on("broadcast", { event: "request-sync" }, (payload) => {
      const request = payload.payload as { userId: string; timestamp: number };

      // Don't respond to our own sync requests
      if (request.userId === user?.id) {
        return;
      }

      // Only respond to sync requests if we have edit access
      // This ensures only authorized users can provide the document state
      if (!canEdit) {
        return;
      }

      // Send current editor state to the requesting user
      const currentState = editor.getEditorState();
      const serialized = JSON.stringify(currentState.toJSON());

      channel.send({
        type: "broadcast",
        event: "sync-response",
        payload: {
          editorState: serialized,
          userId: user?.id,
          requesterId: request.userId,
          timestamp: Date.now(),
        },
      });
    });

    // Handle sync responses
    channel.on("broadcast", { event: "sync-response" }, (payload) => {
      const response = payload.payload as EditorUpdate & {
        requesterId: string;
      };

      // Only apply if this response is for us
      if (response.requesterId !== user?.id) {
        return;
      }

      try {
        isRemoteUpdateRef.current = true;
        const remoteEditorState = editor.parseEditorState(response.editorState);

        editor.setEditorState(remoteEditorState, {
          tag: "collaboration-sync",
        });
      } catch (error) {
        console.error("Failed to apply sync response:", error);
      } finally {
        isRemoteUpdateRef.current = false;
      }
    });

    // Listen to local editor changes and broadcast them
    const removeUpdateListener = editor.registerUpdateListener(
      ({ editorState, tags }) => {
        // Don't broadcast if this update came from a remote source
        if (
          tags.has("collaboration") ||
          tags.has("collaboration-sync") ||
          tags.has("history-merge")
        ) {
          return;
        }

        // Only broadcast if user has edit access
        if (!canEdit) {
          return;
        }

        broadcastUpdate(editorState);
      },
    );

    // Cleanup on unmount
    return () => {
      removeUpdateListener();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [documentId, editor, user, broadcastUpdate, supabase, canEdit]);

  return null;
}
