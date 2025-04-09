import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"

// GET all feedback for a specific project
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id

    // Get the auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    // If no token is provided, return unauthorized
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify and decode the token
    let decodedToken
    try {
      decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { userId, role } = decodedToken

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
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id

    // Get the auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    // If no token is provided, return unauthorized
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify and decode the token
    let decodedToken
    try {
      decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { userId, role } = decodedToken
    const body = await request.json()

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
