"use client"

import { useEffect } from "react"
import { useTasksStore } from "@/lib/stores/tasks-store"

export function useTaskFilters() {
  const {
    projectFilter,
    statusFilter,
    groupFilter,
    assigneeFilter,
    searchQuery,
    viewMode,
    taskGroups,
    statusSummary,
    setProjectFilter,
    setStatusFilter,
    setGroupFilter,
    setAssigneeFilter,
    setSearchQuery,
    setViewMode,
    fetchTaskGroups,
    fetchStatusSummary,
  } = useTasksStore()

  // Fetch task groups when project filter changes
  useEffect(() => {
    if (projectFilter) {
      fetchTaskGroups(projectFilter)
    } else {
      fetchTaskGroups()
    }
  }, [projectFilter, fetchTaskGroups])

  // Fetch status summary when filters change
  useEffect(() => {
    fetchStatusSummary(projectFilter, assigneeFilter)
  }, [projectFilter, assigneeFilter, fetchStatusSummary])

  const handleProjectFilterChange = (value: string) => {
    setProjectFilter(value)
    // Reset other filters when project changes
    if (groupFilter) setGroupFilter("")
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
  }

  const handleGroupFilterChange = (value: string) => {
    setGroupFilter(value)
  }

  const handleAssigneeFilterChange = (value: string) => {
    setAssigneeFilter(value)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const handleViewModeChange = (mode: "list" | "board") => {
    setViewMode(mode)
  }

  const clearFilters = () => {
    setProjectFilter("")
    setStatusFilter("")
    setGroupFilter("")
    setAssigneeFilter("")
    setSearchQuery("")
  }

  return {
    filters: {
      projectFilter,
      statusFilter,
      groupFilter,
      assigneeFilter,
      searchQuery,
      viewMode,
    },
    metadata: {
      taskGroups,
      statusSummary,
    },
    actions: {
      handleProjectFilterChange,
      handleStatusFilterChange,
      handleGroupFilterChange,
      handleAssigneeFilterChange,
      handleSearchChange,
      handleViewModeChange,
      clearFilters,
    },
  }
}
