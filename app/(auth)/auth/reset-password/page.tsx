"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") ?? ""

  useEffect(() => {
    if (!token) {
      router.replace("/auth/forgot-password")
    }
  }, [token, router])

  if (!token) return null

  return <ResetPasswordForm token={token} />
}
