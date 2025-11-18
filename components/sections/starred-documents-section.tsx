import { Star } from "lucide-react";

import { DocumentCard } from "@/components/actions/document-card";

type StarredDocument = {
  id: string;
  title: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  user_picture_url?: string;
};

type StarredDocumentsSectionProps = {
  initialDocuments: StarredDocument[];
};

export function StarredDocumentsSection({
  initialDocuments,
}: StarredDocumentsSectionProps) {
  if (initialDocuments.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            Starred Documents
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {initialDocuments.length} document
            {initialDocuments.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {initialDocuments.map((doc) => (
          <DocumentCard
            key={doc.id}
            documentId={doc.id}
            title={doc.title}
            userName={doc.user_name}
            userEmail={doc.user_email}
            userPictureUrl={doc.user_picture_url}
            updatedAt={doc.updated_at}
          />
        ))}
      </div>
    </section>
  );
}
