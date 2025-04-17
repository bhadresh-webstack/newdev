"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  FolderKanban,
  ArrowUpRight,
  Clock,
  CheckCircle,
  MessageSquare,
  FileText,
  Users,
  CreditCard,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/lib/stores/auth-store"
import { apiRequest } from "@/lib/useApi"
import { ENDPOINT } from "@/lib/api/end-point" // Update to the correct path
import type { Project, Task } from "@/lib/types"
import { useRouter } from "next/navigation"
import { ProjectCard } from "@/components/projects/project-card"
import { EmptyProjects } from "@/components/projects/empty-projects"
import { ProjectTaskList } from "@/components/projects/project-task-list"
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet"
import { useTaskOperations } from "@/lib/hooks/use-task-operations"
import { useToast } from "@/hooks/use-toast"
import type { Task as TaskType } from "@/lib/stores/tasks-store"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Add state for task detail sheet
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)

  const { handleUpdateTask } = useTaskOperations()
  const { toast } = useToast()

  const userRole = user?.role || "user"
  const userName = user?.user_name || "User"

  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        // Fetch projects
        const { data: projectsData } = await apiRequest<{ projects: Project[] }>("GET", ENDPOINT.PROJECT.base)

        if (projectsData) {
          setProjects(projectsData.projects || [])

          // Calculate stats directly from projects data
          const totalProjects = projectsData.projects?.length || 0
          const inDevelopment =
            projectsData.projects?.filter((p) => p.progress_percentage > 0 && p.progress_percentage < 100).length || 0
          const awaitingFeedback =
            projectsData.projects?.filter((p) => p.status === "Pending" || p.status === "Review").length || 0
          const completedProjects =
            projectsData.projects?.filter((p) => p.progress_percentage >= 100 || p.status === "Completed").length || 0

          setStats({
            totalProjects,
            completedTasks: completedProjects,
            pendingTasks: awaitingFeedback,
            inProgressTasks: inDevelopment,
          })
        }

        // Fetch recent tasks
        const { data: tasksData } = await apiRequest<Task[]>("GET", ENDPOINT.TASK.base)

        if (tasksData) {
          // Sort by most recent and take first 3
          const sortedTasks = [...tasksData]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)

          setRecentTasks(sortedTasks)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user && !authLoading) {
      fetchDashboardData()
    }
  }, [user, authLoading])

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Quick action cards based on user role
  const quickActions = {
    customer: [
      {
        title: "New Project",
        description: "Start a new website project",
        icon: FolderKanban,
        href: "/app/projects/new",
        color: "from-blue-500 to-blue-600",
        iconBg: "bg-blue-500",
      },
      {
        title: "Messages",
        description: "Contact your project team",
        icon: MessageSquare,
        href: "/app/messages",
        color: "from-green-500 to-green-600",
        iconBg: "bg-green-500",
      },
      // {
      //   title: "Documents",
      //   description: "View project documents",
      //   icon: FileText,
      //   href: "/app/documents",
      //   color: "from-amber-500 to-amber-600",
      //   iconBg: "bg-amber-500",
      // },
      {
        title: "Payments",
        description: "Manage your subscriptions",
        icon: CreditCard,
        href: "/app/payments",
        color: "from-purple-500 to-purple-600",
        iconBg: "bg-purple-500",
      },
    ],
    team_member: [
      {
        title: "Tasks",
        description: "View your assigned tasks",
        icon: CheckCircle,
        href: "/app/tasks",
        color: "from-blue-500 to-blue-600",
        iconBg: "bg-blue-500",
      },
      {
        title: "Projects",
        description: "Manage active projects",
        icon: FolderKanban,
        href: "/app/projects",
        color: "from-purple-500 to-purple-600",
        iconBg: "bg-purple-500",
      },
      {
        title: "Messages",
        description: "Communicate with clients",
        icon: MessageSquare,
        href: "/app/messages",
        color: "from-green-500 to-green-600",
        iconBg: "bg-green-500",
      },
      // {
      //   title: "Documents",
      //   description: "Access project files",
      //   icon: FileText,
      //   href: "/app/documents",
      //   color: "from-amber-500 to-amber-600",
      //   iconBg: "bg-amber-500",
      // },
    ],
    admin: [
      {
        title: "Team",
        description: "Manage team members",
        icon: Users,
        href: "/app/admin/team",
        color: "from-indigo-500 to-indigo-600",
        iconBg: "bg-indigo-500",
      },
      {
        title: "Projects",
        description: "Oversee all projects",
        icon: FolderKanban,
        href: "/app/projects",
        color: "from-purple-500 to-purple-600",
        iconBg: "bg-purple-500",
      },
      {
        title: "Settings",
        description: "Configure system settings",
        icon: CreditCard,
        href: "/app/settings",
        color: "from-gray-500 to-gray-600",
        iconBg: "bg-gray-500",
      },
      {
        title: "Analytics",
        description: "View performance metrics",
        icon: ArrowUpRight,
        href: "/app/admin/analytics",
        color: "from-blue-500 to-blue-600",
        iconBg: "bg-blue-500",
      },
    ],
  }

  const currentActions = quickActions[userRole as keyof typeof quickActions] || quickActions.user

  // Add task click handler
  const handleTaskClick = (task: TaskType) => {
    setSelectedTask(task)
    setIsTaskDetailOpen(true)
  }

  // Add task status change handler
  const handleTaskStatusChange = async (taskId: string, newStatus: string): Promise<void> => {
    try {
      // Optimistically update the UI first
      const taskToUpdate = recentTasks.find((t) => t.id === taskId)
      if (taskToUpdate) {
        // Update the selected task if it's open in the detail view
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...selectedTask,
            status: newStatus,
          })
        }

        // Update the task in the recentTasks array
        setRecentTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)),
        )
      }

      // Then make the API call
      await handleUpdateTask(taskId, { status: newStatus })

      // Show success message
      toast({
        title: "Success",
        description: `Task status updated to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating task status:", error)

      // Show error message
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      })

      // Revert optimistic update if there was an error
      if (selectedTask && selectedTask.id === taskId) {
        const originalTask = recentTasks.find((t) => t.id === taskId)
        if (originalTask) {
          setSelectedTask(originalTask)
        }
      }
    }
  }

  // Add task update handler
  const handleTaskUpdate = async (updatedTask: TaskType): Promise<void> => {
    try {
      // Update the task in the recentTasks array
      setRecentTasks((prevTasks) => prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))

      // Update the selected task if it's currently open
      if (selectedTask && selectedTask.id === updatedTask.id) {
        setSelectedTask(updatedTask)
      }

      // Show success message
      toast({
        title: "Success",
        description: "Task updated successfully",
      })
    } catch (error) {
      console.error("Error updating task:", error)

      // Show error message
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Add function to get related tasks
  const getRelatedTasks = (taskId: string, projectId: string): TaskType[] => {
    return recentTasks.filter((t) => t.project_id === projectId && t.id !== taskId)
  }

  if (isLoading || authLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-muted rounded-md w-2/3"></div>
        <div className="h-4 bg-muted rounded-md w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    )
  }

  // Calculate due date from start date and duration
  const calculateDueDate = (startDate: string | undefined, durationDays: number | undefined) => {
    if (!startDate || !durationDays) return null

    const date = new Date(startDate)
    date.setDate(date.getDate() + durationDays)
    return date
  }

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-semibold tracking-tight"
        >
          Welcome back, {userName}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground"
        >
          Here's an overview of your {userRole === "customer" ? "projects" : "workspace"}
        </motion.p>
      </div>

      {/* Stats Overview */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {userRole === "customer" ? (
          // Customer Stats
          <>
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.totalProjects}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FolderKanban className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">In Development</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.inProgressTasks}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Clock className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Awaiting Feedback</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.pendingTasks}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.completedTasks}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : userRole === "admin" ? (
          // Admin Stats - also update these to use the same pattern
          <>
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.totalProjects}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FolderKanban className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">In Development</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.inProgressTasks}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Clock className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Awaiting Feedback</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.pendingTasks}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.completedTasks}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          // Team Member Stats - update these too
          <>
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.totalProjects}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FolderKanban className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">In Development</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.inProgressTasks}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Clock className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Awaiting Feedback</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.pendingTasks}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.completedTasks}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {currentActions.map((action, index) => (
            <motion.div
              key={action.title}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <Link href={action.href}>
                <Card className="h-full hover:shadow-md transition-all cursor-pointer overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${action.color}`}></div>
                  <CardContent className="p-4 md:p-6 flex items-start gap-4">
                    <div
                      className={`h-10 w-10 md:h-12 md:w-12 rounded-full ${action.iconBg} text-white flex items-center justify-center shadow-lg`}
                    >
                      <action.icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/projects">
              View All
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.length > 0 ? (
            projects
              .slice(0, 3)
              .map((project) => (
                <ProjectCard key={project.id} project={project} onDelete={() => {}} isDeleting={false} />
              ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="col-span-full"
            >
              <EmptyProjects searchQuery={""} userRole={userRole} />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Recent Tasks - Only visible for team members and admins */}
      {(userRole === "team_member" || userRole === "admin") && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Tasks</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/tasks">
                View All
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {recentTasks.length > 0 ? (
            <ProjectTaskList tasks={recentTasks} onTaskClick={handleTaskClick} />
          ) : (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No recent tasks</h3>
                <p className="text-muted-foreground mt-1">You don't have any tasks assigned to you yet.</p>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Task Detail Sheet */}
      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          isOpen={isTaskDetailOpen}
          onClose={() => setIsTaskDetailOpen(false)}
          onStatusChange={handleTaskStatusChange}
          relatedTasks={selectedTask ? getRelatedTasks(selectedTask.id, selectedTask.project_id) : []}
          handleUpdateTask={handleUpdateTask}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </div>
  )
}
