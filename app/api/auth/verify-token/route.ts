import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Verify token
    const decoded = verifyToken(token)

    if (!decoded || !decoded.userId || decoded.purpose !== "verification") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If user is already verified, return success
    if (user.verified) {
      return NextResponse.json({
        success: true,
        message: "Email already verified",
        email: user.email,
      })
    }

    // Return success with user email
    return NextResponse.json({
      success: true,
      message: "Token is valid",
      email: user.email,
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Failed to verify token" }, { status: 500 })
  }
}
