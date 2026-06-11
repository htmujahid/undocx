"use client"

import { createContext, useContext, useState } from "react"

import { useRouter } from "next/navigation"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { signOut } from "@/lib/auth-client"

import { AppSidebar } from "./app-sidebar"

interface SelectionContextValue {
  selectedFolderId: string | null
  setSelectedFolderId: (id: string | null) => void
  selectedCollectionId: string | null
  setSelectedCollectionId: (id: string | null) => void
}

const SelectionContext = createContext<SelectionContextValue>({
  selectedFolderId: null,
  setSelectedFolderId: () => {},
  selectedCollectionId: null,
  setSelectedCollectionId: () => {},
})

export function useFolderSelection() {
  return useContext(SelectionContext)
}

interface WorkspaceSidebarLayoutProps {
  workspaceId: string
  user: { name: string; email: string; image?: string | null }
  children: React.ReactNode
}

export function WorkspaceSidebarLayout({
  workspaceId,
  user,
  children,
}: WorkspaceSidebarLayoutProps) {
  const router = useRouter()
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)

  const handleFolderSelect = (id: string | null) => {
    setSelectedFolderId(id)
    setSelectedCollectionId(null)
  }

  const handleCollectionSelect = (id: string | null) => {
    setSelectedCollectionId(id)
    setSelectedFolderId(null)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <SelectionContext.Provider
      value={{ selectedFolderId, setSelectedFolderId, selectedCollectionId, setSelectedCollectionId }}
    >
      <SidebarProvider>
        <AppSidebar
          user={user}
          workspaceId={workspaceId}
          onSignOut={handleSignOut}
          selectedFolderId={selectedFolderId}
          onFolderSelect={handleFolderSelect}
          selectedCollectionId={selectedCollectionId}
          onCollectionSelect={handleCollectionSelect}
        />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </SelectionContext.Provider>
  )
}
