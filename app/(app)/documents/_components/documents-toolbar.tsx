"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "~@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~@/components/ui/select";
import { organizeLimits } from "~@/lib/documents/limits";
import { listHref, sortOptions, type DocumentSort, type ListQuery } from "~@/lib/documents/list-query";

const searchDelay = 300;

export function DocumentsToolbar({ query }: { query: ListQuery }) {
  const router = useRouter();
  const [text, setText] = useState(query.q);
  const [seen, setSeen] = useState(query.q);
  if (seen !== query.q) {
    setSeen(query.q);
    if (query.q === "") setText("");
  }
  const latest = useRef(query);
  useEffect(() => {
    latest.current = query;
  });

  useEffect(() => {
    if (text.trim() === latest.current.q) return;
    const timer = setTimeout(() => router.replace(listHref(latest.current, { q: text.trim() })), searchDelay);
    return () => clearTimeout(timer);
  }, [text, router]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-48 flex-1">
        <Input type="search" aria-label="Search documents" value={text} onValueChange={setText} maxLength={organizeLimits.search} placeholder="Search titles and text" />
      </div>
      <Select value={query.sort} onValueChange={(next) => next && router.replace(listHref(query, { sort: next as DocumentSort }))}>
        <SelectLabel className="sr-only">Sort by</SelectLabel>
        <SelectTrigger className="h-9 w-44 border border-input bg-card px-3">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} label={option.label}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
