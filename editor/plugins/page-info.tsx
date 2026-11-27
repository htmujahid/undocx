"use client";

import { paperSizes, usePageCount, usePageSettings } from "../extensions/page";

export function PageInfo() {
  const page = usePageSettings();
  const pages = usePageCount();
  if (page.layout === "pageless") return <span>Pageless</span>;
  return (
    <span>
      {paperSizes[page.paper].label} · {page.orientation === "landscape" ? "Landscape" : "Portrait"} · {pages} {pages === 1 ? "page" : "pages"}
    </span>
  );
}

