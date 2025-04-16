"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  FolderKanban,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  FileText,
  Users,
  CreditCard,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/stores/auth-store"
import { apiRequest } from "@/lib/useApi"
import { ENDPOINT } from "@/lib/api/end-point" // Update to the correct path
import type { Project, Task } from "@/lib/types"
import { useRouter } from "next/navigation"
import { Search, Plus, Calendar } from "lucide-react"

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
        href: "/projects/new",
        color: "from-blue-500 to-blue-600",
        iconBg: "bg-blue-500",
      },
      {
        title: "Messages",
        description: "Contact your project team",
        icon: MessageSquare,
        href: "/messages",
        color: "from-green-500 to-green-600",
        iconBg: "bg-green-500",
      },
      {
        title: "Documents",
        description: "View project documents",
        icon: FileText,
        href: "/documents",
        color: "from-amber-500 to-amber-600",
        iconBg: "bg-amber-500",
      },
      {
        title: "Payments",
        description: "Manage your subscriptions",
        icon: CreditCard,
        href: "/payments",
        color: "from-purple-500 to-purple-600",
        iconBg: "bg-purple-500",
      },
    ],
    team_member: [
      {
        title: "Tasks",
        description: "View your assigned tasks",
        icon: CheckCircle,
        href: "/tasks",
        color: "from-blue-500 to-blue-600",
        iconBg: "bg-blue-500",
      },
      {
        title: "Projects",
        description: "Manage active projects",
        icon: FolderKanban,
        href: "/projects",
        color: "from-purple-500 to-purple-600",
        iconBg: "bg-purple-500",
      },
      {
        title: "Messages",
        description: "Communicate with clients",
        icon: MessageSquare,
        href: "/messages",
        color: "from-green-500 to-green-600",
        iconBg: "bg-green-500",
      },
      {
        title: "Documents",
        description: "Access project files",
        icon: FileText,
        href: "/documents",
        color: "from-amber-500 to-amber-600",
        iconBg: "bg-amber-500",
      },
    ],
    admin: [
      {
        title: "Team",
        description: "Manage team members",
        icon: Users,
        href: "/admin/team",
        color: "from-indigo-500 to-indigo-600",
        iconBg: "bg-indigo-500",
      },
      {
        title: "Projects",
        description: "Oversee all projects",
        icon: FolderKanban,
        href: "/projects",
        color: "from-purple-500 to-purple-600",
        iconBg: "bg-purple-500",
      },
      {
        title: "Settings",
        description: "Configure system settings",
        icon: CreditCard,
        href: "/settings",
        color: "from-gray-500 to-gray-600",
        iconBg: "bg-gray-500",
      },
      {
        title: "Analytics",
        description: "View performance metrics",
        icon: ArrowUpRight,
        href: "/admin/analytics",
        color: "from-blue-500 to-blue-600",
        iconBg: "bg-blue-500",
      },
    ],
    user: [
      {
        title: "Projects",
        description: "View your projects",
        icon: FolderKanban,
        href: "/projects",
        color: "from-blue-500 to-blue-600",
        iconBg: "bg-blue-500",
      },
      {
        title: "Tasks",
        description: "Manage your tasks",
        icon: CheckCircle,
        href: "/tasks",
        color: "from-green-500 to-green-600",
        iconBg: "bg-green-500",
      },
      {
        title: "Messages",
        description: "View your messages",
        icon: MessageSquare,
        href: "/messages",
        color: "from-amber-500 to-amber-600",
        iconBg: "bg-amber-500",
      },
      {
        title: "Settings",
        description: "Configure your account",
        icon: CreditCard,
        href: "/settings",
        color: "from-purple-500 to-purple-600",
        iconBg: "bg-purple-500",
      },
    ],
  }

  const currentActions = quickActions[userRole as keyof typeof quickActions] || quickActions.user

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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {projects.slice(0, 3).length > 0 ? (
            projects.slice(0, 3).map((project) => (
              <motion.div
                key={project.id}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="overflow-hidden relative group border-border/40 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 shadow-sm hover:shadow-md transition-all duration-300"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600 z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="p-3 relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-4">
                        <h3 className="text-base font-semibold truncate">{project.title}</h3>
                        {(userRole === "admin" || userRole === "team_member") && (
                          <p className="text-xs text-muted-foreground">
                            {project._count?.tasks || 0} tasks • {project.completed_tasks || 0} completed
                          </p>
                        )}
                        {userRole === "customer" && (
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(project.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground font-medium">Progress</span>
                        <span className="font-semibold">{project.progress_percentage || 0}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${project.progress_percentage || 0}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between pt-1 mt-1 border-t border-border/30 text-xs">
                        <div className="flex items-center gap-1">
                          <Badge
                            className={`px-1.5 py-0 text-[10px] font-medium ${
                              project.progress_percentage >= 100
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : project.progress_percentage > 0
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                                  : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
                            }`}
                          >
                            {project.progress_percentage >= 100
                              ? "Completed"
                              : project.progress_percentage > 0
                                ? "In Progress"
                                : "Planning"}
                          </Badge>
                        </div>

                        {project.start_date && project.duration_days && (
                          <div className="flex items-center text-[10px] text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {calculateDueDate(project.start_date, project.duration_days)?.toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="col-span-full"
            >
              <div className="flex flex-col items-center justify-center py-16 bg-card rounded-lg border border-dashed">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No projects found</h3>
                <p className="text-muted-foreground text-center max-w-md">You don't have any projects yet</p>
                {(userRole === "admin" || userRole === "customer") && (
                  <Button className="mt-6" onClick={() => router.push("/projects/new")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                )}
              </div>
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

          <div className="space-y-4">
            {recentTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Card className="hover:shadow-sm transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {task.status === "Completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : task.status === "In Progress" ? (
                            <Clock className="h-5 w-5 text-amber-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{task.description}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {task.project?.title || "No Project"}
                            </Badge>
                            <Badge
                              className={`text-xs ${
                                task.status === "Completed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                  : task.status === "In Progress"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                              }`}
                            >
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {task.assignee && (
                        <Avatar className="h-8 w-8 hidden sm:flex">
                          <AvatarImage src={task.assignee.profile_image || undefined} alt={task.assignee.user_name} />
                          <AvatarFallback>{getInitials(task.assignee.user_name)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
