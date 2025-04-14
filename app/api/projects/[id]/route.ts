import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma" // Importar la instancia singleton en lugar de crear una nueva

// GET a specific project by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Await the params object to get id
    const { id: projectId } = await params
    const { userId, role } = auth

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        customer: {
          select: {
            id: true,
            user_name: true,
            email: true,
            profile_image: true,
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                user_name: true,
                profile_image: true,
              },
            },
          },
        },
        feedbacks: true,
        files: {
          include: {
            uploader: {
              select: {
                id: true,
                user_name: true,
                profile_image: true,
              },
            },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if user has access to this project
    if (role === "admin") {
      // Admin can access any project
    } else if (role === "team_member") {
      // Team member can access if they have assigned tasks OR if they're part of the project team
      const hasAssignedTask = await prisma.task.findFirst({
        where: {
          project_id: projectId,
          assigned_to: userId,
        },
      })

      // Check if they're part of the project team
      const isProjectTeamMember = await prisma.projectTeamMember.findFirst({
        where: {
          project_id: projectId,
          user_id: userId,
        },
      })

      // Allow access if either condition is true
      if (!hasAssignedTask && !isProjectTeamMember) {
        return NextResponse.json({ error: "Unauthorized to access this project" }, { status: 403 })
      }
    } else if (role === "customer") {
      // Customer can only access their own projects
      if (project.customer_id !== userId) {
        return NextResponse.json({ error: "Unauthorized to access this project" }, { status: 403 })
      }
    }

    return NextResponse.json(project, { status: 200 })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

// PATCH update a specific project
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Await the params object to get id
    const { id: projectId } = await params
    const { userId, role } = auth
    const body = await request.json()

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Only admin can update projects
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Only admins can update projects." }, { status: 403 })
    }

    // Filter out fields that don't exist in the Prisma schema
    // Only include fields that are known to exist in the Project model
    const validFields = {
      title: body.title,
      description: body.description,
      status: body.status,
      pricing_tier: body.pricing_tier,
      technical_requirements: body.technical_requirements,
      required_skills: body.required_skills,
      deliverables: body.deliverables,
      budget: body.budget,
      payment_type: body.payment_type,
      start_date: body.start_date ? new Date(body.start_date) : undefined,
      duration_days: body.duration_days,
      priority: body.priority,
      visibility: body.visibility,
      progress_percentage: body.progress_percentage,
      total_tasks: body.total_tasks,
      completed_tasks: body.completed_tasks,
      updated_at: new Date(),
    }

    // Remove undefined fields
    const updateData = Object.fromEntries(Object.entries(validFields).filter(([_, value]) => value !== undefined))

    // Update the project with filtered data
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    })

    return NextResponse.json(updatedProject, { status: 200 })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

// DELETE a specific project
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Await the params object to get id
    const { id: projectId } = await params
    const { userId, role } = auth

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Only admin can delete projects
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Only admins can delete projects." }, { status: 403 })
    }

    // Delete all related records first (to avoid foreign key constraints)
    await prisma.$transaction([
      prisma.task.deleteMany({ where: { project_id: projectId } }),
      prisma.feedback.deleteMany({ where: { project_id: projectId } }),
      prisma.iteration.deleteMany({ where: { project_id: projectId } }),
      prisma.payment.updateMany({
        where: { project_id: projectId },
        data: { project_id: null }, // Set to null instead of deleting
      }),
      prisma.message.deleteMany({ where: { project_id: projectId } }),
      prisma.file.deleteMany({ where: { project_id: projectId } }),
      prisma.project.delete({ where: { id: projectId } }),
    ])

    return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
