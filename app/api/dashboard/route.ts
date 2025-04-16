import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

// GET dashboard data based on user role
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { userId, role } = auth

    if(!userId){
      return NextResponse.json({ error: "User ID not found" }, { status: 401 })
    }

    // Base response structure
    const response: any = {
      stats: {},
      recentProjects: [],
    }

    // Fetch data based on user role
    if (role === "admin") {
      // Admin dashboard data
      await fetchAdminDashboardData(userId, response)
    } else if (role === "team_member") {
      // Team member dashboard data
      await fetchTeamMemberDashboardData(userId, response)
    } else {
      // Customer dashboard data
      await fetchCustomerDashboardData(userId, response)
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

// Fetch admin dashboard data
async function fetchAdminDashboardData(userId: string, response: any) {
  // Get total projects count
  const totalProjects = await prisma.project.count()

  // Get tasks statistics
  const pendingTasks = await prisma.task.count({
    where: { status: { notIn: ["Completed"] } },
  })

  // Get customers count
  const customersCount = await prisma.user.count({
    where: { role: "customer" },
  })

  // Get team members count
  const teamMembersCount = await prisma.user.count({
    where: { role: "team_member" },
  })

  // Get recent projects
  const recentProjects = await prisma.project.findMany({
    take: 3,
    orderBy: { created_at: "desc" },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  })

  // Get recent tasks
  const recentTasks = await prisma.task.findMany({
    take: 3,
    orderBy: { created_at: "desc" },
    include: {
      project: {
        select: { title: true },
      },
      assignee: {
        select: {
          id: true,
          user_name: true,
          profile_image: true,
        },
      },
    },
  })

  // Format projects data
  const formattedProjects = recentProjects.map((project) => ({
    project_id: project.id,
    project_title: project.title,
    progress_percentage: project.progress_percentage || 0,
    total_tasks: project._count.tasks,
    completed_tasks: project.completed_tasks || 0,
  }))

  // Set response data
  response.stats = {
    totalProjects,
    pendingTasks,
    customersCount,
    teamMembersCount,
  }
  response.recentProjects = formattedProjects
  response.recentTasks = recentTasks
}

// Fetch team member dashboard data
async function fetchTeamMemberDashboardData(userId: string, response: any) {
  // Get projects where team member is assigned
  const assignedProjects = await prisma.projectTeamMember.findMany({
    where: { user_id: userId },
    select: { project_id: true },
  })

  // Get projects where team member has tasks assigned
  const tasksProjects = await prisma.task.findMany({
    where: { assigned_to: userId },
    distinct: ["project_id"],
    select: { project_id: true },
  })

  // Combine both sets of project IDs
  const projectIds = [...assignedProjects.map((p) => p.project_id), ...tasksProjects.map((t) => t.project_id)].filter(
    Boolean,
  )

  // Remove duplicates
  const uniqueProjectIds = [...new Set(projectIds)]

  // Get total projects count
  const totalProjects = uniqueProjectIds.length

  // Get tasks statistics
  const completedTasks = await prisma.task.count({
    where: {
      assigned_to: userId,
      status: "Completed",
    },
  })

  const inProgressTasks = await prisma.task.count({
    where: {
      assigned_to: userId,
      status: "In Progress",
    },
  })

  const pendingTasks = await prisma.task.count({
    where: {
      assigned_to: userId,
      status: { notIn: ["Completed", "In Progress"] },
    },
  })

  // Get recent projects
  const recentProjects = await prisma.project.findMany({
    where: {
      id: { in: uniqueProjectIds },
    },
    take: 3,
    orderBy: { updated_at: "desc" },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  })

  // Get recent tasks
  const recentTasks = await prisma.task.findMany({
    where: {
      assigned_to: userId,
    },
    take: 3,
    orderBy: { updated_at: "desc" },
    include: {
      project: {
        select: { title: true },
      },
      assignee: {
        select: {
          id: true,
          user_name: true,
          profile_image: true,
        },
      },
    },
  })

  // Format projects data
  const formattedProjects = recentProjects.map((project) => ({
    project_id: project.id,
    project_title: project.title,
    progress_percentage: project.progress_percentage || 0,
    total_tasks: project._count.tasks,
    completed_tasks: project.completed_tasks || 0,
  }))

  // Set response data
  response.stats = {
    totalProjects,
    completedTasks,
    inProgressTasks,
    pendingTasks,
  }
  response.recentProjects = formattedProjects
  response.recentTasks = recentTasks
}

// Fetch customer dashboard data
async function fetchCustomerDashboardData(userId: string, response: any) {
  // Get total projects count
  const totalProjects = await prisma.project.count({
    where: { customer_id: userId },
  })

  // Get in-progress tasks count
  const inProgressTasks = await prisma.task.count({
    where: {
      project: { customer_id: userId },
      status: "In Progress",
    },
  })

  // Get pending feedback count (tasks awaiting feedback)
  const pendingTasks = await prisma.task.count({
    where: {
      project: { customer_id: userId },
      status: { notIn: ["Completed", "In Progress"] },
    },
  })

  // Get recent projects
  const recentProjects = await prisma.project.findMany({
    where: { customer_id: userId },
    take: 3,
    orderBy: { updated_at: "desc" },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  })

  // Format projects data
  const formattedProjects = recentProjects.map((project) => ({
    project_id: project.id,
    project_title: project.title,
    progress_percentage: project.progress_percentage || 0,
    total_tasks: project._count.tasks,
    completed_tasks: project.completed_tasks || 0,
  }))

  // Set response data
  response.stats = {
    totalProjects,
    inProgressTasks,
    pendingTasks,
    subscription: "Active", // Assuming subscription is always active for simplicity
  }
  response.recentProjects = formattedProjects
}

// Fetch default user dashboard data
async function fetchDefaultDashboardData(userId: string, response: any) {
  // Get total projects count
  const totalProjects = await prisma.project.count({
    where: { customer_id: userId },
  })

  // Get recent projects
  const recentProjects = await prisma.project.findMany({
    where: { customer_id: userId },
    take: 3,
    orderBy: { updated_at: "desc" },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  })

  // Format projects data
  const formattedProjects = recentProjects.map((project) => ({
    project_id: project.id,
    project_title: project.title,
    progress_percentage: project.progress_percentage || 0,
    total_tasks: project._count.tasks,
    completed_tasks: project.completed_tasks || 0,
  }))

  // Set response data
  response.stats = {
    totalProjects,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
  }
  response.recentProjects = formattedProjects
}
