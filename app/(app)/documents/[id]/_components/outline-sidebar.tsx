"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileTextIcon, LockIcon } from "~@/components/ui/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~@/components/ui/sidebar";
import { usePanel } from "./panel-context";
import type { proposal } from "./proposal";

function useCurrentSection() {
  const [current, setCurrent] = useState("1");
  useEffect(() => {
    const headings = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    const scroller = headings[0]?.closest<HTMLElement>("[data-scroller]");
    if (!scroller || headings.length === 0) return;
    const update = () => {
      const top = scroller.getBoundingClientRect().top + 96;
      const isAtBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
      let best = headings[0];
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= top) best = heading;
      }
      if (isAtBottom) best = headings[headings.length - 1];
      setCurrent(best.dataset.section ?? "1");
    };
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    return () => scroller.removeEventListener("scroll", update);
  }, []);
  return current;
}

export function OutlineSidebar({ doc }: { doc: typeof proposal }) {
  const { isFocus } = usePanel();
  const current = useCurrentSection();
  const locked = new Set<string>(doc.locked);
  return (
    <Sidebar side="left" collapsible={isFocus ? "offcanvas" : "icon"} aria-label="Document">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-4 group-data-[collapsible=icon]:px-0">
        <Link href="/documents" aria-label="All documents" className="flex items-center font-serif text-xl leading-none font-medium tracking-tight text-foreground no-underline group-data-[collapsible=icon]:justify-center">
          <span className="group-data-[collapsible=icon]:hidden">Undocx</span>
          <span className="hidden group-data-[collapsible=icon]:inline">U</span>
          <span className="text-primary">.</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Outline</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {doc.outline.map(([n, title]) => (
                <SidebarMenuItem key={n}>
                  <SidebarMenuButton render={<a href={`#s${n}`} />} isActive={current === n} tooltip={`${n}. ${title}`}>
                    <span className="w-4 shrink-0 text-center font-serif tabular-nums text-primary">{n}</span>
                    <span>{title}</span>
                  </SidebarMenuButton>
                  {locked.has(n) ? (
                    <SidebarMenuBadge>
                      <LockIcon className="size-3 text-primary" aria-label="Contains locked text" />
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="border-t border-sidebar-border">
          <SidebarGroupLabel>Sources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {doc.sources.map((source, index) => (
                <SidebarMenuItem key={source}>
                  <SidebarMenuButton tooltip={source}>
                    <span className="w-4 shrink-0 text-center font-medium tabular-nums text-primary group-data-[collapsible=icon]:hidden">{index + 1}</span>
                    <FileTextIcon className="hidden text-muted-foreground group-data-[collapsible=icon]:block" />
                    <span>{source}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Brief</SidebarGroupLabel>
          <SidebarGroupContent>
            <dl className="m-0 grid gap-y-2 px-2 text-sm">
              {doc.brief.map(([k, v]) => (
                <div key={k}>
                  <dt className="m-0 font-serif text-sm text-muted-foreground italic">{k}</dt>
                  <dd className="m-0 text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
