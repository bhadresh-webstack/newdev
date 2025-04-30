"use server"

import { cookies, headers } from "next/headers"
import { verifyToken } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

/**
 * Server-side function to fetch user profile directly from database
 * This avoids making API calls that might fail
 */
export async function getServerSideProfile() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    // Get current path from headers
    const headerList = await headers()
    const currentPath = headerList.get("x-invoke-path") || "/"

    const redirectTo = (currentPath === "/") ? "/" : "/login"

    if (!token) {
      cookieStore.delete("auth_token")
      redirect(redirectTo)

      return {
        success: false,
        error: "Not authenticated",
        user: null,
      }
    }

    const decoded = verifyToken(token)

    if (!decoded || !decoded.userId) {
      cookieStore.delete("auth_token")
      redirect(redirectTo)

      return {
        success: false,
        error: "Invalid or expired token",
        user: null,
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        user_name: true,
        email: true,
        role: true,
        team_role: true,
        department: true,
        profile_image: true,
        created_at: true,
        verified: true,
      },
    })

    if (!user) {
      cookieStore.delete("auth_token")
      redirect(redirectTo)

      return {
        success: false,
        error: "User not found",
        user: null,
      }
    }

    return {
      success: true,
      error: null,
      user,
    }
  } catch (error) {
    const cookieStore = await cookies()
    const headerList = await headers()
    const currentPath = headerList.get("x-invoke-path") || "/"
    const redirectTo = (currentPath === "/") ? "/" : "/login"

    console.error("Server-side profile fetch error:", error)
    cookieStore.delete("auth_token")
    redirect(redirectTo)

    return {
      success: false,
      error: "Failed to fetch profile",
      user: null,
    }
  }
}

/**
 * Server-side function to check if user is authenticated
 */
export async function checkAuthStatus() {
  try {
    // Await the cookies() function
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return { authenticated: false }
    }

    const decoded = verifyToken(token)

    if (!decoded || !decoded.userId) {
      return { authenticated: false }
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    })

    return {
      authenticated: !!user,
      userId: user?.id || null,
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return { authenticated: false }
  }
}
