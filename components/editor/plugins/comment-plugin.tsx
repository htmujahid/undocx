/**
 * Simple CommentPlugin following Lexical patterns
 * Handles inline comment creation with MarkNodes
 */

"use client";

import {
  ComponentProps,
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { $wrapSelectionInMarkNode } from "@lexical/mark";
import {
  $createMarkNode,
  $getMarkIDs,
  $isMarkNode,
  MarkNode,
} from "@lexical/mark";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createDOMRange } from "@lexical/selection";
import { mergeRegister, registerNestedElementResolver } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_EDITOR,
  LexicalCommand,
  NodeKey,
  createCommand,
} from "lexical";
import "lexical";
import {
  Check,
  MessageSquare,
  MessageSquareTextIcon,
  Reply,
  RotateCcw,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useEditorContext } from "@/components/editor/context/editor-context";
import { useDocumentAccess } from "@/components/editor/editor-hooks/use-document-access";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { Comments } from "../types";

// Simple floating comment input
export function CommentInputBox({ onClose }: { onClose: () => void }) {
  const [editor] = useLexicalComposerContext();
  const [content, setContent] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { document, user } = useEditorContext();

  // Position the box near the selection
  useLayoutEffect(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !boxRef.current) return;

      const anchor = selection.anchor;
      const focus = selection.focus;
      const range = createDOMRange(
        editor,
        anchor.getNode(),
        anchor.offset,
        focus.getNode(),
        focus.offset,
      );

      if (range) {
        const { left, bottom, width } = range.getBoundingClientRect();
        const boxElem = boxRef.current;

        // Center horizontally under selection
        let leftPos = left + width / 2 - 150; // 150 = half of box width (300px)

        // Keep within viewport bounds
        if (leftPos < 10) leftPos = 10;
        if (leftPos + 300 > window.innerWidth - 10) {
          leftPos = window.innerWidth - 310;
        }

        boxElem.style.left = `${leftPos}px`;
        boxElem.style.top = `${bottom + 10 + window.scrollY}px`;
      }
    });
  }, [editor]);

  // Handle comment submission
  const handleSubmitComment = useCallback(
    async (commentId: string, content: string, quote: string) => {
      // Save to database
      if (!user) return;
      const { error } = await supabase.from("comments").insert({
        id: commentId,
        document_id: document.id,
        user_id: user.id,
        content,
        quote_text: quote.length > 100 ? quote.slice(0, 99) + "…" : quote,
        parent_comment_id: null,
        is_resolved: false,
      });

      if (error) {
        console.error("Failed to save comment:", error);
        toast.error("Failed to save comment");
        return;
      }

      // Wrap selection in mark node
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $wrapSelectionInMarkNode(
            selection,
            selection.isBackward(),
            commentId,
          );
        }
      });

      toast.success("Comment added");
      onClose();
    },
    [editor, supabase, document.id, user, onClose],
  );

  const handleSubmit = () => {
    if (!content.trim()) return;

    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const quote = selection.getTextContent();
      const commentId = crypto.randomUUID(); // Generate proper UUID
      handleSubmitComment(commentId, content.trim(), quote);
    });
  };

  return (
    <Card
      ref={boxRef}
      className="fixed z-50 w-[300px] max-w-[400px] p-0 shadow-lg"
    >
      <CardContent className="p-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              onClose();
            } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Type your comment..."
          className="min-h-[80px] resize-none"
          autoFocus
        />
      </CardContent>
      <CardFooter className="flex justify-end gap-2 p-3 pt-0">
        <Button onClick={onClose} variant="ghost" size="sm">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!content.trim()} size="sm">
          Comment
        </Button>
      </CardFooter>
    </Card>
  );
}

export const INSERT_INLINE_COMMENT_COMMAND: LexicalCommand<void> =
  createCommand("INSERT_INLINE_COMMENT_COMMAND");

