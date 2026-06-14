"use client"

import * as React from "react"

import {
  ArchiveIcon,
  ClockIcon,
  FileTextIcon,
  HomeIcon,
  LayoutGridIcon,
  LinkIcon,
  LogOutIcon,
  MessageSquareIcon,
  MoonIcon,
  PlusIcon,
  SettingsIcon,
  StarIcon,
  SunIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useQuery } from "@tanstack/react-query"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { signOut } from "@/lib/auth-client"
import { artifactsQueryOptions } from "@/lib/data/artifacts"
import { workspacesQueryOptions } from "@/lib/data/workspaces"

const NAV_ITEMS = [
  { icon: LayoutGridIcon, label: "All Items", path: "" },
  { icon: StarIcon, label: "Favorites", path: "/favorites" },
  { icon: ClockIcon, label: "Recent", path: "/recent" },
  { icon: ArchiveIcon, label: "Archive", path: "/archive" },
  { icon: MessageSquareIcon, label: "Chat", path: "/chat" },
] as const

type CommandPaletteContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const CommandPaletteContext =
  React.createContext<CommandPaletteContextValue | null>(null)

export function useCommandPalette() {
  const ctx = React.useContext(CommandPaletteContext)
  if (!ctx) {
    throw new Error(
      "useCommandPalette must be used within the CommandPalette provider"
    )
  }
  return ctx
}

export function CommandPalette({
  workspaceId,
  userId,
  children,
}: {
  workspaceId: string
  userId: string
  children?: React.ReactNode
}) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k") {
        return
      }
      if (!(event.metaKey || event.ctrlKey)) {
        return
      }

      event.preventDefault()
      setOpen((value) => !value)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const { data: artifacts = [] } = useQuery({
    ...artifactsQueryOptions(workspaceId),
    enabled: open,
  })
  const { data: workspaces = [] } = useQuery({
    ...workspacesQueryOptions,
    enabled: open,
  })

  const runCommand = React.useCallback((action: () => void) => {
    setOpen(false)
    action()
  }, [])

  const value = React.useMemo(() => ({ open, setOpen }), [open])

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            {NAV_ITEMS.map((item) => (
              <CommandItem
                key={item.label}
                value={`nav ${item.label}`}
                onSelect={() =>
                  runCommand(() =>
                    router.push(`/workspace/${workspaceId}${item.path}`)
                  )
                }
              >
                <item.icon />
                <span>{item.label}</span>
              </CommandItem>
            ))}
            <CommandItem
              value="new artifact create"
              onSelect={() =>
                runCommand(() => router.push(`/workspace/${workspaceId}/new`))
              }
            >
              <PlusIcon />
              <span>New Artifact</span>
            </CommandItem>
          </CommandGroup>

          {artifacts.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Artifacts">
                {artifacts.slice(0, 50).map((artifact) => (
                  <CommandItem
                    key={artifact.id}
                    value={`artifact ${artifact.title} ${artifact.id}`}
                    onSelect={() =>
                      runCommand(() =>
                        router.push(
                          `/workspace/${artifact.workspaceId}/artifacts/${artifact.id}`
                        )
                      )
                    }
                  >
                    <FileTextIcon />
                    <span className="truncate">
                      {artifact.title || "Untitled"}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {workspaces.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Workspaces">
                {workspaces.map((workspace) => (
                  <CommandItem
                    key={workspace.id}
                    value={`workspace ${workspace.name} ${workspace.id}`}
                    onSelect={() =>
                      runCommand(() =>
                        router.push(`/workspace/${workspace.id}`)
                      )
                    }
                  >
                    <LayoutGridIcon />
                    <span className="truncate">{workspace.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          <CommandGroup heading="Account">
            <CommandItem
              value="home workspaces"
              onSelect={() => runCommand(() => router.push("/workspace"))}
            >
              <HomeIcon />
              <span>Home</span>
            </CommandItem>
            <CommandItem
              value="account settings"
              onSelect={() => runCommand(() => router.push("/account"))}
            >
              <SettingsIcon />
              <span>Account settings</span>
            </CommandItem>
            <CommandItem
              value="toggle theme dark light"
              onSelect={() =>
                runCommand(() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                )
              }
            >
              {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
              <span>Toggle theme</span>
              <CommandShortcut>D</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="copy chat link"
              onSelect={() =>
                runCommand(() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/chat/${userId}`
                  )
                  toast.success("Chat link copied to clipboard")
                })
              }
            >
              <LinkIcon />
              <span>Copy chat link</span>
            </CommandItem>
            <CommandItem
              value="sign out log out"
              onSelect={() =>
                runCommand(async () => {
                  await signOut()
                  window.location.href = "/"
                })
              }
            >
              <LogOutIcon />
              <span>Sign out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </CommandPaletteContext.Provider>
  )
}
