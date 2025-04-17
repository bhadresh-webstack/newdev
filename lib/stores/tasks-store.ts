"use client"

import { create } from "zustand"
import { apiRequest } from "@/lib/useApi" // Updated import path
import { debounce } from "@/lib/utils" // Add debounce utility
import { ENDPOINT } from "@/lib/api/end-point"

export type Task = {
  id: string
  project_id: string
  title: string
  description: string
  status: string
  task_group: string
  assigned_to: string | null
  created_at: string
  updated_at: string | null
  project?: {
    title: string
    customer?: {
      user_name: string
    }
  }
  assignee?: {
    id: string
    user_name: string
    profile_image: string | null
    email?: string
  }
  priority?: string
  due_date?: string | null
}

export type CreateTaskData = Omit<Task, "id" | "created_at" | "updated_at">

type TasksState = {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  taskGroups: string[]
  statusSummary: Record<string, number> | null

  // Filters
  projectFilter: string
  statusFilter: string
  groupFilter: string
  assigneeFilter: string
  searchQuery: string
  viewMode: "list" | "board"

  // Actions
  fetchTasks: () => Promise<void>
  fetchTaskGroups: (projectId?: string) => Promise<void>
  fetchStatusSummary: (projectId?: string, userId?: string) => Promise<void>
  getTask: (id: string) => Promise<Task | null>
  createTask: (task: CreateTaskData) => Promise<{ data: Task | null; error: string | null }>
  updateTask: (id: string, updates: Partial<Task>) => Promise<{ data: Task | null; error: string | null }>
  updateTaskGroup: (id: string, newGroup: string) => Promise<{ error: string | null }>
  deleteTask: (id: string) => Promise<{ error: string | null }>
  batchAssignTasks: (taskIds: string[], userId: string) => Promise<{ error: string | null }>
  batchUnassignTasks: (taskIds: string[]) => Promise<{ error: string | null }>
  setProjectFilter: (filter: string) => void
  setStatusFilter: (filter: string) => void
  setGroupFilter: (filter: string) => void
  setAssigneeFilter: (filter: string) => void
  setSearchQuery: (query: string) => void
  setViewMode: (mode: "list" | "board") => void
  clearTasks: () => void
  clearError: () => void
}

