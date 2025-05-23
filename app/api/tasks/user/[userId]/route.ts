import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"

// GET all tasks assigned to a specific user
export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Await the params object to get userId
    const { userId: requestedUserId } = await params
    const { userId: tokenUserId, role } = auth

    // If user is a customer, they shouldn't see any tasks
    if (role === "customer") {
      return NextResponse.json([], { status: 200 })
    }

    // Team members can only see their own tasks
    if (role === "team_member" && tokenUserId !== requestedUserId) {
      return NextResponse.json({ error: "Unauthorized to view other user's tasks" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const projectId = searchParams.get("projectId")
    const taskGroup = searchParams.get("taskGroup")

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: requestedUserId },
    })

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Build where clause
    const whereClause: any = {
      assigned_to: requestedUserId,
    }

    if (status) whereClause.status = status
    if (projectId) whereClause.project_id = projectId

    // Ensure we're including due_date in the response
    const tasks = await prisma.task.findMany({
      where: {
        assigned_to: requestedUserId,
        ...(projectId && { project_id: projectId }),
        ...(status && { status }),
        ...(taskGroup && { task_group: taskGroup }),
      },
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
    console.error("Error fetching user tasks:", error)
    return NextResponse.json({ error: "Failed to fetch user tasks" }, { status: 500 })
  }
}

// PATCH update task assignments for a user
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Await the params object to get userId
    const { userId } = await params
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
