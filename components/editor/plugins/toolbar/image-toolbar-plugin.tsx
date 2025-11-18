"use client";

import { ImageIcon } from "lucide-react";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { InsertImageDialog } from "@/components/editor/plugins/images-plugin";
import { Button } from "@/components/ui/button";

export function ImageToolbarPlugin() {
  const { activeEditor, showModal, isEditable } = useToolbarContext();

  return (
    <Button
      onClick={() => {
        showModal("Insert Image", (onClose) => (
          <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />
        ));
      }}
      variant={"outline"}
      size={"icon-sm"}
      className=""
      disabled={!isEditable}
    >
      <ImageIcon className="size-4" />
    </Button>
  );
}
