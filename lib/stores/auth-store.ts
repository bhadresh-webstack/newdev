import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiRequest } from '../useApi'
import { ENDPOINT } from '../api/end-point'

type AuthState = {
  user: any | null
  profile: any | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  initialize: () => Promise<void>
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data: any | ''; error: any | null }>
  signUp: (email: string) => Promise<{ data: any | ''; error: any | null }>
  signOut: () => Promise<void>
  forgotPassword: (email: string) => Promise<{ error: any | null }>
  resetPassword: (
    token: string,
    newPassword: string
  ) => Promise<{ error: any | null }>
  loadProfile: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ✅ Initialize Session on Page Load
      initialize: async () => {
        try {
          set({ isLoading: true })

          // ✅ Check if user is already logged in
          const response = await apiRequest('GET', ENDPOINT.AUTH.getUser)

          if (response?.data?.user) {
            set({
              user: response.data.user,
              profile: response.data.user,
              isAuthenticated: true
            })
          }

          set({ isLoading: false })
        } catch (error) {
          console.error('Auth initialization failed:', error)
          set({
            isAuthenticated: false,
            user: null,
            profile: null,
            isLoading: false
          })
        }
      },

      // ✅ Sign In
      signIn: async (email, password) => {
        set({ isLoading: true, error: null })

        const response = await apiRequest('POST', ENDPOINT.AUTH.signIn, {
          email,
          password
        })

        if (response.error) {
          set({ isLoading: false, error: response.error })
          return { data: '', error: response.error }
        }

        set({
          user: response?.data?.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })

        await get().loadProfile()

        return { data: response?.data || '', error: null }
      },

      // ✅ Sign Up
      signUp: async email => {
        set({ isLoading: true, error: null })

        const response = await apiRequest('POST', ENDPOINT.AUTH.signUp, {
          user_name: email.split('@')[0],
          email,
          password: '123456789'
        })

        if (response.error) {
          set({ isLoading: false, error: response.error })
          return { data: '', error: response.error }
        }

        set({
          user: response?.data?.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })

        await get().loadProfile()

        return { data: response?.data || '', error: null }
      },

      // ✅ Forgot Password
      forgotPassword: async email => {
        set({ isLoading: true, error: null })

        const response = await apiRequest('POST', ENDPOINT.AUTH.forgoPassword, {
          email
        })

        set({ isLoading: false, error: response.error })

        return { error: response.error || null }
      },

      // ✅ Reset Password
      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null })

        const response = await apiRequest(
          'POST',
          ENDPOINT.AUTH.updatePassword,
          { token, newPassword }
        )

        set({ isLoading: false, error: response.error })

        return { error: response.error || null }
      },

      // ✅ Load Profile
      loadProfile: async () => {
        try {
          const response = await apiRequest('GET', ENDPOINT.AUTH.getUser)

          if (response.data.user) {
            set({
              profile: response.data.user,
              user: response.data.user,
              isAuthenticated: true
            })
          }
        } catch (error) {
          console.error('Error loading profile:', error)
          set({ isAuthenticated: false, user: null, profile: null })
        }
      },

      // ✅ Logout
      signOut: async () => {
        set({ isLoading: true })

        const response = await apiRequest('POST', ENDPOINT.AUTH.signOut)

        if (!response.error) {
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false
          })

          window.location.href = '/login'
        }
      },

      // ✅ Clear Error
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
