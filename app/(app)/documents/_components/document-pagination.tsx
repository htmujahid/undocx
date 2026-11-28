import Link from "next/link";
import { Button } from "~@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "~@/components/ui/icons";
import { listHref, type ListQuery } from "~@/lib/documents/list-query";

export function DocumentPagination({ query, page, pageCount }: { query: ListQuery; page: number; pageCount: number }) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pages" className="flex items-center justify-between gap-4">
      {page > 1 ? (
        <Button variant="secondary" size="sm" render={<Link href={listHref(query, { page: page - 1 })} rel="prev" />}>
          <ArrowLeftIcon />
          Previous
        </Button>
      ) : (
        <span />
      )}
      <p className="m-0 text-sm text-muted-foreground" aria-live="polite">
        Page {page} of {pageCount}
      </p>
      {page < pageCount ? (
        <Button variant="secondary" size="sm" render={<Link href={listHref(query, { page: page + 1 })} rel="next" />}>
          Next
          <ArrowRightIcon />
        </Button>
      ) : (
        <span />
      )}
    </nav>
  );
}
