import { FileText, Trash2 } from "lucide-react";

import { TrashActions } from "@/components/actions/trash-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TrashedDocument = {
  id: string;
  title: string;
  trashed_at: string;
  user_name?: string;
  user_email?: string;
  user_picture_url?: string;
};

type TrashSectionProps = {
  initialDocuments: TrashedDocument[];
};

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

export function TrashSection({ initialDocuments }: TrashSectionProps) {
  if (initialDocuments.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Trash2 className="h-6 w-6" />
            Trash
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {initialDocuments.length} document
            {initialDocuments.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {initialDocuments.map((doc) => {
          const displayUser =
            doc.user_name || doc.user_email?.split("@")[0] || "Unknown";

          return (
            <Card key={doc.id} className="group opacity-75 transition-colors">
              <CardHeader className="flex-row items-start justify-between space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                    <FileText className="text-muted-foreground h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-muted-foreground line-clamp-2 text-base">
                      {doc.title}
                    </CardTitle>
                  </div>
                </div>
                <div className="opacity-0 transition-opacity group-hover:opacity-100">
                  <TrashActions documentId={doc.id} />
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-2 pt-0">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={doc.user_picture_url} alt={displayUser} />
                    <AvatarFallback className="text-xs">
                      {getInitials(displayUser)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground truncate text-sm">
                    {displayUser}
                  </span>
                </div>
                <CardDescription className="text-xs">
                  Deleted {formatDate(doc.trashed_at)}
                </CardDescription>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
