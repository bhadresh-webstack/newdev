"use client"

import type React from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProjectFormTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  handleNextTab: () => void
  handlePrevTab: () => void
  formErrors: {
    details: boolean
    requirements: boolean
    budget: boolean
    timeline: boolean
  }
  children: React.ReactNode
  showReviewTab?: boolean
}

export function ProjectFormTabs({
  activeTab,
  setActiveTab,
  handleNextTab,
  handlePrevTab,
  formErrors,
  children,
  showReviewTab = true,
}: ProjectFormTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className={`grid ${showReviewTab ? "grid-cols-5" : "grid-cols-4"} h-auto p-1`}>
        <TabsTrigger value="details" className={`py-2.5 ${formErrors.details ? "text-red-500" : ""}`}>
          Details
        </TabsTrigger>
        <TabsTrigger value="requirements" className={`py-2.5 ${formErrors.requirements ? "text-red-500" : ""}`}>
          Requirements
        </TabsTrigger>
        <TabsTrigger value="budget" className={`py-2.5 ${formErrors.budget ? "text-red-500" : ""}`}>
          Budget
        </TabsTrigger>
        <TabsTrigger value="timeline" className={`py-2.5 ${formErrors.timeline ? "text-red-500" : ""}`}>
          Timeline
        </TabsTrigger>
        {showReviewTab && (
          <TabsTrigger value="review" className="py-2.5">
            Review
          </TabsTrigger>
        )}
      </TabsList>

      {children}
    </Tabs>
  )
}
