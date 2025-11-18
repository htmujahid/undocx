"use client";

import { useState } from "react";

import { toast } from "sonner";

import { useEditorContext } from "@/components/editor/context/editor-context";
import { createClient } from "@/lib/supabase/client";

export function DocumentTitlePlugin() {
  const { document, user } = useEditorContext();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(document.title);

  const handleSaveTitle = async () => {
    setIsEditing(false);

    // Don't save if title hasn't changed
    if (title === document.title) {
      return;
    }

    // Don't save empty titles
    if (!title.trim()) {
      setTitle(document.title);
      toast.error("Title cannot be empty");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("documents")
      .update({ title: title.trim() })
      .eq("id", document.id);

    if (error) {
      console.error("Failed to update document title:", error);
      toast.error("Failed to save title");
      // Revert to original title on error
      setTitle(document.title);
    } else {
      toast.success("Title saved");
    }
  };

  return (
    <div>
      {isEditing ? (
        <input
          type="text"
          className="w-full bg-transparent text-xl leading-none font-medium outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSaveTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSaveTitle();
            } else if (e.key === "Escape") {
              setTitle(document.title);
              setIsEditing(false);
            }
          }}
          autoFocus
        />
      ) : (
        <h1
          className="cursor-pointer text-xl leading-none font-medium"
          onClick={() => user && setIsEditing(true)}
        >
          {title}
        </h1>
      )}
    </div>
  );
}
