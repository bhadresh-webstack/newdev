"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"

// Import the task store
import { useTasksStore, type Task } from "@/lib/stores/tasks-store"
import { useTaskOperations } from "@/lib/hooks/use-task-operations"
import { useTaskFilters } from "@/lib/hooks/use-task-filters"

// Import components
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet"
import { NewTaskForm } from "@/components/tasks/new-task-form"
import { TaskHeader } from "@/components/tasks/task-header"
import { FilterBar } from "@/components/tasks/filter-bar"
import { ViewToggle } from "@/components/tasks/view-toggle"
import { TaskList } from "@/components/tasks/task-list"
import { TaskBoard } from "@/components/tasks/task-board"

export default function TasksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  // Get tasks and actions from the store
  const { tasks, isLoading, error, fetchTasks, taskGroups: availableTaskGroups } = useTasksStore()

  // Get task operations
  const { isProcessing, handleCreateTask, handleUpdateTask, handleDeleteTask, handleUpdateTaskGroup } =
    useTaskOperations()

  // Get task filters
  const { filters, metadata, actions } = useTaskFilters()

  const [view, setView] = useState(searchParams.get("view") || "list")
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  // Add these state variables inside the TasksPage component, after the other state declarations
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  // Add state for the new task form
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false)
  const [isNewTaskFormOpen, setIsNewTaskFormOpen] = useState(false)
  const [isFilterBarVisible, setIsFilterBarVisible] = useState(false)

  // Initial load of tasks - only run once
  useEffect(() => {
    // Set initial state from URL parameters
    setView(searchParams.get("view") || "list")

    // Set loading state and fetch tasks
    fetchTasks()
  }, [fetchTasks, searchParams])

  // Handle URL parameter changes
  useEffect(() => {
    const project = searchParams.get("project") || ""
    const status = searchParams.get("status") || ""
    const group = searchParams.get("group") || ""
    const query = searchParams.get("q") || ""

    // Only update filters if they've actually changed
    if (project !== filters.projectFilter) {
      actions.handleProjectFilterChange(project)
    }

    if (status !== filters.statusFilter) {
      actions.handleStatusFilterChange(status)
    }

    if (group !== filters.groupFilter) {
      actions.handleGroupFilterChange(group)
    }

    if (query !== filters.searchQuery) {
      actions.handleSearchChange(query)
    }
  }, [searchParams, filters.projectFilter, filters.statusFilter, filters.groupFilter, filters.searchQuery, actions])

  // Update URL with filters
  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value === "all" || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }

      // Update the local state immediately
      if (key === "view") {
        setView(value)
      } else if (key === "project") {
        actions.handleProjectFilterChange(value === "all" ? "" : value)
      } else if (key === "status") {
        actions.handleStatusFilterChange(value === "all" ? "" : value)
      } else if (key === "group") {
        actions.handleGroupFilterChange(value === "all" ? "" : value)
      } else if (key === "q") {
        actions.handleSearchChange(value)
      }

      // Update the URL
      router.push(`/app/tasks?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, actions],
  )

  // Group tasks by task_group for board view
  const groupedTasks = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        const group = task.task_group || "Backlog"
        if (!acc[group]) {
          acc[group] = []
        }
        acc[group].push(task)
        return acc
      },
      {} as Record<string, Task[]>,
    )
  }, [tasks])

  // All possible task groups - use the ones from the API if available
  const taskGroups = useMemo(() => {
    return availableTaskGroups.length > 0 ? availableTaskGroups : ["Backlog", "To Do", "In Progress", "Review", "Done"]
  }, [availableTaskGroups])

  // Get initials from name
  const getInitials = useCallback((name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }, [])

  const handleDragStart = useCallback((e: React.DragEvent, task: Task, group: string) => {
    e.dataTransfer.setData("taskId", task.id)
    e.dataTransfer.setData("sourceGroup", group)
    setDraggedTask(task.id)

    // Add a delay to set opacity - this helps with the drag image
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = "0.4"
      }
    }, 0)
  }, [])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = "1"
    }
    setDraggedTask(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add("bg-accent/50")
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("bg-accent/50")
    }
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetGroup: string) => {
      e.preventDefault()
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.remove("bg-accent/50")
      }

      const taskId = e.dataTransfer.getData("taskId")
      const sourceGroup = e.dataTransfer.getData("sourceGroup")

      if (sourceGroup === targetGroup) return

      // Update the task group using the API
      await handleUpdateTaskGroup(taskId, targetGroup)
    },
    [handleUpdateTaskGroup],
  )

  // Add this function inside the TasksPage component, before the return statement
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task)
    setIsTaskDetailOpen(true)
  }, [])

  // Add this function inside the TasksPage component, before the return statement
  const handleTaskStatusChange = useCallback(
    async (taskId: string, newStatus: string) => {
      // Optimistically update the UI first
      const taskToUpdate = tasks.find((t) => t.id === taskId)
      if (taskToUpdate) {
        // Update the selected task if it's open in the detail view
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...selectedTask,
            status: newStatus,
          })
        }
      }

      // Then make the API call without reloading the page
      await handleUpdateTask(taskId, { status: newStatus })
    },
    [handleUpdateTask, tasks, selectedTask],
  )

  // Add this function inside the TasksPage component, before the return statement
  const getRelatedTasks = useCallback(
    (taskId: string, projectId: string) => {
      return tasks.filter((t) => t.project_id === projectId && t.id !== taskId)
    },
    [tasks],
  )

  return (
    <>
      {isLoading && tasks.length === 0 ? (
        <div className="space-y-8 animate-pulse">
          <div className="h-8 bg-muted rounded-md w-2/3"></div>
          <div className="h-4 bg-muted rounded-md w-1/2"></div>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="h-10 bg-muted rounded-md w-64"></div>
            <div className="h-10 bg-muted rounded-md w-32"></div>
            <div className="h-10 bg-muted rounded-md w-32"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header section */}
          <TaskHeader setIsNewTaskDialogOpen={setIsNewTaskDialogOpen} />

          {/* Filter bar */}
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
            <FilterBar
              filters={filters}
              isFilterBarVisible={isFilterBarVisible}
              setIsFilterBarVisible={setIsFilterBarVisible}
              updateFilters={updateFilters}
              taskGroups={taskGroups}
            />

            <div className="flex items-center">
              <ViewToggle view={view} updateFilters={updateFilters} />
            </div>
          </div>

          {/* Task list or board view */}
          {view === "list" ? (
            <TaskList
              tasks={tasks}
              handleTaskClick={handleTaskClick}
              handleTaskStatusChange={handleTaskStatusChange}
              getInitials={getInitials}
              setIsNewTaskDialogOpen={setIsNewTaskDialogOpen}
            />
          ) : (
            <TaskBoard
              taskGroups={taskGroups}
              groupedTasks={groupedTasks}
              handleTaskClick={handleTaskClick}
              getInitials={getInitials}
              draggedTask={draggedTask}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              setIsNewTaskFormOpen={setIsNewTaskFormOpen}
            />
          )}

          {/* Task detail sheet and forms */}
          {selectedTask && (
            <TaskDetailSheet
              task={selectedTask}
              isOpen={isTaskDetailOpen}
              onClose={() => setIsTaskDetailOpen(false)}
              onStatusChange={handleTaskStatusChange}
              relatedTasks={getRelatedTasks(selectedTask.id, selectedTask.project_id)}
              handleUpdateTask={handleUpdateTask}
            />
          )}

          <NewTaskForm
            isOpen={isNewTaskDialogOpen}
            onClose={() => setIsNewTaskDialogOpen(false)}
            onSubmit={handleCreateTask}
          />
          <NewTaskForm
            isOpen={isNewTaskFormOpen}
            onClose={() => setIsNewTaskFormOpen(false)}
            onSubmit={handleCreateTask}
          />
        </div>
      )}
    </>
  )
}
