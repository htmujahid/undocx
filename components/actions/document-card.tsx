"use client";

import Link from "next/link";

import { ExternalLink, FileText } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentCardProps {
  documentId: string;
  title: string;
  userName?: string;
  userEmail?: string;
  userPictureUrl?: string;
  updatedAt: string;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function DocumentCard({
  documentId,
  title,
  userName,
  userEmail,
  userPictureUrl,
  updatedAt,
}: DocumentCardProps) {
  const displayUser = userName || userEmail?.split("@")[0] || "Unknown";

  return (
    <Card className="group overflow-hidden">
      <CardHeader className="space-y-3">
        {/* Title with Icon and Link */}
        <div className="flex items-center gap-2">
          <FileText className="text-primary h-5 w-5" />
          <div className="min-w-0 flex-1">
            <CardTitle className="line-clamp-2 text-sm leading-tight font-semibold">
              <Link href={`/editor/${documentId}`} className="hover:underline">
                {title}
              </Link>
            </CardTitle>
          </div>
          <Link
            href={`/editor/${documentId}`}
            className="text-muted-foreground hover:text-primary shrink-0 opacity-0 transition-all group-hover:opacity-100"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {/* User Info and Timestamp */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Avatar className="h-5 w-5 shrink-0">
              <AvatarImage src={userPictureUrl} alt={displayUser} />
              <AvatarFallback className="text-[10px]">
                {getInitials(displayUser)}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground truncate text-xs">
              {displayUser}
            </span>
          </div>
          <span className="text-muted-foreground shrink-0 text-[11px]">
            {formatDate(updatedAt)}
          </span>
        </div>
      </CardHeader>
    </Card>
  );
}
