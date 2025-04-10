import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { authenticateRequest } from "@/lib/auth-utils"

const prisma = new PrismaClient()

// GET all tasks for a specific project
export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { userId, role } = auth

    // If user is a customer, they shouldn't see any tasks
    if (role === "customer") {
      return NextResponse.json([], { status: 200 })
    }

    // Await the params object to get projectId
    const { projectId } = await params
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
export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Await the params object to get projectId
    const { projectId } = await params
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
