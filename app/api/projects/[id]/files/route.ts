import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { authenticateRequest } from "@/lib/auth-utils"

const prisma = new PrismaClient()

// GET all files for a specific project
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

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
      // Team member can access if they have assigned tasks OR if they are assigned to the project
      const hasAssignedTask = await prisma.task.findFirst({
        where: {
          project_id: projectId,
          assigned_to: userId,
        },
      })

      // Check if the team member is directly assigned to the project
      const isAssignedToProject = await prisma.projectTeamMember.findFirst({
        where: {
          project_id: projectId,
          user_id: userId,
        },
      })

      if (!hasAssignedTask && !isAssignedToProject) {
        return NextResponse.json({ error: "Unauthorized to access this project" }, { status: 403 })
      }
    } else if (role === "customer") {
      // Customer can only access their own projects
      if (project.customer_id !== userId) {
        return NextResponse.json({ error: "Unauthorized to access this project" }, { status: 403 })
      }
    }

    // Fetch files
    const files = await prisma.file.findMany({
      where: {
        project_id: projectId,
      },
      include: {
        uploader: {
          select: {
            id: true,
            user_name: true,
            profile_image: true,
          },
        },
      },
      orderBy: {
        uploaded_at: "desc",
      },
    })

    return NextResponse.json({ files }, { status: 200 })
  } catch (error) {
    console.error("Error fetching project files:", error)
    return NextResponse.json({ error: "Failed to fetch project files" }, { status: 500 })
  }
}

// POST upload a file to a project
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { id: projectId } = await params
    const body = await request.json()
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
      // Team member can access if they have assigned tasks OR if they are assigned to the project
      const hasAssignedTask = await prisma.task.findFirst({
        where: {
          project_id: projectId,
          assigned_to: userId,
        },
      })

      // Check if the team member is directly assigned to the project
      const isAssignedToProject = await prisma.projectTeamMember.findFirst({
        where: {
          project_id: projectId,
          user_id: userId,
        },
      })

      if (!hasAssignedTask && !isAssignedToProject) {
        return NextResponse.json({ error: "Unauthorized to access this project" }, { status: 403 })
      }
    } else if (role === "customer") {
      // Customer can only access their own projects
      if (project.customer_id !== userId) {
        return NextResponse.json({ error: "Unauthorized to access this project" }, { status: 403 })
      }
    }

    // Create the file record
    const newFile = await prisma.file.create({
      data: {
        project_id: projectId,
        uploaded_by: userId,
        file_url: body.file_url,
        file_type: body.file_type,
        file_name: body.file_name,
        file_size: body.file_size,
      },
    })

    return NextResponse.json(newFile, { status: 201 })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
