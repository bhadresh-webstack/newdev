"use client"

import type React from "react"

import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ProjectFormContainerProps {
  title: string
  subtitle: string
  onBack: () => void
  onSave?: () => void
  isSubmitting?: boolean
  showSaveButton?: boolean
  children: React.ReactNode
}

export function ProjectFormContainer({
  title,
  subtitle,
  onBack,
  onSave,
  isSubmitting = false,
  showSaveButton = false,
  children,
}: ProjectFormContainerProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {showSaveButton && onSave && (
          <Button
            onClick={onSave}
            disabled={isSubmitting}
            className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>
      {children}
    </div>
  )
}
