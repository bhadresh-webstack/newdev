import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { authenticateRequest } from "@/lib/auth-utils"

const prisma = new PrismaClient()

// GET all tasks with optional filtering
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const assignedTo = searchParams.get("assignedTo")
    const status = searchParams.get("status")
    const taskGroup = searchParams.get("taskGroup")

    const whereClause: any = {}

    // Apply filters from query parameters
    if (projectId) whereClause.project_id = projectId
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
        project: {
          select: {
            title: true,
          },
        },
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
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

// POST create a new task
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const body = await request.json()
    const { project_id, assigned_to, title, description, status, task_group, priority, due_date } = body

    // Validate required fields
    if (!project_id || !title || !description || !status || !task_group) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if project exists
    const projectExists = await prisma.project.findUnique({
      where: { id: project_id },
    })

    if (!projectExists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if assignee exists if provided
    if (assigned_to) {
      const assigneeExists = await prisma.user.findUnique({
        where: { id: assigned_to },
      })

      if (!assigneeExists) {
        return NextResponse.json({ error: "Assigned user not found" }, { status: 404 })
      }
    }

    // Create the task
    const newTask = await prisma.task.create({
      data: {
        project_id,
        assigned_to,
        title,
        description,
        status,
        task_group,
        priority: priority || "Medium",
        due_date: due_date ? new Date(due_date) : null,
      },
    })

    // Update project total_tasks count
    await prisma.project.update({
      where: { id: project_id },
      data: {
        total_tasks: { increment: 1 },
      },
    })

    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}

// PUT update all tasks (batch update)
export async function PUT(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const body = await request.json()
    const { tasks } = body

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: "No tasks provided for update" }, { status: 400 })
    }

    const updatePromises = tasks.map(async (task) => {
      const { id, ...updateData } = task

      if (!id) {
        throw new Error("Task ID is required for updates")
      }

      return prisma.task.update({
        where: { id },
        data: updateData,
      })
    })

    const updatedTasks = await Promise.all(updatePromises)
    return NextResponse.json(updatedTasks, { status: 200 })
  } catch (error) {
    console.error("Error updating tasks:", error)
    return NextResponse.json({ error: "Failed to update tasks" }, { status: 500 })
  }
}
