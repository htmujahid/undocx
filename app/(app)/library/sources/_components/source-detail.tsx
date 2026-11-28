"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { InputField } from "~@/components/ui/form-fields";
import { sourceLimits } from "~@/lib/sources/limits";
import { useRenameSource } from "~@/lib/sources/query";
import { renameSourceSchema, type RenameSourceValues } from "~@/lib/sources/schemas";
import { DetailBody, DetailTop } from "../../_components/detail-header";
import { FormSection } from "../../_components/empty-pane";

type Props = {
  source: {
    id: string;
    kind: "file" | "text" | "link";
    title: string;
    url: string | null;
    wordCount: number;
    preview: string;
    isTruncated: boolean;
    file: { name: string; size: number } | null;
    documents: { id: string; title: string }[];
  };
};

const kinds = { file: "File", text: "Pasted text", link: "Link" } as const;

export function SourceDetail({ source }: Props) {
  const form = useForm<RenameSourceValues>({ resolver: zodResolver(renameSourceSchema), defaultValues: { title: source.title } });
  const { trigger: rename } = useRenameSource(source.id);
  const save = form.handleSubmit(async (values) => {
    const result = await rename(values);
    if (result?.error) {
      form.setError("root.server", { message: result.error });
      return;
    }
    form.reset(values);
  });
  const used = source.documents.length;

  return (
    <div className="flex min-h-full flex-col bg-muted/30">
      <DetailBody>
        <DetailTop backHref="/library/sources" backLabel="Sources" form={form} onSave={() => void save()} />
        <FormSection title="Details" description="How this source appears when you cite it.">
          <InputField control={form.control} name="title" label="Title" max={sourceLimits.title} />
          <dl className="m-0 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Type</dt>
              <dd className="m-0 text-foreground">{kinds[source.kind]}</dd>
            </div>
            {source.kind !== "link" ? (
              <div>
                <dt className="text-xs text-muted-foreground">Text read</dt>
                <dd className="m-0 text-foreground">{source.wordCount.toLocaleString()} words</dd>
              </div>
            ) : null}
            {source.file ? (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">File</dt>
                <dd className="m-0 text-foreground">
                  {source.file.name} · {(source.file.size / 1024).toFixed(0)} KB ·{" "}
                  <a href={`/library/sources/${source.id}/file`} className="text-foreground underline underline-offset-[0.2em] hover:text-primary-deep">
                    Download
                  </a>
                </dd>
              </div>
            ) : null}
            {source.url ? (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Link</dt>
                <dd className="m-0 break-all text-foreground">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-[0.2em] hover:text-primary-deep">
                    {source.url}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </FormSection>

        <FormSection title="Used in" description="Documents that have this source attached.">
          {used === 0 ? (
            <p className="m-0 text-sm text-muted-foreground">Not used in any document yet.</p>
          ) : (
            <ul className="m-0 grid list-none gap-1 p-0 text-sm">
              {source.documents.map((doc) => (
                <li key={doc.id}>
                  <Link href={`/documents/${doc.id}`} className="text-foreground underline underline-offset-[0.2em] hover:text-primary-deep">
                    {doc.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </FormSection>

        {source.kind !== "link" ? (
          <FormSection title="What Undocx reads" description="The text taken from this source.">
            <pre className="m-0 max-h-96 overflow-auto rounded-md border border-border bg-background p-3 font-sans text-sm leading-normal whitespace-pre-wrap text-foreground">{source.preview}</pre>
            {source.isTruncated ? <p className="m-0 text-xs text-muted-foreground">Showing the start. Undocx reads all of it.</p> : null}
          </FormSection>
        ) : null}
      </DetailBody>
    </div>
  );
}
