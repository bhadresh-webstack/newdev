"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"
import { Sidebar3D } from "@/components/dashboard/sidebar-3d"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { initialize, isAuthenticated, isLoading, user, error } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const router = useRouter()

  console.log("user",user)
  // Initialize auth on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initialize()
      } catch (err) {
        console.error("Failed to initialize auth:", err)
      } finally {
        setIsInitialized(true)
      }
    }

    init()
  }, [initialize])

  // Handle sidebar collapse state for dashboard content margin
  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setIsSidebarCollapsed(e.detail.collapsed)
    }

    // Add type assertion and null check
    if (typeof window !== "undefined") {
      window.addEventListener("sidebar-toggle" as any, handleSidebarToggle as EventListener)

      // Check initial screen size
      const checkScreenSize = () => {
        if (window.innerWidth < 1024) {
          setIsSidebarCollapsed(true)
        }
      }

      checkScreenSize()
      window.addEventListener("resize", checkScreenSize)

      return () => {
        window.removeEventListener("sidebar-toggle" as any, handleSidebarToggle as EventListener)
        window.removeEventListener("resize", checkScreenSize)
      }
    }
  }, [])

  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-purple-600 opacity-75 blur-sm"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-background">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
          <p className="text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Render the app with the profile
  return (
      <div className="min-h-screen bg-background">
        {/* Sidebar - visible on all screens but with different behavior */}
        <Sidebar3D mobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        {/* Main content area - adjusts based on sidebar state */}
        <div
          className={`transition-all duration-300 min-h-screen
            lg:ml-20 ${!isSidebarCollapsed ? "lg:ml-64" : "lg:ml-20"}`}
        >
          <DashboardHeader
            user={
              user || {
                id: "demo-user",
                full_name: "Demo User",
                avatar_url: "/placeholder.svg?height=40&width=40",
                email: "demo@example11.com",
              }
            }
            className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />
          <main className="p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
  )
}
