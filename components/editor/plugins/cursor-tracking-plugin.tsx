"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { RealtimeChannel } from "@supabase/supabase-js";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  LexicalNode,
  SELECTION_CHANGE_COMMAND,
  TextNode,
} from "lexical";

import { useEditorContext } from "@/components/editor/context/editor-context";
import { useDebounce } from "@/components/editor/editor-hooks/use-debounce";
import { useDocumentAccess } from "@/components/editor/editor-hooks/use-document-access";
import { getUserColor } from "@/components/editor/utils/user-colors";
import { createClient } from "@/lib/supabase/client";

interface CursorPosition {
  offset: number;
  user_id: string;
  user_name: string;
  color: string;
  timestamp: number;
}

interface RenderedCursor {
  x: number;
  y: number;
  user_id: string;
  user_name: string;
  color: string;
}

/**
 * Recursively get all text nodes from a Lexical node
 */
function getAllTextNodes(node: LexicalNode): TextNode[] {
  const textNodes: TextNode[] = [];

  if ($isTextNode(node)) {
    textNodes.push(node);
  } else if ($isElementNode(node)) {
    const children = node.getChildren();
    for (const child of children) {
      textNodes.push(...getAllTextNodes(child));
    }
  }

  return textNodes;
}

/**
 * CursorTrackingPlugin - Tracks and displays cursor positions using global offset
 *
 * Only broadcasts cursor position if user has edit access.
 * Always receives and displays remote cursors regardless of access level.
 */
