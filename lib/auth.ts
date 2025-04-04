"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Simplified user data
const demoUser = {
  id: "user-1",
  email: "user@example.com",
  first_name: "Demo",
  last_name: "User",
  profile_image: null,
}

// Add test users to the auth context
const testUsers = {
  admin: {
    id: "admin-1",
    email: "admin@gmail.com",
    first_name: "Admin",
    last_name: "User",
    profile_image: null,
    role: "admin",
  },
  team: {
    id: "team-1",
    email: "team@gmail.com",
    first_name: "Team",
    last_name: "Member",
    profile_image: null,
    role: "team",
  },
  customer: {
    id: "customer-1",
    email: "customer@gmail.com",
    first_name: "Customer",
    last_name: "User",
    profile_image: null,
    role: "customer",
  },
}

type AuthContextType = {
  user: any | null
  session: any | null
  isLoading: boolean
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    error: any | null
    data: any | null
  }>
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: any | null
    data: any | null
  }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [session, setSession] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      // Simplified auth initialization
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const signUp = async (email: string, password: string) => {
    // Simplified sign up
    return { data: null, error: null }
  }

  const signIn = async (email: string, password: string) => {
    // Check for test credentials
    if (password === "123456") {
      if (email === "admin@gmail.com") {
        setUser(testUsers.admin)
        setSession({ user: testUsers.admin })
        router.push("/app")
        return { data: { user: testUsers.admin }, error: null }
      } else if (email === "team@gmail.com") {
        setUser(testUsers.team)
        setSession({ user: testUsers.team })
        router.push("/app")
        return { data: { user: testUsers.team }, error: null }
      } else if (email === "customer@gmail.com") {
        setUser(testUsers.customer)
        setSession({ user: testUsers.customer })
        router.push("/app")
        return { data: { user: testUsers.customer }, error: null }
      }
    }

    // Regular sign in logic for other users
    setUser({ ...demoUser, email })
    setSession({ user: { ...demoUser, email } })

    router.push("/app")
    return { data: {}, error: null }
  }

  const signOut = async () => {
    // Simplified sign out
    setUser(null)
    setSession(null)
    router.push("/")
  }

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