// Simple comment input
function CommentInput({
  placeholder = "Add a comment...",
  onSubmit,
  onCancel,
  autoFocus = false,
}: {
  placeholder?: string;
  onSubmit?: (content: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit?.(value.trim());
      setValue("");
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="min-h-[80px] resize-none"
        autoFocus={autoFocus}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="h-8"
          disabled={!value.trim()}
          onClick={handleSubmit}
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          Comment
        </Button>
        {onCancel && (
          <Button size="sm" variant="ghost" className="h-8" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

// Single comment item
function CommentItem({
  comment,
  onDelete,
  onReply,
  onResolve,
  onUnresolve,
  isReply = false,
}: {
  comment: Comments;
  onDelete?: () => void;
  onReply?: (content: string) => void;
  onResolve?: () => void;
  onUnresolve?: () => void;
  isReply?: boolean;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const timeAgo = useMemo(() => {
    const date = new Date(comment.created_at ?? "");
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }, [comment.created_at]);

  return (
    <div className={cn("space-y-3", isReply && "mt-3 ml-4")}>
      <div className="group relative">
        <div className="flex items-start gap-2">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {comment?.user_name}
                </span>
                <span className="text-muted-foreground text-xs">{timeAgo}</span>
                {comment.is_resolved && !isReply && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    Resolved
                  </Badge>
                )}
              </div>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <p className="text-foreground text-sm leading-relaxed">
              {comment.content}
            </p>

            <div className="flex items-center gap-2 pt-0.5">
              {onReply && !comment.is_resolved && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setShowReplyInput(!showReplyInput)}
                >
                  <Reply className="mr-1.5 h-3 w-3" />
                  Reply
                </Button>
              )}
              {!isReply && (
                <>
                  {comment.is_resolved
                    ? onUnresolve && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={onUnresolve}
                        >
                          <RotateCcw className="mr-1.5 h-3 w-3" />
                          Reopen
                        </Button>
                      )
                    : onResolve && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={onResolve}
                        >
                          <Check className="mr-1.5 h-3 w-3" />
                          Resolve
                        </Button>
                      )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReplyInput && onReply && (
        <CommentInput
          placeholder="Add a reply..."
          onSubmit={(content) => {
            onReply(content);
            setShowReplyInput(false);
          }}
          onCancel={() => setShowReplyInput(false)}
          autoFocus={true}
        />
      )}

      {onDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Comment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this comment? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

// Comment thread with quote
function CommentThread({
  thread,
  replies,
  onDeleteThread,
  onDeleteReply,
  onReply,
  onResolve,
  onUnresolve,
  onClick,
}: {
  thread: Comments;
  replies: Comments[];
  onDeleteThread?: () => void;
  onDeleteReply?: (replyId: string) => void;
  onReply?: (content: string) => void;
  onResolve?: () => void;
  onUnresolve?: () => void;
  onClick: () => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="space-y-3">
        {/* Quote */}
        {thread.quote_text && (
          <div className="flex items-start justify-between gap-2">
            <blockquote className="border-muted-foreground/20 text-muted-foreground flex-1 border-l-2 pl-2 text-sm italic">
              {thread.quote_text}
            </blockquote>
            {onDeleteThread && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Main comment */}
        <CommentItem
          comment={thread}
          onDelete={onDeleteThread}
          onReply={onReply}
          onResolve={onResolve}
          onUnresolve={onUnresolve}
        />

        {/* Replies */}
        {replies.map((reply) => (
          <Fragment key={reply.id}>
            <CommentItem
              comment={reply}
              onDelete={
                onDeleteReply ? () => onDeleteReply(reply.id) : undefined
              }
              isReply
            />
          </Fragment>
        ))}
      </div>

      {onDeleteThread && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Thread</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this entire thread? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteThread();
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

export function CommentPlugin({ ...props }: ComponentProps<typeof Sidebar>) {
  const { document, user, comments } = useEditorContext();
  const [editor] = useLexicalComposerContext();
  const supabase = createClient();
  const { toggleSidebar, open } = useSidebar();

  // Check user's access permissions
  const { canEdit, canComment } = useDocumentAccess();

  const [showCommentInput, setShowCommentInput] = useState(false);
  const [activeIDs, setActiveIDs] = useState<Array<string>>([]);
  const markNodeMap = useMemo<Map<string, Set<NodeKey>>>(() => {
    return new Map();
  }, []);
  // Simple state - just comments from database
  const [activeTab, setActiveTab] = useState<"active" | "resolved">("active");

  // Organize comments into threads
  const threads = useMemo(() => {
    const topLevel = comments.filter((c) => c.parent_comment_id === null);
    return topLevel.map((thread) => ({
      thread,
      replies: comments.filter((c) => c.parent_comment_id === thread.id),
    }));
  }, [comments]);

  // Register mark node and command
  useEffect(() => {
    const markNodeKeysToIDs: Map<NodeKey, Array<string>> = new Map();

    return mergeRegister(
      // Register nested element resolver for mark nodes
      registerNestedElementResolver<MarkNode>(
        editor,
        MarkNode,
        (from: MarkNode) => $createMarkNode(from.getIDs()),
        (from: MarkNode, to: MarkNode) => {
          const ids = from.getIDs();
          ids.forEach((id) => to.addID(id));
        },
      ),
      editor.registerMutationListener(
        MarkNode,
        (mutations) => {
          editor.getEditorState().read(() => {
            for (const [key, mutation] of mutations) {
              const node: null | MarkNode = $getNodeByKey(key);
              let ids: NodeKey[] = [];

              if (mutation === "destroyed") {
                ids = markNodeKeysToIDs.get(key) || [];
              } else if ($isMarkNode(node)) {
                ids = node.getIDs();
              }

              for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                let markNodeKeys = markNodeMap.get(id);
                markNodeKeysToIDs.set(key, ids);

                if (mutation === "destroyed") {
                  if (markNodeKeys !== undefined) {
                    markNodeKeys.delete(key);
                    if (markNodeKeys.size === 0) {
                      markNodeMap.delete(id);
                    }
                  }
                } else {
                  if (markNodeKeys === undefined) {
                    markNodeKeys = new Set();
                    markNodeMap.set(id, markNodeKeys);
                  }
                  if (!markNodeKeys.has(key)) {
                    markNodeKeys.add(key);
                  }
                }
              }
            }
          });
        },
        { skipInitialization: false },
      ),
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          let hasActiveIds = false;

          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();

            if ($isTextNode(anchorNode)) {
              const commentIDs = $getMarkIDs(
                anchorNode,
                selection.anchor.offset,
              );
              if (commentIDs !== null) {
                setActiveIDs(commentIDs);
                hasActiveIds = true;
              }
            }
          }
          if (!hasActiveIds) {
            setActiveIDs((_activeIds) =>
              _activeIds.length === 0 ? _activeIds : [],
            );
          }
          if ($isRangeSelection(selection)) {
            setShowCommentInput(false);
          }
        });
      }),
      // Register command to insert inline comment
      editor.registerCommand(
        INSERT_INLINE_COMMENT_COMMAND,
        () => {
          setShowCommentInput(true);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor, markNodeMap]);

  useEffect(() => {
    const changedElems: Array<HTMLElement> = [];
    for (let i = 0; i < activeIDs.length; i++) {
      const id = activeIDs[i];
      const keys = markNodeMap.get(id);
      if (keys !== undefined) {
        for (const key of keys) {
          const elem = editor.getElementByKey(key);
          if (elem !== null) {
            elem.classList.add("bg-yellow-300");
            changedElems.push(elem);
            // setShowCommentInput(true);
          }
        }
      }
    }
    return () => {
      for (let i = 0; i < changedElems.length; i++) {
        const changedElem = changedElems[i];
        changedElem.classList.remove("bg-yellow-300");
      }
    };
  }, [activeIDs, editor, markNodeMap]);

  // Add reply to thread
  const handleReply = async (threadId: string, content: string) => {
    if (!user) return;
    const { error } = await supabase.from("comments").insert({
      document_id: document.id,
      user_id: user.id,
      content,
      parent_comment_id: threadId,
    });

    if (error) {
      console.error("Failed to add reply:", error);
      toast.error("Failed to add reply");
      return;
    }
  };

  // Delete thread
  const handleDeleteThread = async (threadId: string) => {
    // Delete thread and all its replies
    const { error } = await supabase
      .from("comments")
      .delete()
      .or(`id.eq.${threadId},parent_comment_id.eq.${threadId}`);

    if (error) {
      console.error("Failed to delete thread:", error);
      toast.error("Failed to delete thread");
      return;
    }

    // Remove the mark from the editor
    const markNodeKeys = markNodeMap.get(threadId);
    if (markNodeKeys !== undefined) {
      editor.update(() => {
        for (const key of markNodeKeys) {
          const node = $getNodeByKey<MarkNode>(key);
          if ($isMarkNode(node)) {
            node.deleteID(threadId);
            // If no more IDs, remove the mark wrapper entirely
            if (node.getIDs().length === 0) {
              const children = node.getChildren();
              for (const child of children) {
                node.insertBefore(child);
              }
              node.remove();
            }
          }
        }
      });
    }

    toast.success("Thread deleted");
  };

  // Delete reply
  const handleDeleteReply = async (replyId: string) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", replyId);

    if (error) {
      console.error("Failed to delete reply:", error);
      toast.error("Failed to delete reply");
      return;
    }
  };

  // Resolve thread
  const handleResolve = async (threadId: string) => {
    // Update thread and all replies
    const { error } = await supabase
      .from("comments")
      .update({ is_resolved: true })
      .or(`id.eq.${threadId},parent_comment_id.eq.${threadId}`);

    if (error) {
      console.error("Failed to resolve:", error);
      toast.error("Failed to resolve");
      return;
    }

    toast.success("Comment resolved");
  };

  // Unresolve thread
  const handleUnresolve = async (threadId: string) => {
    // Update thread and all replies
    const { error } = await supabase
      .from("comments")
      .update({ is_resolved: false })
      .or(`id.eq.${threadId},parent_comment_id.eq.${threadId}`);

    if (error) {
      console.error("Failed to unresolve:", error);
      toast.error("Failed to unresolve");
      return;
    }

    toast.success("Comment reopened");
  };

  // Navigate to comment in editor
  const handleThreadClick = (threadId: string) => {
    const markNodeKeys = markNodeMap.get(threadId);
    if (
      markNodeKeys !== undefined &&
      (activeIDs === null || activeIDs.indexOf(threadId) === -1)
    ) {
      const activeElement = window.document.activeElement;
      // Move selection to the start of the mark, so that we
      // update the UI with the selected thread.
      editor.update(
        () => {
          const markNodeKey = Array.from(markNodeKeys)[0];
          const markNode = $getNodeByKey<MarkNode>(markNodeKey);
          if ($isMarkNode(markNode)) {
            markNode.selectStart();
          }
        },
        {
          onUpdate() {
            // Restore selection to the previous element
            if (activeElement !== null) {
              (activeElement as HTMLElement).focus();
            }
          },
        },
      );
    }
  };

  if (!open) {
    return (
      <>
        {showCommentInput && (
          <CommentInputBox onClose={() => setShowCommentInput(false)} />
        )}
        <div className="p-2">
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => toggleSidebar()}
          >
            <MessageSquareTextIcon />
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {showCommentInput && (
        <CommentInputBox onClose={() => setShowCommentInput(false)} />
      )}
      <Sidebar
        variant="floating"
        side="right"
        className="top-(--header-height) bottom-(--footer-height) h-[calc(100svh-var(--header-height)-var(--footer-height))]!"
        {...props}
      >
        <SidebarHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <h2 className="text-foreground text-base font-medium">
                Comments
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => toggleSidebar()}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="text-xs">
                Active (
                {threads.filter(({ thread }) => !thread.is_resolved).length})
              </TabsTrigger>
              <TabsTrigger value="resolved" className="text-xs">
                Resolved
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </SidebarHeader>

        <SidebarContent>
          <ScrollArea className="h-full">
            <div className="space-y-4 px-4 py-4">
              {threads.length > 0 ? (
                threads
                  .filter(({ thread }) =>
                    activeTab === "active"
                      ? !thread.is_resolved
                      : thread.is_resolved,
                  )
                  .map(({ thread, replies }, index) => (
                    <div key={thread.id}>
                      <CommentThread
                        thread={thread}
                        replies={replies}
                        onDeleteThread={
                          canEdit
                            ? () => handleDeleteThread(thread.id)
                            : undefined
                        }
                        onDeleteReply={canEdit ? handleDeleteReply : undefined}
                        onReply={
                          canComment
                            ? (content) => handleReply(thread.id, content)
                            : undefined
                        }
                        onResolve={
                          canEdit ? () => handleResolve(thread.id) : undefined
                        }
                        onUnresolve={
                          canEdit ? () => handleUnresolve(thread.id) : undefined
                        }
                        onClick={() => handleThreadClick(thread.id)}
                      />
                      {index < threads.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="text-muted-foreground/50 mb-3 h-12 w-12" />
                  <p className="text-muted-foreground text-sm">
                    {activeTab === "resolved"
                      ? "No resolved comments"
                      : "No active comments"}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Select text to add a comment
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="border-t p-4">
          <div className="text-muted-foreground text-xs">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}{" "}
            total
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
