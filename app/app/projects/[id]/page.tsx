"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  FolderKanban,
  CheckCircle,
  Clock,
  Circle,
  MessageSquare,
  FileText,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Calendar,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useProjectsStore } from "@/lib/stores/projects-store"
import { useTasksStore, type Task } from "@/lib/stores/tasks-store"
// import { ENDPOINT } from "@/lib/constants/endpoints"
// import { apiRequest } from "@/lib/api-client"

// Add these imports at the top of the file
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet"
import { useTaskOperations } from "@/lib/hooks/use-task-operations"
import { apiRequest } from "@/lib/useApi"
import { ENDPOINT } from "@/lib/api/end-point"

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

// Task status icons and colors
const statusIcons = {
  Pending: <Circle className="h-4 w-4 text-slate-500" />,
  "In Progress": <Clock className="h-4 w-4 text-blue-500" />,
  Completed: <CheckCircle className="h-4 w-4 text-green-500" />,
}

const statusColors = {
  Pending: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
}

export default function ProjectDetailPage() {
  const { user } = useAuthStore()
  const { getProjectById, isLoading } = useProjectsStore()
  const { fetchTasks } = useTasksStore()

  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState(null)
  const [projectTasks, setProjectTasks] = useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)

  // Add these state variables inside the ProjectDetailPage component, after the other state declarations
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)

  // const [userRole, setUserRole] = useState<"admin" | "team" | "customer" | "user">("user")
  const userRole = user.role

  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: "Alex Johnson", role: "Project Manager", image: null },
    { id: 2, name: "Sarah Miller", role: "UI/UX Designer", image: null },
    { id: 3, name: "David Chen", role: "Frontend Developer", image: null },
  ])
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMember, setNewMember] = useState({ name: "", role: "", email: "" })

  // Get task operations
  const { handleUpdateTask } = useTaskOperations()

  const getProject = async () => {
    const { data, error } = await getProjectById(projectId)
    setProject(data)
  }

  // Function to fetch tasks for this project
  const getProjectTasks = async () => {
    setIsLoadingTasks(true)
    try {
      const url = ENDPOINT.TASK.byProject(projectId)
      const { data, error } = await apiRequest<Task[]>("GET", url)

      if (error) {
        console.error("Error fetching project tasks:", error)
        return
      }

      if (data) {
        setProjectTasks(data)
      }
    } catch (error) {
      console.error("Error fetching project tasks:", error)
    } finally {
      setIsLoadingTasks(false)
    }
  }

  useEffect(() => {
    getProject()

    // Fetch tasks when the component mounts and when projectId changes
    if (projectId) {
      getProjectTasks()
    }
  }, [projectId])

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Replace the existing handleTaskClick function with this one
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDetailOpen(true)
  }

  // Add this function to handle task status changes
  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    // Optimistically update the UI first
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({
        ...selectedTask,
        status: newStatus,
      })
    }

    // Update the task in the projectTasks array
    setProjectTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)),
    )

    // Then make the API call
    await handleUpdateTask(taskId, { status: newStatus })

    // Refresh the task list to ensure we have the latest data
    getProjectTasks()
  }

  // Add a function to handle task updates from the detail sheet
  const handleTaskUpdate = async (updatedTask: Task) => {
    // Update the task in the projectTasks array
    setProjectTasks((prevTasks) => prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))

    // Update the selected task if it's currently open
    if (selectedTask && selectedTask.id === updatedTask.id) {
      setSelectedTask(updatedTask)
    }
  }

  // Add this function to get related tasks
  const getRelatedTasks = (taskId: string, projectId: string) => {
    return projectTasks.filter((t) => t.project_id === projectId && t.id !== taskId)
  }

  const handleAddMember = () => {
    if (!newMember.name || !newMember.role) return

    const newId = teamMembers.length > 0 ? Math.max(...teamMembers.map((m) => m.id)) + 1 : 1

    setTeamMembers([
      ...teamMembers,
      {
        id: newId,
        name: newMember.name,
        role: newMember.role,
        image: null,
      },
    ])

    // Reset form
    setNewMember({ name: "", role: "", email: "" })
    setIsAddingMember(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted rounded-md w-1/3"></div>
          <div className="h-10 bg-muted rounded-md w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-muted rounded-lg md:col-span-2"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
        <div className="h-10 bg-muted rounded-md w-64"></div>
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-semibold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/app/projects")}>Back to Projects</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 md:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => router.push("/app/projects")}
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </Button>
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 capitalize ">
              {project.title}
            </h1>
            {/* <p className="text-sm text-muted-foreground mt-1">Project #{project?.id?.slice(0, 8)}</p> */}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary shadow-sm"
            onClick={() => router.push(`/app/projects/${projectId}/edit`)}
          >
            <Edit className="h-4 w-4" />
            Edit Project
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Project Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
      >
        <motion.div variants={fadeInUp} className="col-span-1 lg:col-span-2" transition={{ duration: 0.6 }}>
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 z-0"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12 z-0"></div>

            <CardHeader className="relative z-10 border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    Project Overview
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Track progress and manage tasks for {project.project_title}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary px-3 py-1">
                    {project.progress_percentage >= 100
                      ? "Completed"
                      : project.progress_percentage > 0
                        ? "In Progress"
                        : "Planning"}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-6 relative z-10">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Overall Progress</span>
                  <span className="text-primary font-bold">{project.progress_percentage}%</span>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-4 text-xs flex rounded-xl bg-primary/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress_percentage}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary to-purple-600 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Key Project Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Client</p>
                  <p className="font-medium">{project.customer_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Budget</p>
                  <p className="font-medium">${project.budget || 2500}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="font-medium">{formatDate(project.start_date || "2025-04-06T00:00:00.000Z")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="font-medium">{project.duration_days || 112} days</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <p className="font-medium capitalize">{project.priority || "Low"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Payment Type</p>
                  <p className="font-medium capitalize">{project.payment_type || "Fixed"}</p>
                </div>
              </div>

              {/* Only show detailed stats to team members and admins */}
              {(userRole === "admin" || userRole === "team") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-2">
                  <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }} className="group">
                    <Card className="border border-slate-200 dark:border-slate-700 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:border-primary/50">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
                          <FolderKanban className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{project.total_tasks}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }} className="group">
                    <Card className="border border-slate-200 dark:border-slate-700 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:border-primary/50">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-md shadow-green-500/20 group-hover:shadow-green-500/40 transition-all duration-300">
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Completed</p>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {project.completed_tasks}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }} className="group">
                    <Card className="border border-slate-200 dark:border-slate-700 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:border-primary/50">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                            {project.total_tasks - project.completed_tasks}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp} className="relative" transition={{ duration: 0.6, delay: 0.2 }}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl -m-1 blur-xl"></div>
          <Card className="h-full border-none shadow-lg backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 relative z-10">
            <CardHeader className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                  Additional Details
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="pr-2">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { label: "Created", value: formatDate(project.created_at || "2025-04-06T09:55:43.919Z") },
                    { label: "Last Updated", value: formatDate(project.updated_at || "2025-04-06T09:55:44.296Z") },
                    { label: "Pricing Tier", value: project.pricing_tier || "Standard", isCapitalize: true },
                    { label: "Visibility", value: project.visibility || "Public", isCapitalize: true },
                    {
                      label: "Required Skills",
                      value: project.required_skills || "React, Next.js, TypeScript, Node.js",
                    },
                    { label: "Deliverables", value: project.deliverables || "Homepage design is urgent" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="py-3 px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <p className="text-sm font-medium text-muted-foreground mb-1">{item.label}</p>
                      <p className={`font-medium ${item.isCapitalize ? "capitalize" : ""}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Tabs defaultValue={userRole === "customer" ? "messages" : "tasks"} className="w-full">
        <TabsList
          className={`grid ${userRole === "customer" ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"} w-full max-w-md`}
        >
          {(userRole === "admin" || userRole === "team") && (
            <>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Team
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Files
          </TabsTrigger>
        </TabsList>

        {(userRole === "admin" || userRole === "team") && (
          <TabsContent value="tasks" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Project Tasks</h2>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>

            {isLoadingTasks ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="h-24 bg-muted rounded-lg"></div>
                ))}
              </div>
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                {projectTasks.length > 0 ? (
                  projectTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      variants={fadeInUp}
                      onClick={() => handleTaskClick(task)}
                      className="cursor-pointer"
                    >
                      <Card className="hover:shadow-md transition-all">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {statusIcons[task.status] || <Circle className="h-4 w-4 text-slate-500" />}
                              </div>
                              <div>
                                <CardTitle className="text-lg">{task.title}</CardTitle>
                                <CardDescription className="mt-1 line-clamp-2">{task.description}</CardDescription>
                                {task.due_date && (
                                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                    {new Date(task.due_date).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge className={statusColors[task.status] || "bg-slate-100 text-slate-800"}>
                              {task.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardFooter className="flex justify-between pt-4 border-t mt-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Updated {formatDate(task.updated_at || task.created_at)}</span>
                          </div>
                          {task.assignee && (
                            <div className="flex items-center gap-2">
                              <p className="text-sm">Assigned to:</p>
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={task.assignee.profile_image || undefined}
                                  alt={task.assignee.user_name}
                                />
                                <AvatarFallback>{getInitials(task.assignee.user_name)}</AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <div className="rounded-full bg-muted p-3 mb-4">
                        <CheckCircle className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        This project doesn't have any tasks yet. Create your first task to get started.
                      </p>
                      <Button className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Add Task
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </TabsContent>
        )}

        {(userRole === "admin" || userRole === "team") && (
          <TabsContent value="tasks" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Project Tasks</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage and track tasks for this project</p>
              </div>
              <Button className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>

            {isLoadingTasks ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="h-24 bg-muted rounded-lg"></div>
                ))}
              </div>
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                {projectTasks.length > 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-border/50 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
                      <div className="col-span-6 md:col-span-5">Task</div>
                      <div className="col-span-3 md:col-span-2 text-center">Status</div>
                      <div className="hidden md:block md:col-span-2">Due Date</div>
                      <div className="col-span-3 md:col-span-3 text-right">Assigned To</div>
                    </div>

                    <div className="divide-y divide-border/50">
                      {projectTasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          variants={fadeInUp}
                          className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="grid grid-cols-12 gap-4 p-4 items-center relative">
                            {/* Priority indicator */}
                            {task.priority === "High" && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                            )}
                            {task.priority === "Medium" && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                            )}

                            {/* Task title and description */}
                            <div className="col-span-6 md:col-span-5 flex items-start gap-3">
                              <div className="mt-1 flex-shrink-0">
                                {task.status === "Completed" ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : task.status === "In Progress" ? (
                                  <Clock className="h-5 w-5 text-blue-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium text-base group-hover:text-primary transition-colors line-clamp-1">
                                  {task.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{task.description}</p>
                                {task.due_date && (
                                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                    {new Date(task.due_date).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0 border-muted-foreground/30 bg-background"
                                  >
                                    {task.task_group || "Backlog"}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Created {new Date(task.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status */}
                            <div className="col-span-3 md:col-span-2 flex justify-center">
                              <Badge
                                className={`${
                                  task.status === "Completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                    : task.status === "In Progress"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                                      : task.status === "Blocked"
                                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                        : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
                                } px-2.5 py-0.5 font-medium`}
                              >
                                {task.status}
                              </Badge>
                            </div>

                            {/* Due Date */}
                            <div className="hidden md:flex md:col-span-2 items-center text-sm">
                              {task.due_date ? (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">No due date</span>
                              )}
                            </div>

                            {/* Assigned To */}
                            <div className="col-span-3 md:col-span-3 flex items-center justify-end gap-2">
                              {task.assignee ? (
                                <div className="flex items-center gap-2">
                                  <div className="hidden md:block text-sm text-right">
                                    <p className="font-medium line-clamp-1">{task.assignee.user_name}</p>
                                  </div>
                                  <Avatar className="h-8 w-8 border-2 border-background">
                                    <AvatarImage
                                      src={task.assignee.profile_image || undefined}
                                      alt={task.assignee.user_name}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs">
                                      {getInitials(task.assignee.user_name)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800">
                                  Unassigned
                                </Badge>
                              )}
                            </div>

                            {/* Action button that appears on hover */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="border border-dashed bg-background/50">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="rounded-full bg-primary/10 p-4 mb-4">
                        <CheckCircle className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">No tasks found</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        This project doesn't have any tasks yet. Create your first task to get started.
                      </p>
                      <Button className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                        <Plus className="h-4 w-4" />
                        Create First Task
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </TabsContent>
        )}

        {(userRole === "admin" || userRole === "team") && (
          <TabsContent value="team" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Team Members</h2>
              <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Add a new team member to this project. They will have access to project resources.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        className="col-span-3"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        className="col-span-3"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">
                        Role
                      </Label>
                      <Select
                        value={newMember.role}
                        onValueChange={(value) => setNewMember({ ...newMember, role: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Project Manager">Project Manager</SelectItem>
                          <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                          <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                          <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                          <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                          <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleAddMember}>
                      Add to Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.image || undefined} alt={member.name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="messages" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Project Messages</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Message
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  {
                    sender: "Alex Johnson",
                    message:
                      "I've updated the homepage design based on client feedback. Please review when you get a chance.",
                    time: "2 days ago",
                  },
                  {
                    sender: "Sarah Miller",
                    message: "The new color scheme looks great! I've made some minor adjustments to the spacing.",
                    time: "1 day ago",
                  },
                ].map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                        {getInitials(message.sender)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{message.sender}</p>
                        <p className="text-xs text-muted-foreground">{message.time}</p>
                      </div>
                      <p className="text-sm mt-1">{message.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                      {getInitials("You")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      className="w-full p-2 rounded-md border min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Type your message here..."
                    ></textarea>
                    <div className="flex justify-end mt-2">
                      <Button>Send Message</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Project Files</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Upload File
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Homepage Design.fig", type: "Design", size: "2.4 MB", date: "Mar 15, 2023" },
                  { name: "Project Requirements.pdf", type: "Document", size: "1.2 MB", date: "Mar 10, 2023" },
                  { name: "Logo Assets.zip", type: "Archive", size: "4.7 MB", date: "Mar 12, 2023" },
                ].map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-primary/10">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <span>{file.type}</span>
                              <span className="mx-2">•</span>
                              <span>{file.size}</span>
                              <span className="mx-2">•</span>
                              <span>{file.date}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Add the TaskDetailSheet component at the end of the return statement, just before the closing </div> */}
      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          isOpen={isTaskDetailOpen}
          onClose={() => setIsTaskDetailOpen(false)}
          onStatusChange={handleTaskStatusChange}
          relatedTasks={getRelatedTasks(selectedTask.id, selectedTask.project_id)}
          handleUpdateTask={handleUpdateTask}
        />
      )}
    </div>
  )
}
