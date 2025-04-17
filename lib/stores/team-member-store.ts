import { create } from "zustand"
import { apiRequest } from "../useApi"
import { ENDPOINT } from "../api/end-point"
import { TeamMember } from "@/lib/types"

type TeamMemberState = {
  teamMemberList: TeamMember[] | null
  isLoading: boolean
  error: string | null

  // Actions
  initialize: () => Promise<void>
  createTeamMember: (data: {
    email: string
    team_role: string
    department: string
    fullName: string
  }) => Promise<{ data: any | ""; error: any | null }>
  getAllTeamMember: () => Promise<{ data: any[] | null; error: any | null }>
  clearError: () => void
}

export const useTeamMemberStore = create<TeamMemberState>((set, get) => ({
  teamMemberList: null,
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true })
    try {
      const { data, error } = await apiRequest("GET", ENDPOINT.AUTH.allTeamMember)
      set({ teamMemberList: data?.team_members || [], isLoading: false, error })
    } catch (err) {
      set({ isLoading: false, error: "Failed to initialize team members" })
    }
  },

  createTeamMember: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const { email, team_role, department, fullName } = data
      const response = await apiRequest("POST", ENDPOINT.AUTH.teamMemberCreate, {
        user_name: fullName,
        password: "123456789",
        email,
        team_role,
        department,
      })

      if (response.error) {
        set({ isLoading: false, error: response.error })
        return { data: "", error: response.error }
      }

      // Update the team member list with the new member
      const currentList = get().teamMemberList || []
      if (response.data && response.data.team_member) {
        set({
          teamMemberList: [...currentList, response.data.team_member],
          isLoading: false,
          error: null,
        })
      }

      set({ isLoading: false, error: null })
      return { data: response?.data || "", error: null }
    } catch (err) {
      set({ isLoading: false, error: "Failed to create team member" })
      return { data: "", error: "Failed to create team member" }
    }
  },

  getAllTeamMember: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await apiRequest("GET", ENDPOINT.AUTH.allTeamMember)
      const teamMembers = data?.team_members || []

      set({
        isLoading: false,
        teamMemberList: teamMembers,
        error,
      })

      return { data: teamMembers, error }
    } catch (err) {
      set({ isLoading: false, error: "Failed to fetch team members" })
      return { data: null, error: "Failed to fetch team members" }
    }
  },

  clearError: () => set({ error: null }),
}))
