import { create } from "zustand"
import { mockTasks } from "@/lib/mock-data"

type Task = {
  id: string
  project_id: string
  title: string
  description: string
  status: string
  task_group: string
  assigned_to: string | null
  created_at: string
  updated_at: string
  projects?: {
    id: string
    title: string
  }
  assigned_to_profile?: {
    id: string
    first_name: string
    last_name: string
    profile_image: string | null
  }
}

type TasksState = {
  tasks: Task[]
  isLoading: boolean
  error: string | null

  // Filters
  projectFilter: string
  statusFilter: string
  groupFilter: string
  searchQuery: string
  viewMode: "list" | "board"

  // Actions
  fetchTasks: () => Promise<void>
  getTask: (id: string) => Promise<Task | null>
  createTask: (
    task: Omit<Task, "id" | "created_at" | "updated_at">,
  ) => Promise<{ data: Task | null; error: any | null }>
  updateTask: (id: string, updates: Partial<Task>) => Promise<{ data: Task | null; error: any | null }>
  updateTaskGroup: (id: string, newGroup: string) => Promise<{ error: any | null }>
  deleteTask: (id: string) => Promise<{ error: any | null }>
  setProjectFilter: (filter: string) => void
  setStatusFilter: (filter: string) => void
  setGroupFilter: (filter: string) => void
  setSearchQuery: (query: string) => void
  setViewMode: (mode: "list" | "board") => void
  clearTasks: () => void
  clearError: () => void
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  // Default filters
  projectFilter: "all",
  statusFilter: "all",
  groupFilter: "all",
  searchQuery: "",
  viewMode: "list",

  fetchTasks: async () => {
    try {
      const { projectFilter, statusFilter, groupFilter, searchQuery } = get()

      set({ isLoading: true, error: null })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Apply filters
      let filteredTasks = [...mockTasks]

      if (projectFilter !== "all") {
        filteredTasks = filteredTasks.filter((task) => task.project_id === projectFilter)
      }

      if (statusFilter !== "all") {
        filteredTasks = filteredTasks.filter((task) => task.status === statusFilter)
      }

      if (groupFilter !== "all") {
        filteredTasks = filteredTasks.filter((task) => task.task_group === groupFilter)
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredTasks = filteredTasks.filter(
          (task) => task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query),
        )
      }

      // Sort by updated_at
      filteredTasks.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

      set({ tasks: filteredTasks, isLoading: false })
    } catch (error: any) {
      console.error("Error fetching tasks:", error)
      set({
        error: error.message || "Failed to fetch tasks",
        isLoading: false,
      })
    }
  },

  getTask: async (id) => {
    try {
      // Find task by ID
      const task = mockTasks.find((t) => t.id === id) || null
      return task
    } catch (error) {
      console.error("Error fetching task:", error)
      return null
    }
  },

  createTask: async (task) => {
    try {
      set({ isLoading: true, error: null })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newTask = {
        id: Date.now().toString(),
        ...task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        projects: mockTasks.find((t) => t.project_id === task.project_id)?.projects,
        assigned_to_profile: {
          id: "mock-user-id",
          first_name: "John",
          last_name: "Doe",
          profile_image: null,
        },
      }

      // Update local state
      set((state) => ({
        tasks: [newTask, ...state.tasks],
        isLoading: false,
      }))

      return { data: newTask, error: null }
    } catch (error: any) {
      console.error("Error creating task:", error)
      set({
        error: error.message || "Failed to create task",
        isLoading: false,
      })
      return { data: null, error }
    }
  },

  updateTask: async (id, updates) => {
    try {
      set({ isLoading: true, error: null })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find and update task
      const task = get().tasks.find((t) => t.id === id)

      if (!task) {
        throw new Error("Task not found")
      }

      const updatedTask = {
        ...task,
        ...updates,
        updated_at: new Date().toISOString(),
      }

      // Update local state
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        isLoading: false,
      }))

      return { data: updatedTask, error: null }
    } catch (error: any) {
      console.error("Error updating task:", error)
      set({
        error: error.message || "Failed to update task",
        isLoading: false,
      })
      return { data: null, error }
    }
  },

  updateTaskGroup: async (id, newGroup) => {
    try {
      // Find and update task
      const task = get().tasks.find((t) => t.id === id)

      if (!task) {
        throw new Error("Task not found")
      }

      // Update local state
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, task_group: newGroup } : t)),
      }))

      return { error: null }
    } catch (error: any) {
      console.error("Error updating task group:", error)
      return { error }
    }
  },

  deleteTask: async (id) => {
    try {
      set({ isLoading: true, error: null })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        isLoading: false,
      }))

      return { error: null }
    } catch (error: any) {
      console.error("Error deleting task:", error)
      set({
        error: error.message || "Failed to delete task",
        isLoading: false,
      })
      return { error }
    }
  },

  setProjectFilter: (filter) => {
    set({ projectFilter: filter })
    get().fetchTasks()
  },

  setStatusFilter: (filter) => {
    set({ statusFilter: filter })
    get().fetchTasks()
  },

  setGroupFilter: (filter) => {
    set({ groupFilter: filter })
    get().fetchTasks()
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
    get().fetchTasks()
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  clearTasks: () => set({ tasks: [] }),

  clearError: () => set({ error: null }),
}))

