"use client";

import { useEffect, useState } from "react";

import { useEditorContext } from "@/components/editor/context/editor-context";
import { useDocumentAccess } from "@/components/editor/editor-hooks/use-document-access";
import { getUserColor } from "@/components/editor/utils/user-colors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";

interface UserPresence {
  user_id: string;
  user_email: string;
  user_avatar: string;
  online_at: string;
  color: string;
}

/**
 * PresencePlugin - Tracks and displays active users viewing/editing the document
 *
 * This plugin:
 * 1. Tracks which users are currently connected to the document (any access level)
 * 2. Displays avatars of active users
 * 3. Assigns unique colors to each user for identification
 * 4. Automatically removes users when they disconnect
 *
 * Note: Presence is tracked for all users with any access level (view, comment, edit)
 */
export function PresencePlugin() {
  const { document, user } = useEditorContext();
  const documentId = document.id;
  const supabase = createClient();

  // Get user's access level
  const { canEdit } = useDocumentAccess();

  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const userColor = getUserColor(user?.id ?? ""); // Fallback to empty string if user is null

  useEffect(() => {
    // Only track presence if user has at least view access
    if (!canEdit || !user) {
      return;
    }

    const channel = supabase.channel(`presence:${documentId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track presence state updates
    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState<UserPresence>();
        const users: UserPresence[] = [];

        Object.values(presenceState).forEach((presences) => {
          presences.forEach((presence) => {
            users.push(presence as UserPresence);
          });
        });

        setActiveUsers(users);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        console.log("User joined:", newPresences);
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        console.log("User left:", leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track our presence
          await channel.track({
            user_id: user.id,
            user_email: user.email ?? "Anonymous",
            user_avatar: user.user_metadata?.avatar_url ?? "",
            online_at: new Date().toISOString(),
            color: userColor,
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [documentId, user, userColor, supabase, canEdit]);

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 px-2">
      <span className="text-muted-foreground mr-1 text-xs">
        {activeUsers.length} {activeUsers.length === 1 ? "editor" : "editors"}
      </span>
      <div className="flex -space-x-2">
        {activeUsers.slice(0, 5).map((activeUser) => {
          const initials = activeUser.user_email
            .split("@")[0]
            .substring(0, 2)
            .toUpperCase();

          return (
            <Tooltip key={activeUser.user_id}>
              <TooltipTrigger asChild>
                <Avatar
                  className="border-background h-7 w-7 cursor-pointer border-2"
                  style={{ backgroundColor: activeUser.color }}
                >
                  <AvatarImage
                    src={activeUser.user_avatar}
                    alt={activeUser.user_email}
                  />
                  <AvatarFallback className="text-xs text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {activeUser.user_email}
                  {activeUser.user_id === user?.id && " (you)"}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        {activeUsers.length > 5 && (
          <Avatar className="border-background h-7 w-7 border-2">
            <AvatarFallback className="text-xs">
              +{activeUsers.length - 5}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
