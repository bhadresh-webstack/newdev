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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    })

    if (!user || (user.role !== "admin" && user.role !== "team_member")) {
      return NextResponse.json({ error: "Unauthorized. Admin or team member access required." }, { status: 403 })
    }

    // Get all team members
    const teamMembers = await prisma.user.findMany({
      where: { role: "team_member" },
      select: {
        id: true,
        user_name: true,
        email: true,
        team_role: true,
        department: true,
        profile_image: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    })

    return NextResponse.json({
      success: true,
      team_members: teamMembers,
    })
  } catch (error) {
    console.error("Team members fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 })
  }
}