export function CursorTrackingPlugin() {
  const [editor] = useLexicalComposerContext();
  const { document: doc, user } = useEditorContext();
  const documentId = doc.id;
  const supabase = createClient();

  // Check if current user has edit permissions
  const { canEdit } = useDocumentAccess();

  const [remoteCursors, setRemoteCursors] = useState<
    Map<string, RenderedCursor>
  >(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);

  const userColor = getUserColor(user?.id ?? "");
  const userName = user?.email?.split("@")[0] ?? "Anonymous";

  // Convert selection to global character offset
  const getGlobalOffset = useCallback((): number | null => {
    let offset: number | null = null;

    editor.getEditorState().read(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        const root = $getRoot();
        const anchorNode = selection.anchor.getNode();
        const anchorOffset = selection.anchor.offset;

        // Get all text nodes in document order
        const allTextNodes = getAllTextNodes(root);

        let currentOffset = 0;
        let found = false;

        for (const textNode of allTextNodes) {
          if (textNode.getKey() === anchorNode.getKey()) {
            // Found our node
            currentOffset += anchorOffset;
            found = true;
            break;
          }
          // Add this node's text length
          currentOffset += textNode.getTextContent().length;
        }

        if (found) {
          offset = currentOffset;
        }
      }
    });

    return offset;
  }, [editor]);

  // Convert global offset to DOM position
  const getPositionFromOffset = useCallback(
    (globalOffset: number): { x: number; y: number } | null => {
      let position: { x: number; y: number } | null = null;

      try {
        editor.getEditorState().read(() => {
          const root = $getRoot();
          const allTextNodes = getAllTextNodes(root);

          let currentOffset = 0;
          let targetNode: TextNode | null = null;
          let targetOffset = 0;

          // Find the text node containing the offset
          for (const textNode of allTextNodes) {
            const textLength = textNode.getTextContent().length;

            if (currentOffset + textLength >= globalOffset) {
              targetNode = textNode;
              targetOffset = globalOffset - currentOffset;
              break;
            }

            currentOffset += textLength;
          }

          if (targetNode) {
            // Get the DOM element for this text node
            const domNode = editor.getElementByKey(targetNode.getKey());

            if (domNode) {
              // Find the text node inside the DOM element
              let textDomNode: Text | null = null;

              if (domNode.nodeType === Node.TEXT_NODE) {
                textDomNode = domNode as unknown as Text;
              } else if (
                domNode.firstChild &&
                domNode.firstChild.nodeType === Node.TEXT_NODE
              ) {
                textDomNode = domNode.firstChild as Text;
              }

              if (textDomNode) {
                // Create a range at the target offset
                const range = window.document.createRange();
                const safeOffset = Math.min(
                  targetOffset,
                  textDomNode.textContent?.length || 0,
                );

                try {
                  range.setStart(textDomNode, safeOffset);
                  range.setEnd(textDomNode, safeOffset);

                  const rect = range.getBoundingClientRect();
                  if (rect && rect.height > 0) {
                    position = {
                      x: rect.left,
                      y: rect.top,
                    };
                  }
                } catch {
                  // Fallback to element position
                  const rect = domNode.getBoundingClientRect();
                  if (rect) {
                    position = {
                      x: rect.left,
                      y: rect.top,
                    };
                  }
                }
              }
            }
          }
        });
      } catch (error) {
        console.error("Error getting position from offset:", error);
      }

      return position;
    },
    [editor],
  );

  // Broadcast cursor position (not debounced)
  const broadcastCursorPositionImmediate = useCallback(() => {
    // Only broadcast if user has edit access
    if (!canEdit || !channelRef.current) return;

    const offset = getGlobalOffset();
    if (offset !== null) {
      channelRef.current.send({
        type: "broadcast",
        event: "cursor-move",
        payload: {
          offset,
          user_id: user?.id,
          user_name: userName,
          color: userColor,
          timestamp: Date.now(),
        } as CursorPosition,
      });
    }
  }, [getGlobalOffset, user?.id, userName, userColor, canEdit]);

  // Debounced version (300ms) to avoid overwhelming the network
  const broadcastCursorPosition = useDebounce(
    broadcastCursorPositionImmediate,
    300,
  );

  useEffect(() => {
    if (!canEdit || !user) return;

    // Create a realtime channel for cursor tracking
    const channel = supabase.channel(`cursors:${documentId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: user.id },
      },
    });

    channelRef.current = channel;

    channel
      .on("broadcast", { event: "cursor-move" }, (payload) => {
        const cursorData = payload.payload as CursorPosition;

        if (cursorData.user_id === user.id) {
          return;
        }

        console.log("Received cursor at offset:", cursorData.offset);

        const position = getPositionFromOffset(cursorData.offset);

        if (position) {
          setRemoteCursors((prev) => {
            const newMap = new Map(prev);
            newMap.set(cursorData.user_id, {
              x: position.x,
              y: position.y,
              user_id: cursorData.user_id,
              user_name: cursorData.user_name,
              color: cursorData.color,
            });
            return newMap;
          });
        }
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        setRemoteCursors((prev) => {
          const newMap = new Map(prev);
          leftPresences.forEach((presence: any) => {
            newMap.delete(presence.user_id);
          });
          return newMap;
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          console.log("Cursor tracking connected");
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    const removeSelectionListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        broadcastCursorPosition();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    const handleClick = () => {
      setTimeout(broadcastCursorPosition, 10);
    };

    const editorElement = editor.getRootElement();
    editorElement?.addEventListener("click", handleClick);

    return () => {
      removeSelectionListener();
      editorElement?.removeEventListener("click", handleClick);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [
    documentId,
    editor,
    user,
    broadcastCursorPosition,
    getPositionFromOffset,
    supabase,
    canEdit,
  ]);

  return (
    <>
      {Array.from(remoteCursors.values()).map((cursor) => (
        <RemoteCursor
          key={cursor.user_id}
          x={cursor.x}
          y={cursor.y}
          userName={cursor.user_name}
          color={cursor.color}
        />
      ))}
    </>
  );
}

interface RemoteCursorProps {
  x: number;
  y: number;
  userName: string;
  color: string;
}

function RemoteCursor({ x, y, userName, color }: RemoteCursorProps) {
  return (
    <div
      className="pointer-events-none fixed z-50 transition-all duration-100 ease-out"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="absolute h-5 w-0.5" style={{ backgroundColor: color }} />
      <div
        className="absolute top-5 -left-1 rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        {userName}
      </div>
    </div>
  );
}
