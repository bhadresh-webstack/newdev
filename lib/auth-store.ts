import { create } from "zustand"
import { persist } from "zustand/middleware"

type User = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role?: string
}

// Valid credentials from our JSON file
const VALID_CREDENTIALS = [
  {
    id: "user-admin",
    email: "admin@example.com",
    password: "123456",
    role: "admin",
    firstName: "Admin",
    lastName: "User",
  },
  {
    id: "user-customer",
    email: "customer@example.com",
    password: "123456",
    role: "customer",
    firstName: "Customer",
    lastName: "User",
  },
  {
    id: "user-team",
    email: "team@example.com",
    password: "123456",
    role: "team-member",
    firstName: "Team",
    lastName: "Member",
  },
]

type AuthState = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      signIn: async (email, password) => {
        set({ isLoading: true })

        try {
          // Check if the credentials match any of our valid users
          const validUser = VALID_CREDENTIALS.find((user) => user.email === email && user.password === password)

          if (validUser) {
            // Mock successful login
            const user = {
              id: validUser.id,
              email: validUser.email,
              firstName: validUser.firstName,
              lastName: validUser.lastName,
              role: validUser.role,
            }

            set({ user, isAuthenticated: true, isLoading: false })
            return { success: true }
          }

          set({ isLoading: false })
          return { success: false, error: "Invalid credentials" }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: "An error occurred during sign in" }
        }
      },

      signUp: async (email, password) => {
        set({ isLoading: true })

        try {
          // In a real app, you would register the user with your backend
          // For now, we'll just return an error since we only allow specific users
          set({ isLoading: false })
          return { success: false, error: "Registration is currently disabled" }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: "An error occurred during sign up" }
        }
      },

      signOut: () => {
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)

