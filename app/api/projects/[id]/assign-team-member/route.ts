import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { authenticateRequest } from "@/lib/auth-utils"

const prisma = new PrismaClient()

// POST assign a team member to a project
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Only admin can assign team members
    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    // Await the params object to get id
    const { id: projectId } = await params
    const body = await request.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if user exists and is a team member
    const user = await prisma.user.findUnique({
      where: { id: user_id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "team_member") {
      return NextResponse.json({ error: "User is not a team member" }, { status: 400 })
    }

    // Check if team member is already assigned to this project
    const existingAssignment = await prisma.projectTeamMember.findFirst({
      where: {
        project_id: projectId,
        user_id: user_id,
      },
    })

    if (existingAssignment) {
      return NextResponse.json({ error: "Team member is already assigned to this project" }, { status: 400 })
    }

    // Assign team member to project
    const assignment = await prisma.projectTeamMember.create({
      data: {
        project_id: projectId,
        user_id: user_id,
        joined_at: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Team member assigned to project successfully",
      assignment,
    })
  } catch (error) {
    console.error("Error assigning team member to project:", error)
    return NextResponse.json({ error: "Failed to assign team member to project" }, { status: 500 })
  }
}

// DELETE remove a team member from a project
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Only admin can remove team members
    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    // Await the params object to get id
    const { id: projectId } = await params

    // Get user_id from the URL query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if the team member is assigned to this project
    const assignment = await prisma.projectTeamMember.findFirst({
      where: {
        project_id: projectId,
        user_id: userId,
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: "Team member is not assigned to this project" }, { status: 404 })
    }

    // Remove team member from project
    await prisma.projectTeamMember.delete({
      where: {
        id: assignment.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Team member removed from project successfully",
    })
  } catch (error) {
    console.error("Error removing team member from project:", error)
    return NextResponse.json({ error: "Failed to remove team member from project" }, { status: 500 })
  }
}
