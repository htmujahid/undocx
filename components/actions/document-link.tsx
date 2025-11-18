"use client";

import { useRouter } from "next/navigation";

type DocumentLinkProps = {
  documentId: string;
  title: string;
};

export function DocumentLink({ documentId, title }: DocumentLinkProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/editor/${documentId}`)}
      className="text-left font-medium hover:underline"
    >
      {title}
    </button>
  );
}
