import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"


// GET project statistics
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { userId, role } = auth

    // Only admin and team members can access statistics
    if (role !== "admin" && role !== "team_member") {
      return NextResponse.json({ error: "Unauthorized to access statistics" }, { status: 403 })
    }

    let whereClause = {}

    // Team members can only see stats for projects they're involved in
    if (role === "team_member") {
      const projectsWithAssignedTasks = await prisma.task.findMany({
        where: {
          assigned_to: userId,
        },
        select: {
          project_id: true,
        },
        distinct: ["project_id"],
      })

      const projectIds = projectsWithAssignedTasks.map((task) => task.project_id)

      if (projectIds.length === 0) {
        return NextResponse.json(
          {
            totalProjects: 0,
            projectsByStatus: {},
            projectsByPriority: {},
            averageProgress: 0,
            totalTasks: 0,
            completedTasks: 0,
          },
          { status: 200 },
        )
      }

      whereClause = { id: { in: projectIds } }
    }

    // Get total projects
    const totalProjects = await prisma.project.count({
      where: whereClause,
    })

    // Get projects by status
    const projectsByStatus = await prisma.project.groupBy({
      by: ["status"],
      where: whereClause,
      _count: {
        id: true,
      },
    })

    // Get projects by priority
    const projectsByPriority = await prisma.project.groupBy({
      by: ["priority"],
      where: whereClause,
      _count: {
        id: true,
      },
    })

    // Get average progress
    const progressResult = await prisma.project.aggregate({
      where: whereClause,
      _avg: {
        progress_percentage: true,
      },
    })

    // Get task statistics
    const taskStats = await prisma.project.aggregate({
      where: whereClause,
      _sum: {
        total_tasks: true,
        completed_tasks: true,
      },
    })

    // Format the response
    const stats = {
      totalProjects,
      projectsByStatus: projectsByStatus.reduce((acc: Record<string, number>, curr) => {
        acc[curr.status] = curr._count.id
        return acc
      }, {} as Record<string, number>),
      projectsByPriority: projectsByPriority.reduce((acc: Record<string, number>, curr) => {
        if (curr.priority) {
          acc[curr.priority] = curr._count.id
        }
        return acc
      }, {}),
      averageProgress: progressResult._avg.progress_percentage || 0,
      totalTasks: taskStats._sum.total_tasks || 0,
      completedTasks: taskStats._sum.completed_tasks || 0,
    }

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error("Error fetching project statistics:", error)
    return NextResponse.json({ error: "Failed to fetch project statistics" }, { status: 500 })
  }
}
