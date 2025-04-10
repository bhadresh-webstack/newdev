import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { authenticateRequest } from "@/lib/auth-utils"

const prisma = new PrismaClient()

// GET all projects for a specific customer
export async function GET(request: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { customerId } = await params
    const { userId, role } = auth

    const { searchParams } = new URL(request.url)

    // Get optional filters
    const status = searchParams.get("status")

    // Base where clause
    const whereClause: any = {
      customer_id: customerId,
    }

    // Apply filters if provided
    if (status) whereClause.status = status

    // Check permissions
    if (role === "admin") {
      // Admin can see any customer's projects
    } else if (role === "team_member") {
      // Team members can only see projects where they have assigned tasks
      const projectsWithAssignedTasks = await prisma.task.findMany({
        where: {
          assigned_to: userId,
          project: {
            customer_id: customerId,
          },
        },
        select: {
          project_id: true,
        },
        distinct: ["project_id"],
      })

      const projectIds = projectsWithAssignedTasks.map((task) => task.project_id)

      if (projectIds.length === 0) {
        return NextResponse.json({ projects: [] }, { status: 200 })
      }

      whereClause.id = { in: projectIds }
    } else if (role === "customer") {
      // Customers can only see their own projects
      if (customerId !== userId) {
        return NextResponse.json({ error: "Unauthorized to access other customer's projects" }, { status: 403 })
      }
    }

    // Fetch projects
    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            user_name: true,
            email: true,
            profile_image: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return NextResponse.json({ projects }, { status: 200 })
  } catch (error) {
    console.error("Error fetching customer projects:", error)
    return NextResponse.json({ error: "Failed to fetch customer projects" }, { status: 500 })
  }
}
