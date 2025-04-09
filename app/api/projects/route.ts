import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"

// GET all projects with role-based filtering
export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url)

    // Get optional filters
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")

    // Base where clause
    const whereClause: any = {}

    // Apply filters if provided
    if (status) whereClause.status = status
    if (priority) whereClause.priority = priority

    // Apply role-based filtering
    if (role === "admin") {
      // Admin can see all projects
      // No additional filters needed
    } else if (role === "team_member") {
      // Team members can only see projects where they have assigned tasks
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
        return NextResponse.json({ projects: [] }, { status: 200 })
      }

      whereClause.id = { in: projectIds }
    } else if (role === "customer") {
      // Customers can only see their own projects
      whereClause.customer_id = userId
    }

    // Fetch projects based on role and filters
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
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

// POST create a new project
export async function POST(request: NextRequest) {
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
      decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; email: string }
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { userId, role, email } = decodedToken

    // Only admin and customers can create projects
    if (role !== "admin" && role !== "customer") {
      return NextResponse.json({ error: "Unauthorized to create projects" }, { status: 403 })
    }

    const body = await request.json()

    // Get user details for customer_name
    const user = await prisma.user.findUnique({
      where: { id: role === "admin" ? body.customer_id : userId },
      select: { user_name: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Create the project
    const newProject = await prisma.project.create({
      data: {
        ...body,
        customer_id: role === "admin" ? body.customer_id : userId,
        customer_name: user.user_name,
        status: body.status || "Planning", // Default status
        pricing_tier: body.pricing_tier || "Standard", // Default pricing tier
      },
    })

    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
