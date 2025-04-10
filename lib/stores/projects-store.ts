"use client"

import { create } from "zustand"
import { apiRequest } from "@/lib/useApi"
import { ENDPOINT } from "../api/end-point"

export type Project = {
  id: string
  title: string
  description: string
  status: string
  customer_id: string
  customer_name?: string
  pricing_tier: string
  created_at: string
  updated_at: string
  progress_percentage?: number
  total_tasks?: number
  completed_tasks?: number
  technical_requirements?: string
  required_skills?: string
  deliverables?: string
  budget?: number
  payment_type?: string
  start_date?: string
  duration_days?: number
  priority?: string
  visibility?: string
  customer?: {
    id: string
    user_name: string
    email: string
    profile_image: string | null
  }
  tasks?: any[]
  feedbacks?: any[]
  files?: any[]
  _count?: {
    tasks: number
  }
}

export type ProjectStats = {
  totalProjects: number
  projectsByStatus: Record<string, number>
  projectsByPriority: Record<string, number>
  averageProgress: number
  totalTasks: number
  completedTasks: number
}

type ProjectsState = {
  projects: Project[]
  isLoading: boolean
  error: string | null
  stats: ProjectStats | null

  // Actions - Main Project Operations
  fetchProjects: (filters?: Record<string, string>) => Promise<{ data: Project[] | null; error: string | null }>
  getProjectById: (id: string) => Promise<{ data: Project | null; error: string | null }>
  createProject: (newProject: Partial<Project>) => Promise<{ data: Project | null; error: string | null }>
  updateProject: (id: string, updates: Partial<Project>) => Promise<{ data: Project | null; error: string | null }>
  deleteProject: (id: string) => Promise<{ error: string | null }>

  // Project Statistics
  fetchProjectStats: () => Promise<{ data: ProjectStats | null; error: string | null }>

  // Customer Projects
  fetchCustomerProjects: (
    customerId: string,
    filters?: Record<string, string>,
  ) => Promise<{ data: Project[] | null; error: string | null }>

  // Project Files
  fetchProjectFiles: (projectId: string) => Promise<{ data: any[] | null; error: string | null }>
  uploadProjectFile: (projectId: string, fileData: any) => Promise<{ data: any | null; error: string | null }>
  deleteProjectFile: (projectId: string, fileId: string) => Promise<{ error: string | null }>

  // Project Feedback
  fetchProjectFeedback: (projectId: string) => Promise<{ data: any[] | null; error: string | null }>
  addProjectFeedback: (projectId: string, feedbackData: any) => Promise<{ data: any | null; error: string | null }>
  updateFeedbackStatus: (
    projectId: string,
    feedbackId: string,
    status: string,
  ) => Promise<{ data: any | null; error: string | null }>

  // Project Messages
  fetchProjectMessages: (projectId: string) => Promise<{ data: any[] | null; error: string | null }>
  sendProjectMessage: (projectId: string, messageData: any) => Promise<{ data: any | null; error: string | null }>

  // Utility Functions
  clearProjects: () => void
  clearError: () => void
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,
  stats: null,

  // Main Project Operations
  fetchProjects: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null })

      // Build query string from filters
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })

      const queryString = queryParams.toString()
      const url = queryString ? `${ENDPOINT.PROJECT.base}?${queryString}` : ENDPOINT.PROJECT.base

      const { data, error } = await apiRequest<{ projects: Project[] }>("GET", url)

      if (error) {
        throw new Error(error)
      }

      set({
        projects: data?.projects || [],
        isLoading: false,
      })

      return { data: data?.projects || [], error: null }
    } catch (error: any) {
      console.error("Error fetching projects:", error)
      set({
        error: error.message || "Failed to fetch projects",
        isLoading: false,
      })
      return { data: null, error: error.message || "Failed to fetch projects" }
    }
  },

  getProjectById: async (id: string) => {
    try {
      set({ isLoading: true, error: null })

      const { data, error } = await apiRequest<Project>("GET", ENDPOINT.PROJECT.byId(id))

      if (error) {
        throw new Error(error)
      }

      set({ isLoading: false })

      return { data, error: null }
    } catch (error: any) {
      console.error("Error fetching project:", error)
      set({
        error: error.message || "Failed to fetch project",
        isLoading: false,
      })
      return { data: null, error: error.message || "Failed to fetch project" }
    }
  },

  createProject: async (newProject: Partial<Project>) => {
    try {
      set({ isLoading: true, error: null })

      const { data, error } = await apiRequest<Project>("POST", ENDPOINT.PROJECT.base, newProject)

      if (error) {
        throw new Error(error)
      }

      // Update local state with the new project
      set((state) => ({
        projects: data ? [data, ...state.projects] : state.projects,
        isLoading: false,
      }))

      return { data, error: null }
    } catch (error: any) {
      console.error("Error creating project:", error)
      set({
        error: error.message || "Failed to create project",
        isLoading: false,
      })
      return { data: null, error: error.message || "Failed to create project" }
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    try {
      set({ isLoading: true, error: null })

      const { data, error } = await apiRequest<Project>("PATCH", ENDPOINT.PROJECT.byId(id), updates)

      if (error) {
        throw new Error(error)
      }

      // Update local state
      if (data) {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
          isLoading: false,
        }))
      } else {
        set({ isLoading: false })
      }

      return { data, error: null }
    } catch (error: any) {
      console.error("Error updating project:", error)
      set({
        error: error.message || "Failed to update project",
        isLoading: false,
      })
      return { data: null, error: error.message || "Failed to update project" }
    }
  },

  deleteProject: async (id: string) => {
    try {
      set({ isLoading: true, error: null })

      // Optimistically remove from UI
      const originalProjects = [...get().projects]
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
      }))

      const { error } = await apiRequest("DELETE", ENDPOINT.PROJECT.byId(id))

      if (error) {
        // Restore original projects if there's an error
        set({ projects: originalProjects, isLoading: false })
        throw new Error(error)
      }

      set({ isLoading: false })
      return { error: null }
    } catch (error: any) {
      console.error("Error deleting project:", error)
      set({
        error: error.message || "Failed to delete project",
        isLoading: false,
      })
      return { error: error.message || "Failed to delete project" }
    }
  },

  // Project Statistics
  fetchProjectStats: async () => {
    try {
      set({ isLoading: true, error: null })

      const { data, error } = await apiRequest<ProjectStats>("GET", ENDPOINT.PROJECT.stats)

      if (error) {
        throw new Error(error)
      }

      set({
        stats: data,
        isLoading: false,
      })

      return { data, error: null }
    } catch (error: any) {
      console.error("Error fetching project statistics:", error)
      set({
        error: error.message || "Failed to fetch project statistics",
        isLoading: false,
      })
      return { data: null, error: error.message || "Failed to fetch project statistics" }
    }
  },

  // Customer Projects
  fetchCustomerProjects: async (customerId: string, filters = {}) => {
    try {
      set({ isLoading: true, error: null })

      // Build query string from filters
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })

      const queryString = queryParams.toString()
      const url = queryString
        ? `${ENDPOINT.PROJECT.byCustomer(customerId)}?${queryString}`
        : ENDPOINT.PROJECT.byCustomer(customerId)

      const { data, error } = await apiRequest<{ projects: Project[] }>("GET", url)

      if (error) {
        throw new Error(error)
      }

      set({ isLoading: false })

      return { data: data?.projects || [], error: null }
    } catch (error: any) {
      console.error("Error fetching customer projects:", error)
      set({
        error: error.message || "Failed to fetch customer projects",
        isLoading: false,
      })
      return { data: null, error: error.message || "Failed to fetch customer projects" }
    }
  },

  // Project Files
  fetchProjectFiles: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null })

      const { data, error } = await apiRequest<{ files: any[] }>("GET", ENDPOINT.PROJECT.files(projectId))

      if (error) {
        throw new Error(error)
      }

      set({ isLoading: false })

      return { data: data?.files || [], error: null }
    } catch (error: any) {
      console.error("Error fetching project files:", error)
      set({
        error: error.message || "Failed to fetch project files",
        isLoading: false,
      })
      return { data: null, error: error.message || "Failed to fetch project files" }
    }
  },

  uploadProjectFile: async (projectId: string, fileData: any) => {
    try {
      set({ isLoading: true, error: null })

      const { data, error } = await apiRequest<any>("POST", ENDPOINT.PROJECT.files(projectId), fileData)

      if (error) {
        throw new Error(error)
      }

      set({ isLoading: false })

      return { data, error: null }
    } catch (error: any) {
      console.error("Error uploading file:", error)
      set({
        error: error.message || "Failed to upload file",
        isLoading: false,
      })
      return { data: null, error: error.message || "Failed to upload file" }
    }
  },

  deleteProjectFile: async (projectId: string, fileId: string) => {
    try {
      set({ isLoading: true, error: null })

      const { error } = await apiRequest("DELETE", `${ENDPOINT.PROJECT.files(projectId)}/${fileId}`)

      if (error) {
        throw new Error(error)
      }

      set({ isLoading: false })

      return { error: null }
    } catch (error: any) {
      console.error("Error deleting file:", error)
      set({
        error: error.message || "Failed to delete file",
        isLoading: false,
      })
      return { error: error.message || "Failed to delete file" }
    }
  },

  // Project Feedback
  fetchProjectFeedback: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null })

      const { data, error } = await apiRequest<{ feedback: any[] }>("GET", ENDPOINT.PROJECT.feedback(projectId))

      if (error) {
        throw new Error(error)
      }

      set({ isLoading: false })

      return { data: data?.feedback || [], error: null }
    } catch (error: any) {
      console.error("Error fetching project feedback:", error)
      set({
        error: error.message || "Failed to fetch project feedback",
        isLoading: false,
      })
      return { data: null, error: error.message || "Failed to fetch project feedback" }
    }
  },

  addProjectFeedback: async (projectId: string, feedbackData: any) => {
    try {
      set({ isLoading: true, error: null })

      const { data, error } = await apiRequest<any>("POST", ENDPOINT.PROJECT.feedback(projectId), feedbackData)

      if (error) {
        throw new Error(error)
      }

      set({ isLoading: false })

      return { data, error: null }
    } catch (error: any) {
      console.error("Error adding feedback:", error)
      set({
        error: error.message || "Failed to add feedback",
        isLoading: false,
      })
      return { data: null, error: error.message || "Failed to add feedback" }
    }
  },

  updateFeedbackStatus: async (projectId: string, feedbackId: string, status: string) => {
    try {
      set({ isLoading: true, error: null })

      const { data, error } = await apiRequest<any>("PATCH", `${ENDPOINT.PROJECT.feedback(projectId)}/${feedbackId}`, {
        status,
      })

      if (error) {
        throw new Error(error)
      }

      set({ isLoading: false })

      return { data, error: null }
    } catch (error: any) {
      console.error("Error updating feedback status:", error)
      set({
        error: error.message || "Failed to update feedback status",
        isLoading: false,
      })
      return { data: null, error: error.message || "Failed to update feedback status" }
    }
  },

  // Project Messages
  fetchProjectMessages: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null })

      const { data, error } = await apiRequest<{ messages: any[] }>("GET", ENDPOINT.PROJECT.messages(projectId))

      if (error) {
        throw new Error(error)
      }

      set({ isLoading: false })

      return { data: data?.messages || [], error: null }
    } catch (error: any) {
      console.error("Error fetching project messages:", error)
      set({
        error: error.message || "Failed to fetch project messages",
        isLoading: false,
      })
      return { data: null, error: error.message || "Failed to fetch project messages" }
    }
  },

  sendProjectMessage: async (projectId: string, messageData: any) => {
    try {
      set({ isLoading: true, error: null })

      const { data, error } = await apiRequest<any>("POST", ENDPOINT.PROJECT.messages(projectId), messageData)

      if (error) {
        throw new Error(error)
      }

      set({ isLoading: false })

      return { data, error: null }
    } catch (error: any) {
      console.error("Error sending message:", error)
      set({
        error: error.message || "Failed to send message",
        isLoading: false,
      })
      return { data: null, error: error.message || "Failed to send message" }
    }
  },

  // Utility Functions
  clearProjects: () => set({ projects: [] }),
  clearError: () => set({ error: null }),
}))
