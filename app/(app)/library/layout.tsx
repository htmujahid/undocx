import { LibraryHeader } from "./_components/library-header";

export default function LibraryLayout({ children }: LayoutProps<"/library">) {
  return (
    <div className="flex h-full flex-col">
      <LibraryHeader />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
