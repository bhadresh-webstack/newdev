import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { authenticateRequest } from "@/lib/auth-utils"

const prisma = new PrismaClient()

// GET a specific task by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { id: taskId } = await params

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            title: true,
            customer: {
              select: {
                user_name: true,
                profile_image: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            user_name: true,
            profile_image: true,
            email: true,
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task, { status: 200 })
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
  }
}

// PATCH update a specific task
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { id: taskId } = await params
    const body = await request.json()

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if status is changing to "completed"
    const statusChangingToCompleted = body.status === "completed" && existingTask.status !== "completed"

    // In the PATCH function, ensure we're handling due_date properly
    // If the body contains a due_date string, convert it to a Date object
    if (body.due_date !== undefined) {
      body.due_date = body.due_date ? new Date(body.due_date) : null
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: body,
    })

    // If status changed to completed, update project completed_tasks count
    if (statusChangingToCompleted) {
      await prisma.project.update({
        where: { id: existingTask.project_id },
        data: {
          completed_tasks: { increment: 1 },
          progress_percentage: {
            set: await calculateProjectProgress(existingTask.project_id),
          },
        },
      })
    }
    // If status changed from completed to something else
    else if (existingTask.status === "completed" && body.status && body.status !== "completed") {
      await prisma.project.update({
        where: { id: existingTask.project_id },
        data: {
          completed_tasks: { decrement: 1 },
          progress_percentage: {
            set: await calculateProjectProgress(existingTask.project_id),
          },
        },
      })
    }

    return NextResponse.json(updatedTask, { status: 200 })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

// DELETE a specific task
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { id: taskId } = await params

    // Check if task exists and get its details
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Delete the task
    await prisma.task.delete({
      where: { id: taskId },
    })

    // Update project total_tasks count
    await prisma.project.update({
      where: { id: existingTask.project_id },
      data: {
        total_tasks: { decrement: 1 },
        // If the task was completed, also decrement completed_tasks
        ...(existingTask.status === "completed" && {
          completed_tasks: { decrement: 1 },
        }),
        progress_percentage: {
          set: await calculateProjectProgress(existingTask.project_id),
        },
      },
    })

    return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}

// Helper function to calculate project progress
async function calculateProjectProgress(projectId: string): Promise<number> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { total_tasks: true, completed_tasks: true },
  })

  if (!project || project.total_tasks === 0) return 0

  return Math.round((project.completed_tasks / project.total_tasks) * 100)
}
