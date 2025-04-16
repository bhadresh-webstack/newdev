import { create } from "zustand"
import { apiRequest } from "../useApi"
// import { ENDPOINT } from "../constants/endpoints"

// Import the server action
import { getServerSideProfile } from "@/lib/server/auth-actions"
import { ENDPOINT } from "../api/end-point"


type AuthState = {
  user: any | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  initialize: () => Promise<boolean>
  signIn: (email: string, password: string) => Promise<{ data: any | null; error: string | null }>
  signUp: (email: string, userName?: string) => Promise<{ data: any | null; error: string | null }>
  signOut: () => Promise<void>
  forgotPassword: (email: string) => Promise<{ error: string | null }>
  resetPassword: (token: string, newPassword: string) => Promise<{ error: string | null }>
  verifyToken: (token: string) => Promise<{ data: any | null; error: string | null }>
  loadProfile: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ✅ Initialize Session on Page Load
  initialize: async () => {
    try {
      set({ isLoading: true })

      const result = await getServerSideProfile()

      if (result.success && result.user) {
        set({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
        return true
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: result.error || null,
        })
        return false
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error)
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Authentication failed",
      })
      return false
    }
  },

  // ✅ Sign In
  signIn: async (email, password) => {
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await apiRequest("POST", ENDPOINT.AUTH.signIn, {
        email,
        password,
      })

      if (error) {
        set({ isLoading: false, error })
        return { data: null, error }
      }

      // After successful sign in, load the profile directly from the database
      const profileResult = await getServerSideProfile()

      if (profileResult.success && profileResult.user) {
        set({
          user: profileResult.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      } else {
        // If we can't get the profile, still set the user from the sign in response
        set({
          user: data?.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      }

      return { data, error: null }
    } catch (error: any) {
      console.error("Sign in error:", error)
      // Provide more specific error message
      const errorMessage = error.message || "Failed to sign in. Please check your network connection and try again."
      set({ isLoading: false, error: errorMessage })
      return { data: null, error: errorMessage }
    }
  },

  // ✅ Sign Up
  signUp: async (email, userName) => {
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await apiRequest("POST", ENDPOINT.AUTH.signUp, {
        email,
        user_name: userName || email.split("@")[0],
      })

      if (error) {
        set({ isLoading: false, error })
        return { data: null, error }
      }

      set({ isLoading: false, error: null })
      return { data, error: null }
    } catch (error: any) {
      console.error("Sign up error:", error)
      const errorMessage = error.message || "Failed to sign up"
      set({ isLoading: false, error: errorMessage })
      return { data: null, error: errorMessage }
    }
  },

  // ✅ Verify Token
  verifyToken: async (token) => {
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await apiRequest("POST", ENDPOINT.AUTH.verifyToken, { token })

      set({ isLoading: false })

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error: any) {
      console.error("Token verification error:", error)
      const errorMessage = error.message || "Failed to verify token"
      set({ isLoading: false })
      return { data: null, error: errorMessage }
    }
  },

  // ✅ Forgot Password
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null })

    try {
      const { error } = await apiRequest("POST", ENDPOINT.AUTH.forgotPassword, { email })

      set({ isLoading: false, error: error || null })
      return { error: error || null }
    } catch (error: any) {
      console.error("Forgot password error:", error)
      const errorMessage = error.message || "Failed to process forgot password request"
      set({ isLoading: false, error: errorMessage })
      return { error: errorMessage }
    }
  },

  // ✅ Reset Password
  resetPassword: async (token, newPassword) => {
    set({ isLoading: true, error: null })

    try {
      const { error } = await apiRequest("POST", ENDPOINT.AUTH.resetPassword, {
        token,
        password: newPassword,
      })

      set({ isLoading: false, error: error || null })
      return { error: error || null }
    } catch (error: any) {
      console.error("Reset password error:", error)
      const errorMessage = error.message || "Failed to reset password"
      set({ isLoading: false, error: errorMessage })
      return { error: errorMessage }
    }
  },

  // ✅ Load Profile
  loadProfile: async () => {
    try {
      set({ isLoading: true })

      const profileResult = await getServerSideProfile()

      if (profileResult.success && profileResult.user) {
        set({
          user: profileResult.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      } else {
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: profileResult.error || null,
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: "Failed to load profile",
      })
    }
  },

  // ✅ Logout
  signOut: async () => {
    set({ isLoading: true })
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    try {
      const { error } = await apiRequest("POST", ENDPOINT.AUTH.signOut)

      // Even if there's an error, we should still clear the local state
      set({
        user: null,
        isAuthenticated: false,
      })

      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    } catch (error) {
      console.error("Sign out error:", error)

      // Still clear the state even if there's an error
      set({
        user: null,
        isAuthenticated: false,
      })
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      // Redirect to login page
    }finally{
     set({
      isLoading: false,
     })
    }
  },

  // ✅ Clear Error
  clearError: () => set({ error: null }),
}))
