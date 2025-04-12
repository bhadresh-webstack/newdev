import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyToken, getUsernameFromEmail, generateToken, sendVerificationEmail } from "@/lib/auth-utils"
import { cookies } from "next/headers"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const token = cookies().get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    const decoded = verifyToken(token)

    console.log("decoded",decoded)
    if (!decoded || !decoded.userId || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    const body = await request.json()
    const { email, user_name, team_role, department } = body

    // Validate required fields
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

    // Generate username from email if not provided
    let finalUsername = user_name || getUsernameFromEmail(email)

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { user_name: finalUsername },
    })

    // If username exists, append a random number
    if (existingUsername) {
      finalUsername = `${finalUsername}${Math.floor(1000 + Math.random() * 9000)}`
    }

    // Create temporary password
    const tempPassword = Math.random().toString(36).slice(-10)

    // Create team member
    const newTeamMember = await prisma.user.create({
      data: {
        email,
        user_name: finalUsername,
        password: tempPassword,
        role: "team_member",
        team_role: team_role || null,
        department: department || null,
      },
    })

    // Generate verification token
    const verificationToken = generateToken(
      {
        userId: newTeamMember.id,
        email: newTeamMember.email,
        purpose: "verification",
      },
      "24h",
    )

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken)

    if (!emailSent) {
      return NextResponse.json(
        {
          success: true,
          team_member: {
            id: newTeamMember.id,
            email: newTeamMember.email,
            user_name: newTeamMember.user_name,
            role: newTeamMember.role,
            team_role: newTeamMember.team_role,
            department: newTeamMember.department,
          },
          warning: "Team member created but verification email could not be sent",
        },
        { status: 201 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        team_member: {
          id: newTeamMember.id,
          email: newTeamMember.email,
          user_name: newTeamMember.user_name,
          role: newTeamMember.role,
          team_role: newTeamMember.team_role,
          department: newTeamMember.department,
        },
        message: "Team member created successfully. Verification email sent.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Team member creation error:", error)
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 })
  }
}
