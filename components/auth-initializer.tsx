"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"

export function AuthInitializer() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
