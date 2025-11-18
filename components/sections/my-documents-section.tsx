import { FileText } from "lucide-react";

import { CreateDocumentButton } from "@/components/actions/create-document-button";
import { DocumentCard } from "@/components/actions/document-card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type DocumentWithUser = {
  id: string;
  title: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  user_picture_url?: string;
};

type MyDocumentsSectionProps = {
  initialDocuments: DocumentWithUser[];
};

export function MyDocumentsSection({
  initialDocuments,
}: MyDocumentsSectionProps) {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Documents</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {initialDocuments.length} document
            {initialDocuments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <CreateDocumentButton />
      </div>

      {initialDocuments.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText className="h-12 w-12" />
            </EmptyMedia>
            <EmptyTitle>No documents yet</EmptyTitle>
            <EmptyDescription>
              Get started by creating your first document
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateDocumentButton />
          </EmptyContent>
        </Empty>
      ) : (
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
      )}
    </section>
  );
}
