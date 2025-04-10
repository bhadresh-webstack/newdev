import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { authenticateRequest } from "@/lib/auth-utils"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"

// GET a specific project by ID
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
      include: {
        customer: {
          select: {
            id: true,
            user_name: true,
            email: true,
            profile_image: true,
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                user_name: true,
                profile_image: true,
              },
            },
          },
        },
        feedbacks: true,
        files: {
          include: {
            uploader: {
              select: {
                id: true,
                user_name: true,
                profile_image: true,
              },
            },
          },
        },
      },
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

    return NextResponse.json(project, { status: 200 })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

// PATCH update a specific project
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Await the params object to get id
    const { id: projectId } = await params
    const { userId, role } = auth
    const body = await request.json()

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if user has permission to update this project
    if (role === "admin") {
      // Admin can update any project
    } else if (role === "team_member") {
      // Team members can only update certain fields
      const allowedFields = ["status", "progress_percentage", "description", "technical_requirements"]

      // Filter out fields that team members are not allowed to update
      Object.keys(body).forEach((key) => {
        if (!allowedFields.includes(key)) {
          delete body[key]
        }
      })

      // Check if they have assigned tasks in this project
      const hasAssignedTask = await prisma.task.findFirst({
        where: {
          project_id: projectId,
          assigned_to: userId,
        },
      })

      if (!hasAssignedTask) {
        return NextResponse.json({ error: "Unauthorized to update this project" }, { status: 403 })
      }
    } else if (role === "customer") {
      // Customers can only update their own projects and only certain fields
      if (project.customer_id !== userId) {
        return NextResponse.json({ error: "Unauthorized to update this project" }, { status: 403 })
      }

      // Customers can only update certain fields
      const allowedFields = ["description", "deliverables"]

      // Filter out fields that customers are not allowed to update
      Object.keys(body).forEach((key) => {
        if (!allowedFields.includes(key)) {
          delete body[key]
        }
      })
    }

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: body,
    })

    return NextResponse.json(updatedProject, { status: 200 })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

// DELETE a specific project
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Only admin can delete projects
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized to delete projects" }, { status: 403 })
    }

    // Delete all related records first (to avoid foreign key constraints)
    await prisma.$transaction([
      prisma.task.deleteMany({ where: { project_id: projectId } }),
      prisma.feedback.deleteMany({ where: { project_id: projectId } }),
      prisma.iteration.deleteMany({ where: { project_id: projectId } }),
      prisma.payment.updateMany({
        where: { project_id: projectId },
        data: { project_id: null }, // Set to null instead of deleting
      }),
      prisma.message.deleteMany({ where: { project_id: projectId } }),
      prisma.file.deleteMany({ where: { project_id: projectId } }),
      prisma.project.delete({ where: { id: projectId } }),
    ])

    return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
