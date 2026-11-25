export default function DocumentLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="h-14 shrink-0 shadow-[inset_0_-1px_0_var(--border)]" />
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:block" />
        <div className="flex min-w-0 flex-1 flex-col bg-muted/50">
          <div className="h-12 shrink-0 bg-background shadow-[inset_0_-1px_0_var(--border)]" />
          <div className="px-4 py-8 lg:px-10">
            <div className="mx-auto w-full max-w-[52rem] rounded-sm border border-border bg-card px-8 py-12 sm:px-14 sm:py-16">
              <div className="h-9 w-3/4 animate-pulse rounded-sm bg-muted" />
              <div className="mt-4 h-4 w-1/2 animate-pulse rounded-sm bg-muted" />
              <div className="mt-12 grid gap-3">
                <div className="h-4 animate-pulse rounded-sm bg-muted" />
                <div className="h-4 animate-pulse rounded-sm bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded-sm bg-muted" />
              </div>
            </div>
          </div>
        </div>
        <div className="hidden w-[22rem] shrink-0 border-l border-sidebar-border bg-sidebar md:block" />
      </div>
    </div>
  );
}
