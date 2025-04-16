import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"


// GET team members assigned to a project
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Await the params object to get id
    const { id: projectId } = await params
    const { userId, role } = auth

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if user has access to this project
    if (role === "admin") {
      // Admin can access any project
    } else if (role === "team_member") {
      // Team member can access if they have assigned tasks
      const hasAssignedTask = await prisma.task.findFirst({
        where: {
          project_id: projectId,
          assigned_to: userId,
        },
      })

      if (!hasAssignedTask) {
        return NextResponse.json({ error: "Unauthorized to access this project" }, { status: 403 })
      }
    } else if (role === "customer") {
      // Customer can only access their own projects
      if (project.customer_id !== userId) {
        return NextResponse.json({ error: "Unauthorized to access this project" }, { status: 403 })
      }
    }

    // Get team members assigned to this project
    const teamMembers = await prisma.projectTeamMember.findMany({
      where: { project_id: projectId },
      include: {
        user: {
          select: {
            id: true,
            user_name: true,
            email: true,
            team_role: true,
            department: true,
            profile_image: true,
          },
        },
      },
    })

    // Format the response
    const formattedTeamMembers = teamMembers.map((member) => ({
      id: member.user.id,
      user_name: member.user.user_name,
      email: member.user.email,
      role: member.user.team_role,
      department: member.user.department,
      profile_image: member.user.profile_image,
      assigned_at: member.joined_at,
    }))

    return NextResponse.json({
      success: true,
      team_members: formattedTeamMembers,
    })
  } catch (error) {
    console.error("Error fetching project team members:", error)
    return NextResponse.json({ error: "Failed to fetch project team members" }, { status: 500 })
  }
}
