import { type NextRequest, NextResponse } from "next/server"
import { generateToken, sendVerificationEmail } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // For security reasons, don't reveal if the user exists or not
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If your email is registered, you will receive a password reset link",
      })
    }

    // Generate reset token
    const token = generateToken(
      {
        userId: user.id,
        email: user.email,
        purpose: "verification",
      },
      "24h",
    )

    // Send password reset email
    const emailSent = await sendVerificationEmail(email, token)

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send password reset email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "If your email is registered, you will receive a password reset link",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
