import { type NextRequest, NextResponse } from "next/server"
import { comparePasswords, generateToken } from "@/lib/auth-utils"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if user is verified
    if (!user.verified) {
      return NextResponse.json({ error: "Please verify your email before logging in" }, { status: 403 })
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Set cookie - await the cookies() function
    const cookieStore = await cookies()
    await cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        user_name: user.user_name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    // Provide more specific error message if possible
    const errorMessage = error instanceof Error ? error.message : "Failed to login"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
