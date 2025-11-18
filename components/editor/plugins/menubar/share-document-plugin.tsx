"use client";

import { useState } from "react";

import { Check, Copy, Share2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { useEditorContext } from "@/components/editor/context/editor-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

type Permission = "edit" | "comment" | "view";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  permission: Permission;
  status: "active" | "pending";
  userId?: string;
}

// Helper function to map database record to UI format
function mapCollaboratorToUI(access: Tables<"shared_documents">): Collaborator {
  if (access.user_id) {
    return {
      id: access.id,
      userId: access.user_id,
      name: access.email?.split("@")[0] ?? "User",
      email: access.email ?? "user@example.com",
      permission: access.access_level as Permission,
      status: "active" as const,
    };
  } else {
    return {
      id: access.id,
      name: access.email?.split("@")[0] ?? "User",
      email: access.email ?? "",
      permission: access.access_level as Permission,
      status: "pending" as const,
    };
  }
}

export function ShareDocumentPlugin() {
  const {
    document,
    user,
    collaborators: contextCollaborators,
  } = useEditorContext();
  const supabase = createClient();

  const [collaborators, setCollaborators] = useState<Collaborator[]>(
    contextCollaborators.map(mapCollaboratorToUI),
  );
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<Permission>("view");
  const [isPublic, setIsPublic] = useState(document.is_public || false);
  const [loading, setLoading] = useState(false);

  if (document.user_id !== user?.id) {
    return null;
  }

  const handleCopyLink = async () => {
    const shareLink = `${window.location.origin}/editor/${document.id}`;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyInviteLink = async (inviteId: string) => {
    const inviteLink = `${window.location.origin}/editor/${document.id}/invitation`;
    await navigator.clipboard.writeText(inviteLink);
    setCopiedInviteId(inviteId);
    setTimeout(() => setCopiedInviteId(null), 2000);
    toast.success("Invitation link copied");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInviteCollaborator = async () => {
    if (!email || loading) return;
    setLoading(true);

    const inviteEmail = email;
    const invitePermission = permission;

    // Clear form immediately
    setEmail("");
    setPermission("view");

    const { data, error } = await supabase
      .from("shared_documents")
      .insert({
        document_id: document.id,
        email: inviteEmail,
        access_level: invitePermission,
        shared_by: document.user_id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        toast.error("User already has access to this document");
      } else {
        toast.error("Failed to invite user");
      }
      setLoading(false);
      return;
    }

    // Update local state
    setCollaborators((prev) => [...prev, mapCollaboratorToUI(data)]);
    toast.success("Collaborator invited successfully");
    setLoading(false);
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    const { error } = await supabase
      .from("shared_documents")
      .delete()
      .eq("id", collaboratorId);

    if (error) {
      toast.error("Failed to remove collaborator");
      return;
    }

    // Update local state
    setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
    toast.success("Collaborator removed successfully");
  };

  const handleUpdatePermission = async (
    collaboratorId: string,
    newPermission: Permission,
  ) => {
    const { error } = await supabase
      .from("shared_documents")
      .update({ access_level: newPermission })
      .eq("id", collaboratorId);

    if (error) {
      toast.error("Failed to update permission");
      return;
    }

    // Update local state
    setCollaborators((prev) =>
      prev.map((c) =>
        c.id === collaboratorId ? { ...c, permission: newPermission } : c,
      ),
    );
    toast.success("Permission updated successfully");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm">
          <Share2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Invite people to collaborate or share a link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invite Section */}
          <div className="space-y-2">
            <Label htmlFor="email">Invite people</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && email && !loading) {
                    e.preventDefault();
                    handleInviteCollaborator();
                  }
                }}
              />
              <Select
                value={permission}
                onValueChange={(value) => setPermission(value as Permission)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="edit">Can edit</SelectItem>
                  <SelectItem value="comment">Can comment</SelectItem>
                  <SelectItem value="view">Can view</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleInviteCollaborator}
                disabled={!email || loading}
              >
                <UserPlus className="size-4" />
              </Button>
            </div>
          </div>

          {/* Collaborators List */}
          {collaborators.length > 0 && (
            <div className="space-y-2">
              <Label>People with access</Label>
              <div className="max-h-[200px] space-y-2 overflow-y-auto">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="hover:bg-accent flex items-center justify-between rounded-md p-2"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(collaborator.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">
                            {collaborator.name}
                          </p>
                          {collaborator.status === "pending" && (
                            <Badge variant="secondary" className="text-xs">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground truncate text-xs">
                          {collaborator.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={collaborator.permission}
                        onValueChange={(value) =>
                          handleUpdatePermission(
                            collaborator.id,
                            value as Permission,
                          )
                        }
                      >
                        <SelectTrigger className="h-8 w-[125px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="edit">Can edit</SelectItem>
                          <SelectItem value="comment">Can comment</SelectItem>
                          <SelectItem value="view">Can view</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => handleCopyInviteLink(collaborator.id)}
                        title="Copy invitation link"
                      >
                        {copiedInviteId === collaborator.id ? (
                          <Check className="size-4 text-green-500" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() =>
                          handleRemoveCollaborator(collaborator.id)
                        }
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Link Sharing Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Make document public</Label>
                <p className="text-muted-foreground text-xs">
                  {isPublic
                    ? "Anyone with the link can view this document"
                    : "Only invited people can access this document"}
                </p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={async (checked) => {
                  const { error } = await supabase
                    .from("documents")
                    .update({ is_public: checked })
                    .eq("id", document.id);

                  if (error) {
                    toast.error("Failed to update document visibility");
                    return;
                  }

                  setIsPublic(checked);
                  toast.success(
                    checked
                      ? "Document is now public"
                      : "Document is now private",
                  );
                }}
              />
            </div>

            {isPublic && (
              <div className="flex gap-2">
                <Input
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}/editor/${document.id}`
                      : ""
                  }
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
