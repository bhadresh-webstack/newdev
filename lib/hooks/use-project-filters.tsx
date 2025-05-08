"use client"

import { useState } from "react"
import { Project } from "../types"

export function useProjectFilters() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [relationshipFilter, setRelationshipFilter] = useState("all")

  // Get status text
  const getStatusText = (progress: number) => {
    if (progress >= 100) return "Completed"
    if (progress > 50) return "In Progress"
    return "Planning"
  }

  const filterProjects = (projects: Project[]) => {
    return projects
      .filter((project) => {
        // Apply status filter
        if (statusFilter !== "all") {
          const projectStatus = getStatusText(project.progress_percentage || 0)
          if (projectStatus !== statusFilter) {
            return false
          }
        }

        // Apply relationship filter for team members
        if (relationshipFilter !== "all") {
          if (relationshipFilter === "team" && !project.isTeamMember) {
            return false
          }
          if (relationshipFilter === "tasks" && !project.hasAssignedTasks) {
            return false
          }
        }

        // Apply search filter if needed
        if (searchQuery) {
          return project.title.toLowerCase().includes(searchQuery.toLowerCase())
        }

        return true
      })
      .sort((a, b) => {
        // Sort by date or progress
        if (sortOrder === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        } else if (sortOrder === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        } else if (sortOrder === "progress-high") {
          return (b.progress_percentage || 0) - (a.progress_percentage || 0)
        } else if (sortOrder === "progress-low") {
          return (a.progress_percentage || 0) - (b.progress_percentage || 0)
        }
        return 0
      })
  }

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    relationshipFilter,
    setRelationshipFilter,
    filterProjects,
    getStatusText,
  }
}
