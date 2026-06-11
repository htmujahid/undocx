"use client"

import { useEffect, useState } from "react"

import { Workspace } from "@/components/workspace/workspace"
import { useUser } from "@/hooks/use-user"

import { data } from "./data"

export default function WorkspacePage() {
  const { user } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!user || !mounted) return null

  return <Workspace user={user} data={data} />
}
