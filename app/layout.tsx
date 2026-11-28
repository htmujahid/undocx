import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { UserProvider } from "~@/components/auth/user-provider";
import { getOptionalUser } from "~@/lib/auth/session";
import { ThemeProvider } from "~@/components/theme-provider";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-newsreader",
});

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://undocx.app"),
  title: {
    default: "Undocx: AI writes it, you steer it",
    template: "%s · Undocx",
  },
  description:
    "A minimal document editor where AI drafts from your brief and outline, and you reshape it one paragraph at a time.",
  openGraph: {
    type: "website",
    siteName: "Undocx",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${newsreader.variable} ${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <UserProvider user={getOptionalUser()}>{children}</UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
