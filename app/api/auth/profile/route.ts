import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyToken } from "@/lib/auth-utils"
import { cookies } from "next/headers"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = cookies().get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    const decoded = verifyToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Find user
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
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
