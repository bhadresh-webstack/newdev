"use client"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

interface ProjectHeaderProps {
  userRole: string | undefined | null
}

export function ProjectHeader({ userRole }: ProjectHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your development projects efficiently</p>
      </div>
      {(userRole === "admin" || userRole === "customer") && (
        <Button
          onClick={() => router.push("/app/projects/new")}
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          New Project
        </Button>
      )}
    </div>
  )
}
