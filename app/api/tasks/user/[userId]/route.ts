import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET all tasks assigned to a specific user
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const projectId = searchParams.get("projectId")

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Build where clause
    const whereClause: any = {
      assigned_to: userId,
    }

    if (status) whereClause.status = status
    if (projectId) whereClause.project_id = projectId

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            title: true,
            customer: {
              select: {
                user_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return NextResponse.json(tasks, { status: 200 })
  } catch (error) {
    console.error("Error fetching user tasks:", error)
    return NextResponse.json({ error: "Failed to fetch user tasks" }, { status: 500 })
  }
}

// PATCH update task assignments for a user
export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId
    const body = await request.json()
    const { taskIds, action } = body

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({ error: "No task IDs provided" }, { status: 400 })
    }

    if (!action || (action !== "assign" && action !== "unassign")) {
      return NextResponse.json({ error: "Invalid action. Must be 'assign' or 'unassign'" }, { status: 400 })
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update tasks
    const updateData = action === "assign" ? { assigned_to: userId } : { assigned_to: null }

    const updatedTasks = await prisma.task.updateMany({
      where: {
        id: { in: taskIds },
      },
      data: updateData,
    })

    return NextResponse.json(
      {
        message: `Successfully ${action === "assign" ? "assigned" : "unassigned"} ${updatedTasks.count} tasks`,
        count: updatedTasks.count,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating task assignments:", error)
    return NextResponse.json({ error: "Failed to update task assignments" }, { status: 500 })
  }
}
