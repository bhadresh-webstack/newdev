import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"

// GET all messages for a specific project
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

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: {
        project_id: projectId,
      },
      include: {
        sender: {
          select: {
            id: true,
            user_name: true,
            profile_image: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            user_name: true,
            profile_image: true,
            role: true,
          },
        },
      },
      orderBy: {
        created_at: "asc",
      },
    })

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error("Error fetching project messages:", error)
    return NextResponse.json({ error: "Failed to fetch project messages" }, { status: 500 })
  }
}

// POST send a message in a project
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

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: body.receiver_id },
    })

    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 })
    }

    // Create the message
    const newMessage = await prisma.message.create({
      data: {
        project_id: projectId,
        sender_id: userId,
        receiver_id: body.receiver_id,
        message: body.message,
      },
      include: {
        sender: {
          select: {
            id: true,
            user_name: true,
            profile_image: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            user_name: true,
            profile_image: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
