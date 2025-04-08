import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Session } from "@supabase/supabase-js"

type AuthState = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isLoggedIn: boolean
  justLoggedIn: boolean
  error: string | null

  // Auth actions
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any | null }>
  signIn: (email: string, password: string) => Promise<{ error: any | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any | null }>
  updatePassword: (password: string) => Promise<{ error: any | null }>

  // State actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setIsLoading: (isLoading: boolean) => void
  setIsLoggedIn: (isLoggedIn: boolean) => void
  setJustLoggedIn: (justLoggedIn: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isLoggedIn: false,
      justLoggedIn: false,
      error: null,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      setJustLoggedIn: (justLoggedIn) => set({ justLoggedIn }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      checkSession: async () => {
        try {
          const supabase = createClient()
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            console.error("Error checking session:", error)
            set({ error: error.message, isLoading: false })
            return
          }

          set({
            session: data.session,
            user: data.session?.user || null,
            isLoggedIn: !!data.session,
            isLoading: false,
          })
        } catch (error: any) {
          console.error("Error checking session:", error)
          set({ error: error.message, isLoading: false })
        }
      },

      signUp: async (email, password, firstName, lastName) => {
        set({ isLoading: true, error: null })
        const supabase = createClient()

        try {
          // Step 1: Sign up the user
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName,
                role: "customer", // Set role to customer by default
              },
              emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL
                ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
                : "https://v0-custom-landing-page-design-jdvc0sq4d.vercel.app/auth/callback",
            },
          })

          if (error) {
            console.error("Signup error:", error)
            set({ error: error.message, isLoading: false })
            return { error }
          }

          // Step 2: Create profile only if user was created successfully
          if (data.user) {
            try {
              // Add a small delay to ensure auth user is fully created
              await new Promise((resolve) => setTimeout(resolve, 500))

              // Create a profile entry
              const { error: profileError } = await supabase.from("profiles").insert({
                id: data.user.id,
                email,
                first_name: firstName,
                last_name: lastName,
                role: "customer",
                created_at: new Date().toISOString(),
              })

              if (profileError) {
                console.error("Error creating profile:", profileError.message, profileError.details, profileError.hint)
                // Don't fail the signup if profile creation fails - we'll handle this separately
              }
            } catch (profileError) {
              console.error("Exception creating profile:", profileError)
              // Don't fail the signup if profile creation fails
            }
          }

          set({ isLoading: false })
          return { error: null }
        } catch (error) {
          console.error("Signup process error:", error)
          set({ error: error.message || "An unexpected error occurred", isLoading: false })
          return { error }
        }
      },

      signIn: async (email, password) => {
        set({ isLoading: true, error: null })
        const supabase = createClient()

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            set({ error: error.message, isLoading: false })
            return { error }
          }

          // Set auth state but don't redirect here - let the auth initializer handle redirects
          set({
            user: data.user,
            session: data.session,
            isLoggedIn: true,
            justLoggedIn: true,
            isLoading: false,
          })

          return { error: null }
        } catch (error: any) {
          console.error("Login error:", error)
          set({ error: error.message || "An unexpected error occurred", isLoading: false })
          return { error }
        }
      },

      signOut: async () => {
        const supabase = createClient()
        set({ isLoading: true })

        try {
          await supabase.auth.signOut()
          set({
            user: null,
            session: null,
            isLoggedIn: false,
            justLoggedIn: false,
            isLoading: false,
          })
        } catch (error: any) {
          console.error("Signout error:", error)
          set({ error: error.message || "An unexpected error occurred", isLoading: false })
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null })
        const supabase = createClient()

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: process.env.NEXT_PUBLIC_SITE_URL
              ? `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
              : "https://v0-custom-landing-page-design-jdvc0sq4d.vercel.app/reset-password",
          })

          set({ isLoading: false })
          if (error) {
            set({ error: error.message })
            return { error }
          }

          return { error: null }
        } catch (error: any) {
          console.error("Reset password error:", error)
          set({ error: error.message || "An unexpected error occurred", isLoading: false })
          return { error }
        }
      },

      updatePassword: async (password) => {
        set({ isLoading: true, error: null })
        const supabase = createClient()

        try {
          const { error } = await supabase.auth.updateUser({
            password,
          })

          set({ isLoading: false })
          if (error) {
            set({ error: error.message })
            return { error }
          }

          return { error: null }
        } catch (error: any) {
          console.error("Update password error:", error)
          set({ error: error.message || "An unexpected error occurred", isLoading: false })
          return { error }
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isLoggedIn: state.isLoggedIn,
        justLoggedIn: state.justLoggedIn,
      }),
    },
  ),
)

type ToastState = {
  toasts: Array<{
    id: string
    title: string
    description?: string
    type: "success" | "error" | "info"
    duration?: number
  }>
  addToast: (toast: {
    title: string
    description?: string
    type: "success" | "error" | "info"
    duration?: number
  }) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Math.random().toString(36).substring(2, 9), ...toast }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
