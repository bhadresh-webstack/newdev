import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyToken, hashPassword } from "@/lib/auth-utils"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Verify token
    const decoded = verifyToken(token)

    if (!decoded || !decoded.userId || decoded.purpose !== "verification") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password)

    // Update user password and mark as verified
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        password: hashedPassword,
        verified: true,
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now login.",
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
