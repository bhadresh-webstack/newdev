import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { authenticateRequest } from "@/lib/auth-utils"
import { broadcastToProject } from "@/app/api/messages/sse/route"

const prisma = new PrismaClient()

// GET all messages for a specific project
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

    // If the user is a customer, modify the response to hide team member and admin names
    if (role === "customer") {
      const modifiedMessages = messages.map((message) => {
        // If the sender is not the customer (i.e., admin or team member), replace name with "webstack"
        if (
          message.sender &&
          message.sender.id !== userId &&
          (message.sender.role === "admin" || message.sender.role === "team_member")
        ) {
          return {
            ...message,
            sender: {
              ...message.sender,
              user_name: "webstack",
              // Keep the profile image and other details
            },
          }
        }
        return message
      })

      return NextResponse.json({ messages: modifiedMessages }, { status: 200 })
    }

    // For admin and team members, return the original messages with full details
    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error("Error fetching project messages:", error)
    return NextResponse.json({ error: "Failed to fetch project messages" }, { status: 500 })
  }
}

// POST send a message in a project
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

    // Broadcast the message to all clients in the project
    broadcastToProject(projectId, newMessage)

    // If the user is a customer, modify the response to hide team member and admin names
    if (role === "customer") {
      if (
        newMessage.sender &&
        newMessage.sender.id !== userId &&
        (newMessage.sender.role === "admin" || newMessage.sender.role === "team_member")
      ) {
        const modifiedMessage = {
          ...newMessage,
          sender: {
            ...newMessage.sender,
            user_name: "webstack",
          },
        }
        return NextResponse.json(modifiedMessage, { status: 201 })
      }
    }

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