export const useTasksStore = create<TasksState>((set, get) => {
  // Create debounced fetch function to prevent excessive API calls
  const debouncedFetch = debounce(async () => {
    try {
      const { projectFilter, statusFilter, groupFilter, assigneeFilter, searchQuery } = get()
      set({ isLoading: true, error: null })

      // Build query parameters
      const params = new URLSearchParams()
      if (projectFilter) params.append("projectId", projectFilter)
      if (statusFilter) params.append("status", statusFilter)
      if (groupFilter) params.append("taskGroup", groupFilter)
      if (assigneeFilter) params.append("assignedTo", assigneeFilter)

      // Determine the endpoint based on filters
      let endpoint = ENDPOINT.TASK.base

      // If we're filtering by project specifically, use the project endpoint
      if (projectFilter && !assigneeFilter) {
        endpoint = ENDPOINT.TASK.byProject(projectFilter)
      }

      // If we're filtering by assignee specifically, use the user endpoint
      if (assigneeFilter && !projectFilter) {
        endpoint = ENDPOINT.TASK.byUser(assigneeFilter)
      }

      const queryString = params.toString()
      const url = queryString ? `${endpoint}?${queryString}` : endpoint

      const { data, error } = await apiRequest<Task[]>("GET", url)

      if (error) {
        throw new Error(error)
      }

      // Apply search filter client-side if needed
      let filteredTasks = data || []

      if (searchQuery && filteredTasks.length > 0) {
        const query = searchQuery.toLowerCase()
        filteredTasks = filteredTasks.filter(
          (task) => task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query),
        )
      }

      set({ tasks: filteredTasks, isLoading: false })
    } catch (error: any) {
      console.error("Error fetching tasks:", error)
      set({
        error: error.message || "Failed to fetch tasks",
        isLoading: false,
      })
    }
  }, 300) // 300ms debounce

  return {
    tasks: [],
    isLoading: false,
    error: null,
    taskGroups: [],
    statusSummary: null,

    // Default filters
    projectFilter: "",
    statusFilter: "",
    groupFilter: "",
    assigneeFilter: "",
    searchQuery: "",
    viewMode: "list",

    fetchTasks: async () => {
      try {
        // Set loading to true at the beginning
        set((state) => ({ ...state, isLoading: true, error: null }))

        const { projectFilter, statusFilter, groupFilter, assigneeFilter, searchQuery } = get()

        // Build query parameters
        const params = new URLSearchParams()
        if (projectFilter) params.append("projectId", projectFilter)
        if (statusFilter) params.append("status", statusFilter)
        if (groupFilter) params.append("taskGroup", groupFilter)
        if (assigneeFilter) params.append("assignedTo", assigneeFilter)

        // Determine the endpoint based on filters
        let endpoint = ENDPOINT.TASK.base

        // If we're filtering by project specifically, use the project endpoint
        if (projectFilter && !assigneeFilter) {
          endpoint = ENDPOINT.TASK.byProject(projectFilter)
        }

        // If we're filtering by assignee specifically, use the user endpoint
        if (assigneeFilter && !projectFilter) {
          endpoint = ENDPOINT.TASK.byUser(assigneeFilter)
        }

        const queryString = params.toString()
        const url = queryString ? `${endpoint}?${queryString}` : endpoint

        const { data, error } = await apiRequest<Task[]>("GET", url)

        if (error) {
          throw new Error(error)
        }

        // Apply search filter client-side if needed
        let filteredTasks = data || []

        if (searchQuery && filteredTasks.length > 0) {
          const query = searchQuery.toLowerCase()
          filteredTasks = filteredTasks.filter(
            (task) => task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query),
          )
        }

        // Set the tasks and set loading to false
        set((state) => ({ ...state, tasks: filteredTasks, isLoading: false }))
      } catch (error: any) {
        console.error("Error fetching tasks:", error)
        set((state) => ({
          ...state,
          error: error.message || "Failed to fetch tasks",
          isLoading: false, // Make sure to set loading to false even on error
        }))
      }
    },

    fetchTaskGroups: async (projectId?: string) => {
      try {
        set((state) => ({ ...state, isLoading: true }))

        const url = projectId ? `${ENDPOINT.TASK.groups}?projectId=${projectId}` : ENDPOINT.TASK.groups

        const { data, error } = await apiRequest<string[]>("GET", url)

        if (error) {
          throw new Error(error)
        }

        set((state) => ({
          ...state,
          taskGroups: data || [],
          isLoading: false,
        }))
      } catch (error: any) {
        console.error("Error fetching task groups:", error)
        set((state) => ({
          ...state,
          error: error.message || "Failed to fetch task groups",
          isLoading: false,
        }))
      }
    },

    fetchStatusSummary: async (projectId?: string, userId?: string) => {
      try {
        let url = ENDPOINT.TASK.statusSummary
        const params = new URLSearchParams()

        if (projectId) params.append("projectId", projectId)
        if (userId) params.append("userId", userId)

        const queryString = params.toString()
        if (queryString) url += `?${queryString}`

        const { data, error } = await apiRequest<Record<string, number>>("GET", url)

        if (error) {
          throw new Error(error)
        }

        set((state) => ({ ...state, statusSummary: data || null }))
      } catch (error: any) {
        console.error("Error fetching status summary:", error)
        set((state) => ({ ...state, error: error.message || "Failed to fetch status summary" }))
      }
    },

    getTask: async (id) => {
      try {
        set((state) => ({ ...state, isLoading: true, error: null }))

        const { data, error } = await apiRequest<Task>("GET", ENDPOINT.TASK.byId(id))

        set((state) => ({ ...state, isLoading: false }))

        if (error) {
          throw new Error(error)
        }

        return data
      } catch (error: any) {
        console.error("Error fetching task:", error)
        set((state) => ({
          ...state,
          error: error.message || "Failed to fetch task",
          isLoading: false,
        }))
        return null
      }
    },

    createTask: async (task) => {
      try {
        set((state) => ({ ...state, isLoading: true, error: null }))

        const { data, error } = await apiRequest<Task>("POST", ENDPOINT.TASK.base, task)

        if (error) {
          throw new Error(error)
        }

        // Update local state if successful
        if (data) {
          set((state) => ({
            ...state,
            tasks: [data, ...state.tasks],
            isLoading: false,
          }))
        } else {
          set((state) => ({ ...state, isLoading: false }))
        }

        return { data, error: null }
      } catch (error: any) {
        console.error("Error creating task:", error)
        set((state) => ({
          ...state,
          error: error.message || "Failed to create task",
          isLoading: false,
        }))
        return { data: null, error: error.message || "Failed to create task" }
      }
    },

    updateTask: async (id, updates) => {
      try {
        console.log("Updating task in store:", id, updates)

        // Optimistically update the UI first
        set((state) => ({
          ...state,
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))

        // Then make the API call
        const { data, error } = await apiRequest<Task>("PATCH", ENDPOINT.TASK.byId(id), updates)

        if (error) {
          // Revert the optimistic update if there's an error
          await get().fetchTasks()
          throw new Error(error)
        }

        // If successful, ensure the state is updated with the returned data
        if (data) {
          set((state) => ({
            ...state,
            tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
          }))
        }

        return { data, error: null }
      } catch (error: any) {
        console.error("Error updating task:", error)
        set((state) => ({
          ...state,
          error: error.message || "Failed to update task",
        }))
        return { data: null, error: error.message || "Failed to update task" }
      }
    },

    updateTaskGroup: async (id, newGroup) => {
      try {
        // Optimistically update the UI first
        set((state) => ({
          ...state,
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, task_group: newGroup } : t)),
        }))

        // Then make the API call
        const { data, error } = await apiRequest<Task>("PATCH", ENDPOINT.TASK.byId(id), { task_group: newGroup })

        if (error) {
          // Revert the optimistic update if there's an error
          await get().fetchTasks()
          throw new Error(error)
        }

        return { error: null }
      } catch (error: any) {
        console.error("Error updating task group:", error)
        set((state) => ({
          ...state,
          error: error.message || "Failed to update task group",
        }))
        return { error: error.message || "Failed to update task group" }
      }
    },

    deleteTask: async (id) => {
      try {
        // Optimistically remove from UI
        const originalTasks = [...get().tasks]
        set((state) => ({
          ...state,
          tasks: state.tasks.filter((t) => t.id !== id),
        }))

        const { error } = await apiRequest("DELETE", ENDPOINT.TASK.byId(id))

        if (error) {
          // Restore original tasks if there's an error
          set((state) => ({
            ...state,
            tasks: originalTasks,
          }))
          throw new Error(error)
        }

        return { error: null }
      } catch (error: any) {
        console.error("Error deleting task:", error)
        set((state) => ({
          ...state,
          error: error.message || "Failed to delete task",
        }))
        return { error: error.message || "Failed to delete task" }
      }
    },

    batchAssignTasks: async (taskIds, userId) => {
      try {
        set((state) => ({ ...state, isLoading: true, error: null }))

        const { error } = await apiRequest("PATCH", ENDPOINT.TASK.batchAssign(userId), {
          taskIds,
          action: "assign",
        })

        if (error) {
          throw new Error(error)
        }

        // Update local state
        set((state) => ({
          ...state,
          tasks: state.tasks.map((task) => (taskIds.includes(task.id) ? { ...task, assigned_to: userId } : task)),
          isLoading: false,
        }))

        return { error: null }
      } catch (error: any) {
        console.error("Error assigning tasks:", error)
        set((state) => ({
          ...state,
          error: error.message || "Failed to assign tasks",
          isLoading: false,
        }))
        return { error: error.message || "Failed to assign tasks" }
      }
    },

    batchUnassignTasks: async (taskIds) => {
      try {
        set((state) => ({ ...state, isLoading: true, error: null }))

        // We need a user ID for the API route, but we're unassigning, so we can use any valid user ID
        // The action parameter is what matters here
        const anyTaskWithAssignee = get().tasks.find((t) => t.assigned_to && taskIds.includes(t.id))

        if (!anyTaskWithAssignee || !anyTaskWithAssignee.assigned_to) {
          throw new Error("No assigned user found for these tasks")
        }

        const { error } = await apiRequest("PATCH", ENDPOINT.TASK.batchAssign(anyTaskWithAssignee.assigned_to), {
          taskIds,
          action: "unassign",
        })

        if (error) {
          throw new Error(error)
        }

        // Update local state
        set((state) => ({
          ...state,
          tasks: state.tasks.map((task) => (taskIds.includes(task.id) ? { ...task, assigned_to: null } : task)),
          isLoading: false,
        }))

        return { error: null }
      } catch (error: any) {
        console.error("Error unassigning tasks:", error)
        set((state) => ({
          ...state,
          error: error.message || "Failed to unassign tasks",
          isLoading: false,
        }))
        return { error: error.message || "Failed to unassign tasks" }
      }
    },

    setProjectFilter: (filter) => {
      set((state) => ({ ...state, projectFilter: filter }))
      debouncedFetch()
    },

    setStatusFilter: (filter) => {
      set((state) => ({ ...state, statusFilter: filter }))
      debouncedFetch()
    },

    setGroupFilter: (filter) => {
      set((state) => ({ ...state, groupFilter: filter }))
      debouncedFetch()
    },

    setAssigneeFilter: (filter) => {
      set((state) => ({ ...state, assigneeFilter: filter }))
      debouncedFetch()
    },

    setSearchQuery: (query) => {
      set((state) => ({ ...state, searchQuery: query }))
      debouncedFetch()
    },

    setViewMode: (mode) => set((state) => ({ ...state, viewMode: mode })),

    clearTasks: () => set((state) => ({ ...state, tasks: [] })),

    clearError: () => set((state) => ({ ...state, error: null })),
  }
})
