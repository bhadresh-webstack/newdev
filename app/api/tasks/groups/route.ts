import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"

// GET all unique task groups
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    // Build where clause
    const whereClause: any = {}
    if (projectId) whereClause.project_id = projectId

    // Get all tasks
    const tasks = await prisma.task.findMany({
      where: whereClause,
      select: {
        task_group: true,
      },
      distinct: ["task_group"],
    })

    // Extract unique task groups
    const taskGroups = tasks.map((task) => task.task_group)

    return NextResponse.json(taskGroups, { status: 200 })
  } catch (error) {
    console.error("Error fetching task groups:", error)
    return NextResponse.json({ error: "Failed to fetch task groups" }, { status: 500 })
  }
}
