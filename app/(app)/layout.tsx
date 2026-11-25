export default function AppLayout({ children }: LayoutProps<"/"> ) {
  return <div className="h-dvh overflow-hidden bg-background font-sans text-foreground">{children}</div>;
}
