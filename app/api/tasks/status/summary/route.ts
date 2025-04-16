import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"


// GET task status summary
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const userId = searchParams.get("userId")

    // Build where clause
    const whereClause: any = {}
    if (projectId) whereClause.project_id = projectId
    if (userId) whereClause.assigned_to = userId

    // Get all tasks
    const tasks = await prisma.task.findMany({
      where: whereClause,
      select: {
        status: true,
      },
    })

    // Count tasks by status
    const statusSummary = tasks.reduce((acc: Record<string, number>, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {})

    // Add total count
    statusSummary.total = tasks.length

    return NextResponse.json(statusSummary, { status: 200 })
  } catch (error) {
    console.error("Error fetching task status summary:", error)
    return NextResponse.json({ error: "Failed to fetch task status summary" }, { status: 500 })
  }
}
