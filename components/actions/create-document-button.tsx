import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CreateDocumentButton() {
  return (
    <Button asChild>
      <Link href="/editor/new">
        <Plus className="mr-2 h-4 w-4" />
        New Document
      </Link>
    </Button>
  );
}
