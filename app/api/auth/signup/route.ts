import { type NextRequest, NextResponse } from "next/server"
import { generateToken, getUsernameFromEmail, sendVerificationEmail } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Generate username from email
    const user_name = getUsernameFromEmail(email)

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { user_name },
    })

    // If username exists, append a random number
    let finalUsername = user_name
    if (existingUsername) {
      finalUsername = `${user_name}${Math.floor(1000 + Math.random() * 9000)}`
    }

    // Create user with temporary password (will be reset)
    const tempPassword = Math.random().toString(36).slice(-10)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        user_name: finalUsername,
        password: tempPassword, // This will be reset by the user
        role: "customer", // Default role
      },
    })

    // Generate verification token
    const token = generateToken(
      {
        userId: newUser.id,
        email: newUser.email,
        purpose: "verification",
      },
      "24h",
    )

    // Send verification email
    const emailSent = await sendVerificationEmail(email, token)

    if (!emailSent) {
      // If email fails, still return success but with a warning
      return NextResponse.json(
        {
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            user_name: newUser.user_name,
          },
          warning: "User created but verification email could not be sent",
        },
        { status: 201 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          user_name: newUser.user_name,
        },
        message: "User created successfully. Verification email sent.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
