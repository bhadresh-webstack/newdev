import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"

// GET all tasks for a specific project
export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
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

    // If user is a customer, they shouldn't see any tasks
    if (role === "customer") {
      return NextResponse.json([], { status: 200 })
    }

    const projectId = params.projectId
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const taskGroup = searchParams.get("taskGroup")
    const assignedTo = searchParams.get("assignedTo")

    // Check if project exists
    const projectExists = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!projectExists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Build where clause
    const whereClause: any = {
      project_id: projectId,
    }

    if (status) whereClause.status = status
    if (taskGroup) whereClause.task_group = taskGroup

    // For team members, only show tasks assigned to them
    if (role === "team_member") {
      whereClause.assigned_to = userId
    }
    // For admin with assignedTo filter
    else if (role === "admin" && assignedTo) {
      whereClause.assigned_to = assignedTo
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: {
          select: {
            user_name: true,
            profile_image: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return NextResponse.json(tasks, { status: 200 })
  } catch (error) {
    console.error("Error fetching project tasks:", error)
    return NextResponse.json({ error: "Failed to fetch project tasks" }, { status: 500 })
  }
}

// POST create multiple tasks for a project
export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const projectId = params.projectId
    const body = await request.json()
    const { tasks } = body

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: "No tasks provided" }, { status: 400 })
    }

    // Check if project exists
    const projectExists = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!projectExists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Create tasks in a transaction
    const createdTasks = await prisma.$transaction(async (prisma) => {
      const taskPromises = tasks.map((task) =>
        prisma.task.create({
          data: {
            ...task,
            project_id: projectId,
          },
        }),
      )

      const createdTasks = await Promise.all(taskPromises)

      // Update project total_tasks count
      await prisma.project.update({
        where: { id: projectId },
        data: {
          total_tasks: { increment: tasks.length },
        },
      })

      return createdTasks
    })

    return NextResponse.json(createdTasks, { status: 201 })
  } catch (error) {
    console.error("Error creating project tasks:", error)
    return NextResponse.json({ error: "Failed to create project tasks" }, { status: 500 })
  }
}
