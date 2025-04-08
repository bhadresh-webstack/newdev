import { create } from "zustand"
import { mockProjects } from "@/lib/mock-data"
import { ENDPOINT } from "../api/end-point"
import { apiRequest } from "../useApi"

type Project = {
  id: string
  title: string
  description: string
  status: string
  customer_id: string
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
}

type ProjectsState = {
  projects: Project[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchProjects: (query?: string) => Promise<void>

  getProjectById: (id: string) => Promise<{ data: Project | null; error: any | null }>
  getProjects: () => Promise<{ data: Project | null; error: any | null }>
  createProject: (
    newProject: Project,
  ) => Promise<{ data: Project | null; error: any | null }>
  updateProject: (id: string, updates: Partial<Project>) => Promise<{ data: Project | null; error: any | null }>
  deleteProject: (id: string) => Promise<{ error: any | null }>
  clearProjects: () => void
  clearError: () => void
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async (query?: string) => {
    try {
      set({ isLoading: true, error: null })

      // Simulate API delay
      const { data, error } = await apiRequest("GET", ENDPOINT.PROJECT.fetchProjects+query)
console.log("data",data)
      // Filter projects if query is provided
      const filteredProjects = query
        ? mockProjects.filter(
            (project) =>
              project.title.toLowerCase().includes(query.toLowerCase()) ||
              project.description.toLowerCase().includes(query.toLowerCase()),
          )
        : mockProjects

      set({ projects: filteredProjects, isLoading: false })
    } catch (error: any) {
      console.error("Error fetching projects:", error)
      set({
        error: error.message || "Failed to fetch projects",
        isLoading: false,
      })
    }
  },
  getProjectById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await apiRequest("GET", ENDPOINT.PROJECT.fetchProjects+id);

      if (error) {
        throw new Error(error);
      }

      set({ isLoading: false });

      return { data: data?.project, error: null };
    } catch (error: any) {
      console.error("Error fetching project:", error);

      set({
        isLoading: false,
        error: error.message || "Failed to fetch project",
      });

      return { data: null, error };
    }
  },

  getProjects: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await apiRequest("GET", ENDPOINT.PROJECT.getProjects);

      if (error) {
        throw new Error(error);
      }

      set({
        projects: data?.projects || [],
        isLoading: false,
      });

      return { data: data?.projects, error: null };
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      set({
        isLoading: false,
        error: error.message || "Failed to fetch projects",
      });

      return { data: null, error };
    }
  },



  createProject: async (newProject: Project) => {
    try {
      set({ isLoading: true, error: null })


      // Simulate API delay
      const response = await apiRequest("POST",ENDPOINT.PROJECT.create,newProject);

console.log("createProjectResponse",response)
      // Update local state
      // set((state) => ({
      //   projects: [newProject, ...state.projects],
      //   isLoading: false,
      // }))

      return { data: newProject, error: null }
    } catch (error: any) {
      console.error("Error creating project:", error)
      set({
        error: error.message || "Failed to create project",
        isLoading: false,
      })
      return { data: null, error }
    }
  },

  updateProject: async (id, updates) => {
    try {
      set({ isLoading: true, error: null })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find and update project
      const updatedProject = get().projects.find((p) => p.id === id)

      if (!updatedProject) {
        throw new Error("Project not found")
      }

      const updated = {
        ...updatedProject,
        ...updates,
        updated_at: new Date().toISOString(),
      }

      // Update local state
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updated : p)),
        isLoading: false,
      }))

      return { data: updated, error: null }
    } catch (error: any) {
      console.error("Error updating project:", error)
      set({
        error: error.message || "Failed to update project",
        isLoading: false,
      })
      return { data: null, error }
    }
  },

  deleteProject: async (id) => {
    try {
      set({ isLoading: true, error: null })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        isLoading: false,
      }))

      return { error: null }
    } catch (error: any) {
      console.error("Error deleting project:", error)
      set({
        error: error.message || "Failed to delete project",
        isLoading: false,
      })
      return { error }
    }
  },

  clearProjects: () => set({ projects: [] }),

  clearError: () => set({ error: null }),
}))
