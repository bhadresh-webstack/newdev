import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { authenticateRequest } from "@/lib/auth-utils"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"

// GET all projects with role-based filtering
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { userId, role } = auth
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
      // Get projects where team member is assigned
      const assignedProjects = await prisma.projectTeamMember.findMany({
        where: {
          user_id: userId,
        },
        select: {
          project_id: true,
        },
      })

      // Get projects where team member has tasks assigned
      const tasksProjects = await prisma.task.findMany({
        where: {
          assigned_to: userId,
        },
        distinct: ["project_id"],
        select: {
          project_id: true,
        },
      })

      // Combine both sets of project IDs
      const projectIds = [
        ...assignedProjects.map((p) => p.project_id),
        ...tasksProjects.map((t) => t.project_id),
      ].filter(Boolean) // Filter out null values

      // Remove duplicates
      const uniqueProjectIds = [...new Set(projectIds)]

      if (uniqueProjectIds.length === 0) {
        return NextResponse.json({ projects: [] }, { status: 200 })
      }

      whereClause.id = { in: uniqueProjectIds }
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

    // For team members, add a flag to indicate how they're related to each project
    let enhancedProjects = projects

    if (role === "team_member") {
      // Get all project team memberships for this user
      const teamMemberships = await prisma.projectTeamMember.findMany({
        where: {
          user_id: userId,
        },
        select: {
          project_id: true,
        },
      })

      const teamMembershipIds = new Set(teamMemberships.map((tm) => tm.project_id))

      // Get all tasks assigned to this user
      const assignedTasks = await prisma.task.findMany({
        where: {
          assigned_to: userId,
        },
        select: {
          project_id: true,
        },
      })

      const taskProjectIds = new Set(assignedTasks.map((t) => t.project_id).filter(Boolean))

      // Enhance projects with relationship info
      enhancedProjects = projects.map((project) => ({
        ...project,
        isTeamMember: teamMembershipIds.has(project.id),
        hasAssignedTasks: taskProjectIds.has(project.id),
      }))
    }

    return NextResponse.json({ projects: enhancedProjects }, { status: 200 })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

// POST create a new project
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { userId, role, email } = auth

    // Only admin and customers can create projects
    if (role !== "admin" && role !== "customer") {
      return NextResponse.json({ error: "Unauthorized to create projects" }, { status: 403 })
    }

    const body = await request.json()

    // Get user details for customer_name - always use the authenticated userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { user_name: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create the project - always use the authenticated userId as customer_id
    const newProject = await prisma.project.create({
      data: {
        ...body,
        customer_id: userId,
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
