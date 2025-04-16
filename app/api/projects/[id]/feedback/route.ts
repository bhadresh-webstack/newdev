import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"


// GET all feedback for a specific project
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

    // Fetch feedback
    const feedback = await prisma.feedback.findMany({
      where: {
        project_id: projectId,
      },
      include: {
        customer: {
          select: {
            id: true,
            user_name: true,
            profile_image: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return NextResponse.json({ feedback }, { status: 200 })
  } catch (error) {
    console.error("Error fetching project feedback:", error)
    return NextResponse.json({ error: "Failed to fetch project feedback" }, { status: 500 })
  }
}

// POST add feedback to a project
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

    // Only customers and admins can add feedback
    if (role !== "admin" && role !== "customer") {
      return NextResponse.json({ error: "Unauthorized to add feedback" }, { status: 403 })
    }

    // Customers can only add feedback to their own projects
    if (role === "customer" && project.customer_id !== userId) {
      return NextResponse.json({ error: "Unauthorized to add feedback to this project" }, { status: 403 })
    }

    // Create the feedback
    const newFeedback = await prisma.feedback.create({
      data: {
        project_id: projectId,
        customer_id: role === "admin" ? body.customer_id : userId,
        feedback_text: body.feedback_text,
        status: body.status || "New",
      },
    })

    return NextResponse.json(newFeedback, { status: 201 })
  } catch (error) {
    console.error("Error adding feedback:", error)
    return NextResponse.json({ error: "Failed to add feedback" }, { status: 500 })
  }
}
