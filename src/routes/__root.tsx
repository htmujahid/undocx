import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"

import { QueryClient } from "@tanstack/react-query"

import { TooltipProvider } from "@/components/ui/tooltip"
import { authUserQueryOptions } from "@/lib/queries/auth"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { Toaster } from "sonner"

import appCss from "../styles.css?url"

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: "Renderical",
        },
        {
          name: "description",
          content:
            "Renderical is an intelligent content generation and knowledge management platform that adapts its response layout to the nature of your content.",
        },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
    }),
    beforeLoad: async ({ context }) => {
      const user =
        await context.queryClient.ensureQueryData(authUserQueryOptions)

      return { user }
    },
    notFoundComponent: () => (
      <main className="container mx-auto p-4 pt-16">
        <h1>404</h1>
        <p>The requested page could not be found.</p>
      </main>
    ),
    shellComponent: RootDocument,
  }
)

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
