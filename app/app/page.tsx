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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { demoProjects, demoTasks } from "@/lib/data-utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/stores/auth-store"

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

  const {user,isLoading} = useAuthStore()
  // const [userRole, setUserRole] = useState<string>("user")
  // const [userName, setUserName] = useState<string>("User")
  // const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState(demoProjects)
  const [recentTasks, setRecentTasks] = useState(demoTasks.slice(0, 3))
  const [stats, setStats] = useState({
    totalProjects: demoProjects.length,
    completedTasks: demoTasks.filter((t) => t.status === "Completed").length,
    pendingTasks: demoTasks.filter((t) => t.status === "Pending").length,
    inProgressTasks: demoTasks.filter((t) => t.status === "In Progress").length,
  })

  const userRole = user?.role
  const userName = user?.user_name

  // useEffect(() => {
  //   console.log("user",user)
  //   // Get user role from localStorage
  //   if (typeof window !== "undefined") {
  //     const storedRole = localStorage.getItem("userRole") || "user"
  //     setUserRole(storedRole)

  //     // Set user name based on role
  //     if (storedRole === "admin") {
  //       setUserName("Admin")
  //     } else if (storedRole === "customer") {
  //       setUserName("Customer")
  //     } else if (storedRole === "team") {
  //       setUserName("Team Member")
  //     }
  //   }

  //   // Simulate loading data
  //   const timer = setTimeout(() => {
  //     setIsLoading(false)
  //   }, 1000)

  //   return () => clearTimeout(timer)
  // }, [])

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
      {
        title: "Documents",
        description: "View project documents",
        icon: FileText,
        href: "/app/documents",
        color: "from-amber-500 to-amber-600",
        iconBg: "bg-amber-500",
      },
      {
        title: "Payments",
        description: "Manage your subscriptions",
        icon: CreditCard,
        href: "/app/payments",
        color: "from-purple-500 to-purple-600",
        iconBg: "bg-purple-500",
      },
    ],
    team: [
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
      {
        title: "Documents",
        description: "Access project files",
        icon: FileText,
        href: "/app/documents",
        color: "from-amber-500 to-amber-600",
        iconBg: "bg-amber-500",
      },
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
    user: [
      {
        title: "Projects",
        description: "View your projects",
        icon: FolderKanban,
        href: "/app/projects",
        color: "from-blue-500 to-blue-600",
        iconBg: "bg-blue-500",
      },
      {
        title: "Tasks",
        description: "Manage your tasks",
        icon: CheckCircle,
        href: "/app/tasks",
        color: "from-green-500 to-green-600",
        iconBg: "bg-green-500",
      },
      {
        title: "Messages",
        description: "View your messages",
        icon: MessageSquare,
        href: "/app/messages",
        color: "from-amber-500 to-amber-600",
        iconBg: "bg-amber-500",
      },
      {
        title: "Settings",
        description: "Configure your account",
        icon: CreditCard,
        href: "/app/settings",
        color: "from-purple-500 to-purple-600",
        iconBg: "bg-purple-500",
      },
    ],
  }

  const currentActions = quickActions[userRole as keyof typeof quickActions] || quickActions.user

  if (isLoading) {
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
                      <p className="text-sm font-medium text-muted-foreground">Subscription</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">Active</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : userRole === "admin" ? (
          // Admin Stats
          <>
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
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
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.pendingTasks}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
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
                      <p className="text-sm font-medium text-muted-foreground">Customers</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">24</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Users className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
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
                      <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">12</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          // Team Member Stats
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
                      <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.completedTasks}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
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
                      <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.inProgressTasks}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Clock className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                      <h3 className="text-2xl md:text-3xl font-bold mt-1">{stats.pendingTasks}</h3>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-red-600 dark:text-red-400" />
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
            <Link href="/app/projects">
              View All
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {projects.slice(0, 3).map((project, index) => (
            <motion.div
              key={project.project_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Link href={`/app/projects/${project.project_id}`}>
                <Card className="h-full hover:shadow-md transition-all cursor-pointer overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{project.project_title}</CardTitle>
                    {userRole !== "customer" && (
                      <CardDescription>
                        {project.total_tasks} tasks • {project.completed_tasks} completed
                      </CardDescription>
                    )}
                    {userRole === "customer" && <CardDescription>Project ID: {project.project_id}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{project.progress_percentage}%</span>
                      </div>
                      <Progress value={project.progress_percentage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Tasks - Only visible for team members and admins */}
      {(userRole === "team" || userRole === "admin") && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Tasks</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/app/tasks">
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
                              {task.project.title}
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
                      {task.assigned_to_profile && (
                        <Avatar className="h-8 w-8 hidden sm:flex">
                          <AvatarImage
                            src={task.assigned_to_profile.profile_image || undefined}
                            alt={`${task.assigned_to_profile.first_name} ${task.assigned_to_profile.last_name}`}
                          />
                          <AvatarFallback>
                            {getInitials(
                              `${task.assigned_to_profile.first_name} ${task.assigned_to_profile.last_name}`,
                            )}
                          </AvatarFallback>
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
