"use client"

import { useState, useEffect, useRef } from "react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useProjectsStore, type Project } from "@/lib/stores/projects-store"
import { useTasksStore } from "@/lib/stores/tasks-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import type { Task as TaskType } from "@/lib/stores/tasks-store"
import { apiRequest } from "@/lib/useApi"
// import { ENDPOINT } from "@/lib/constants/endpoints"
import { useToast } from "@/hooks/use-toast"

// Add these imports at the top of the file
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet"
import { useTaskOperations } from "@/lib/hooks/use-task-operations"
import { ENDPOINT } from "@/lib/api/end-point"
import { NewTaskForm } from "@/components/tasks/new-task-form"
import {
  initializeProjectConnection,
  addMessageListener,
  removeMessageListener,
  closeProjectConnection,
  sendMessage as sendMessageToServer,
} from "@/lib/socket"

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
  const { toast } = useToast()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  // Get functions from stores
  const { getProjectById, updateProject, deleteProject } = useProjectsStore()
  const { fetchTasks, fetchTaskGroups, fetchStatusSummary } = useTasksStore()
  const { handleUpdateTask } = useTaskOperations()

  const [project, setProject] = useState<Project | null>(null)
  const [projectTasks, setProjectTasks] = useState<TaskType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const [isLoadingTeam, setIsLoadingTeam] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)

  // Add these state variables inside the ProjectDetailPage component, after the other state declarations
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  const [isNewTaskFormOpen, setIsNewTaskFormOpen] = useState(false)

  const userRole = user?.role || "user"

  const [teamMembers, setTeamMembers] = useState([])
  const [messages, setMessages] = useState([])
  const [files, setFiles] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMember, setNewMember] = useState({ name: "", role: "", email: "" })
  const [isDeleting, setIsDeleting] = useState(false)

  // Inside the ProjectDetailPage component, add this socket-related code after the state declarations
  const socket = useRef(null)

  // Add this effect to initialize SSE connection and message listeners
  useEffect(() => {
    if (projectId && user?.id) {
      // Initialize SSE connection for this project
      initializeProjectConnection(projectId, user.id)

      // Set up message listener
      const handleNewMessage = (message, isReplacement) => {
        console.log("New message received:", message, isReplacement ? "(replacement)" : "")

        // Add the new message to the state if it's not already there
        setMessages((prevMessages) => {
          if (isReplacement) {
            // Replace the temporary message with the real one
            return prevMessages.map((m) =>
              m.id.toString().startsWith("temp-") && m.sender_id === message.sender_id && m.message === message.message
                ? { ...message, isTemp: false }
                : m,
            )
          } else {
            // Check if message already exists
            const exists = prevMessages.some((m) => m.id === message.id)
            if (exists) return prevMessages
            return [...prevMessages, message]
          }
        })
      }

      // Add the message listener
      addMessageListener(projectId, handleNewMessage)

      // Clean up on unmount
      return () => {
        removeMessageListener(projectId, handleNewMessage)
        closeProjectConnection(projectId)
      }
    }
  }, [projectId, user?.id])

  // Fetch project data
  const getProject = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await getProjectById(projectId)

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      if (data) {
        setProject(data)
      }
    } catch (error) {
      console.error("Error fetching project:", error)
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to fetch tasks for this project
  const getProjectTasks = async () => {
    setIsLoadingTasks(true)
    try {
      // Use the byProject endpoint directly to get tasks for this specific project
      const url = ENDPOINT.TASK.byProject(projectId)
      const { data, error } = await apiRequest<TaskType[]>("GET", url)

      if (error) {
        console.error("Error fetching project tasks:", error)
        toast({
          title: "Error",
          description: "Failed to load project tasks",
          variant: "destructive",
        })
        return
      }

      // Set the tasks directly from the response
      if (data) {
        console.log("Project tasks loaded:", data)
        setProjectTasks(data)
      } else {
        setProjectTasks([])
      }
    } catch (error) {
      console.error("Error fetching project tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load project tasks",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTasks(false)
    }
  }

  // Function to fetch team members
  const getTeamMembers = async () => {
    setIsLoadingTeam(true)
    try {
      // Replace with your actual endpoint for team members
      const { data, error } = await apiRequest("GET", ENDPOINT.AUTH.allTeamMember)

      if (error) {
        console.error("Error fetching team members:", error)
        return
      }

      if (data?.team_members) {
        setTeamMembers(data.team_members)
      }
    } catch (error) {
      console.error("Error fetching team members:", error)
    } finally {
      setIsLoadingTeam(false)
    }
  }

  // Function to fetch project messages
  const getProjectMessages = async () => {
    setIsLoadingMessages(true)
    try {
      const { data, error } = await apiRequest("GET", ENDPOINT.PROJECT.messages(projectId))

      if (error) {
        console.error("Error fetching project messages:", error)
        return
      }

      if (data?.messages) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Error fetching project messages:", error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Function to fetch project files
  const getProjectFiles = async () => {
    setIsLoadingFiles(true)
    try {
      const { data, error } = await apiRequest("GET", ENDPOINT.PROJECT.files(projectId))

      if (error) {
        console.error("Error fetching project files:", error)
        return
      }

      if (data?.files) {
        setFiles(data.files)
      }
    } catch (error) {
      console.error("Error fetching project files:", error)
    } finally {
      setIsLoadingFiles(false)
    }
  }

  // Update the sendMessage function to use our new messaging system
  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      // Create temporary message for optimistic UI update
      const tempMessage = {
        id: `temp-${Date.now()}`,
        project_id: projectId,
        sender_id: user?.id,
        receiver_id: project?.customer_id, // Default to customer, adjust as needed
        message: newMessage,
        created_at: new Date().toISOString(),
        isTemp: true, // Flag to indicate this is a temporary message
        sender: {
          id: user?.id,
          user_name: user?.name || "You",
          profile_image: user?.profile_image,
          role: user?.role,
        },
      }

      // Add to messages for immediate display
      setMessages((prev) => [...prev, tempMessage])

      // Clear input
      setNewMessage("")

      // Send the message
      const result = await sendMessageToServer(projectId, newMessage, user?.id, project?.customer_id)

      if (!result.success) {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })

        // If sending failed, mark the temp message as failed
        setMessages((prev) => prev.map((m) => (m.id === tempMessage.id ? { ...m, sendFailed: true } : m)))
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }

  // Function to delete project
  const handleDeleteProject = async () => {
    setIsDeleting(true)
    try {
      const { error } = await deleteProject(projectId)

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Project deleted successfully",
      })

      // Navigate back to projects page
      router.push("/projects")
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Load data when component mounts
  useEffect(() => {
    if (projectId) {
      getProject()
      getProjectTasks()

      if (userRole === "admin" || userRole === "team") {
        getTeamMembers()
      }

      getProjectMessages()
      getProjectFiles()
    }
  }, [projectId, userRole])

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
    if (!dateString) return "N/A"

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
  const handleTaskClick = (task: TaskType) => {
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
  const handleTaskUpdate = async (updatedTask: TaskType) => {
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

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.role || !newMember.email) return

    try {
      // Replace with your actual endpoint for adding team members
      const { data, error } = await apiRequest("POST", ENDPOINT.AUTH.teamMemberCreate, {
        user_name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        project_id: projectId,
      })

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      // Add the new member to the list
      if (data) {
        setTeamMembers((prev) => [...prev, data])

        toast({
          title: "Success",
          description: "Team member added successfully",
        })
      }

      // Reset form
      setNewMember({ name: "", role: "", email: "" })
      setIsAddingMember(false)

      // Refresh team members
      getTeamMembers()
    } catch (error) {
      console.error("Error adding team member:", error)
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      })
    }
  }

  // Calculate due date from start date and duration
  const calculateDueDate = (startDate: string | undefined, durationDays: number | undefined) => {
    if (!startDate || !durationDays) return null

    const date = new Date(startDate)
    date.setDate(date.getDate() + durationDays)
    return date
  }

  // Add this function before the return statement to group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {}

    messages.forEach((message) => {
      const date = new Date(message.created_at)
      const dateStr = date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      if (!groups[dateStr]) {
        groups[dateStr] = []
      }

      groups[dateStr].push(message)
    })

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }))
  }

  // Add the handleCreateTask function to the component
  // Add this after the other handler functions:

  // Function to create a new task
  const handleCreateTask = async (taskData) => {
    try {
      // Use the task operations hook to create the task
      const result = await handleUpdateTask(null, taskData)

      if (result) {
        toast({
          title: "Success",
          description: "Task created successfully",
        })

        // Refresh the task list
        getProjectTasks()
        return result
      }
      return null
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      })
      return null
    }
  }

  // Add this effect to scroll to the bottom when new messages arrive
  useEffect(() => {
    // Scroll to the bottom of the messages container when messages change
    const messagesContainer = document.getElementById("messages-container")
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }, [messages])

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
        <Button onClick={() => router.push("/projects")}>Back to Projects</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3 md:space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => router.push("/projects")}
          >
            <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </Button>
          <div className="flex items-center">
            <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 capitalize">
              {project.title}
            </h1>
            {/* <p className="text-sm text-muted-foreground mt-1">Project #{project?.id?.slice(0, 8)}</p> */}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary shadow-sm"
            onClick={() => router.push(`/projects/${projectId}/edit`)}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Project Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleDeleteProject} disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete Project"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-4"
      >
        <motion.div variants={fadeInUp} className="col-span-1 lg:col-span-2" transition={{ duration: 0.6 }}>
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 z-0"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12 z-0"></div>

            <CardHeader className="relative z-10 border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-2 px-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    Project Overview
                  </CardTitle>
                  <CardDescription className="text-sm mt-0.5">
                    Track progress and manage tasks for {project.title}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary px-2 py-0.5 text-xs">
                    {project.progress_percentage >= 100
                      ? "Completed"
                      : project.progress_percentage > 0
                        ? "In Progress"
                        : "Planning"}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 p-3 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>Overall Progress</span>
                  <span className="text-primary font-bold">{project.progress_percentage}%</span>
                </div>
                <div className="relative">
                  <div className="overflow-hidden h-2 text-xs flex rounded-lg bg-primary/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress_percentage}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary to-purple-600 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Key Project Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="space-y-0">
                  <p className="text-xs font-medium text-muted-foreground">Client</p>
                  <p className="font-medium text-sm">{project.customer_name}</p>
                </div>
                <div className="space-y-0">
                  <p className="text-xs font-medium text-muted-foreground">Budget</p>
                  <p className="font-medium text-sm">${project.budget || 2500}</p>
                </div>
                <div className="space-y-0">
                  <p className="text-xs font-medium text-muted-foreground">Start Date</p>
                  <p className="font-medium text-sm">{formatDate(project.start_date || "2025-04-06T00:00:00.000Z")}</p>
                </div>
                <div className="space-y-0">
                  <p className="text-xs font-medium text-muted-foreground">Duration</p>
                  <p className="font-medium text-sm">{project.duration_days || 112} days</p>
                </div>
                <div className="space-y-0">
                  <p className="text-xs font-medium text-muted-foreground">Priority</p>
                  <p className="font-medium text-sm capitalize">{project.priority || "Low"}</p>
                </div>
                <div className="space-y-0">
                  <p className="text-xs font-medium text-muted-foreground">Payment Type</p>
                  <p className="font-medium text-sm capitalize">{project.payment_type || "Fixed"}</p>
                </div>
              </div>

              {/* Only show detailed stats to team members and admins */}
              {(userRole === "admin" || userRole === "team") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="group">
                    <Card className="border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-primary/50">
                      <CardContent className="p-2 flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
                          <FolderKanban className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Total Tasks</p>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{project.total_tasks}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="group">
                    <Card className="border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-primary/50">
                      <CardContent className="p-2 flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-sm shadow-green-500/20 group-hover:shadow-green-500/40 transition-all duration-300">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Completed</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            {project.completed_tasks}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="group">
                    <Card className="border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-primary/50">
                      <CardContent className="p-2 flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 shadow-sm shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">In Progress</p>
                          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
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
            <CardHeader className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-3 px-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
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
                      className="py-2 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">{item.label}</p>
                      <p className={`font-medium text-sm ${item.isCapitalize ? "capitalize" : ""}`}>{item.value}</p>
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
          className={`grid ${userRole === "customer" ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"} w-full max-w-md h-9`}
        >
          {(userRole === "admin" || userRole === "team") && (
            <>
              <TabsTrigger value="tasks" className="flex items-center gap-1 text-xs">
                <CheckCircle className="h-3.5 w-3.5" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-1 text-xs">
                <User className="h-3.5 w-3.5" />
                Team
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="messages" className="flex items-center gap-1 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-1 text-xs">
            <FileText className="h-3.5 w-3.5" />
            Files
          </TabsTrigger>
        </TabsList>

        {(userRole === "admin" || userRole === "team") && (
          <TabsContent value="tasks" className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-lg font-semibold">Project Tasks</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Manage and track tasks for this project</p>
              </div>
              <Button
                size="sm"
                className="gap-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                onClick={() => setIsNewTaskFormOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
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
                    <div className="grid grid-cols-12 gap-3 p-3 text-xs font-medium text-muted-foreground border-b">
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
                          <div className="grid grid-cols-12 gap-3 p-3 items-center relative">
                            {/* Priority indicator */}
                            {task.priority === "High" && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                            )}
                            {task.priority === "Medium" && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                            )}

                            {/* Task title and description */}
                            <div className="col-span-6 md:col-span-5 flex items-start gap-2">
                              <div className="mt-1 flex-shrink-0">
                                {task.status === "Completed" ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : task.status === "In Progress" ? (
                                  <Clock className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <Circle className="h-4 w-4 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                                  {task.title}
                                </h3>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</p>
                                {task.due_date && (
                                  <div className="flex items-center text-[10px] text-muted-foreground mt-0.5">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(task.due_date).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1 py-0 border-muted-foreground/30 bg-background"
                                  >
                                    {task.task_group || "Backlog"}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
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
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
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
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <div className="rounded-full bg-primary/10 p-3 mb-3">
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-base font-medium mb-1">No tasks found</h3>
                      <p className="text-muted-foreground text-center text-sm max-w-md mb-4">
                        This project doesn't have any tasks yet. Create your first task to get started.
                      </p>
                      <Button
                        size="sm"
                        className="gap-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                        onClick={() => setIsNewTaskFormOpen(true)}
                      >
                        <Plus className="h-3.5 w-3.5" />
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
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Team Members</h2>
              <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-3.5 w-3.5" />
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
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {teamMembers.length > 0 ? (
                    teamMembers.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card>
                          <CardContent className="p-3 flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.profile_image || undefined} alt={member.user_name} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs">
                                {getInitials(member.user_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{member.user_name}</p>
                              <p className="text-xs text-muted-foreground">{member.role || "Team Member"}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-6">
                      <p className="text-muted-foreground text-sm">No team members assigned to this project yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="messages" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">Project Messages</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Communicate with team members and clients</p>
            </div>
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Plus className="h-3.5 w-3.5" />
              New Message
            </Button>
          </div>

          <Card className="border-none shadow-md overflow-hidden">
            <CardContent className="p-0">
              {/* Replace the messages container in the Messages tab with this updated version */}
              {/* Find the section that starts with: <div className="h-[400px] overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800"> */}
              {/* And replace it with: */}

              <div
                className="h-[400px] overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800"
                id="messages-container"
              >
                <div className="space-y-4">
                  {messages.length > 0 ? (
                    groupMessagesByDate(messages).map((group, groupIndex) => (
                      <div key={group.date} className="space-y-4">
                        {/* Date header */}
                        <div className="flex items-center justify-center my-4">
                          <div className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200">
                            {group.date}
                          </div>
                        </div>

                        {/* Messages for this date */}
                        {group.messages.map((message, index) => {
                          const isCurrentUser = message.sender?.id === user?.id
                          const isTemp = message.isTemp // Update this line

                          return (
                            <motion.div
                              key={message.id || `${groupIndex}-${index}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              className={`flex gap-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                            >
                              {!isCurrentUser && (
                                <Avatar className="h-8 w-8 mt-1 ring-2 ring-background">
                                  <AvatarImage
                                    src={message.sender?.profile_image || undefined}
                                    alt={message.sender?.user_name || "User"}
                                  />
                                  <AvatarFallback
                                    className={`text-xs ${
                                      message.sender?.role === "admin" || message.sender?.role === "team_member"
                                        ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                                        : "bg-gradient-to-br from-primary to-purple-600"
                                    } text-white`}
                                  >
                                    {getInitials(message.sender?.user_name || "User")}
                                  </AvatarFallback>
                                </Avatar>
                              )}

                              <div
                                className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-[75%]`}
                              >
                                {!isCurrentUser && (
                                  <div className="flex items-center gap-2 mb-1">
                                    {/* User name and role display logic */}
                                    {userRole === "team_member" && (
                                      <>
                                        {message.sender?.role === "team_member" && (
                                          <p className="text-xs font-medium">
                                            {message.sender?.user_name || "Team Member"}
                                          </p>
                                        )}
                                        {message.sender?.role && (
                                          <Badge
                                            variant="outline"
                                            className="text-[10px] px-1.5 py-0 border-primary/20 bg-primary/5"
                                          >
                                            {message.sender.role === "admin"
                                              ? "Admin"
                                              : message.sender.role === "customer"
                                                ? "Client"
                                                : null}
                                          </Badge>
                                        )}
                                      </>
                                    )}
                                    {userRole === "admin" && (
                                      <>
                                        <p className="text-xs font-medium">{message.sender?.user_name || "User"}</p>
                                        {message.sender?.role && (
                                          <Badge
                                            variant="outline"
                                            className="text-[10px] px-1.5 py-0 border-primary/20 bg-primary/5"
                                          >
                                            {message.sender.role === "admin"
                                              ? "Admin"
                                              : message.sender.role === "team_member"
                                                ? "Team"
                                                : "Client"}
                                          </Badge>
                                        )}
                                      </>
                                    )}
                                    {userRole === "customer" && <></>}
                                  </div>
                                )}

                                <div
                                  className={`rounded-2xl px-4 py-2 ${
                                    isCurrentUser
                                      ? `bg-primary text-primary-foreground rounded-tr-none ${
                                          isTemp ? "opacity-70" : ""
                                        }`
                                      : "bg-muted rounded-tl-none"
                                  }`}
                                >
                                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                                  <div className="flex items-center justify-end gap-1 mt-1">
                                    <p
                                      className={`text-[10px] ${isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                                    >
                                      {new Date(message.created_at).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                    {isTemp && (
                                      <span className="text-[10px] italic">{isCurrentUser ? "sending..." : ""}</span>
                                    )}
                                    {message.sendFailed && (
                                      <span className="text-[10px] text-red-500 italic">failed to send</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {isCurrentUser && (
                                <Avatar className="h-8 w-8 mt-1 ring-2 ring-background">
                                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs">
                                    {getInitials(user?.name || "You")}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="rounded-full bg-primary/10 p-3 mb-3">
                        <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">No messages yet</h3>
                      <p className="text-muted-foreground text-sm max-w-md mb-4">
                        Start the conversation with your team or client to discuss project details.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Message input area with styling */}
              <div className="border-t bg-card p-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs">
                      {getInitials(user?.name || "You")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="relative">
                      <textarea
                        className="w-full p-3 pr-12 rounded-lg border border-input bg-background min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                        placeholder="Type your message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={3}
                      ></textarea>
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full hover:bg-primary/10"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="gap-1.5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Project Files</h2>
            <Button size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              Upload File
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {files.length > 0 ? (
                  files.map((file, index) => (
                    <motion.div
                      key={file.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-all">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-primary/10">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{file.file_name}</p>
                              <div className="flex items-center text-[10px] text-muted-foreground mt-0.5">
                                <span>{file.file_type}</span>
                                <span className="mx-1.5">•</span>
                                <span>{file.file_size}</span>
                                <span className="mx-1.5">•</span>
                                <span>{formatDate(file.uploaded_at)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-6">
                    <p className="text-muted-foreground text-sm">No files uploaded yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NewTaskForm
        isOpen={isNewTaskFormOpen}
        onClose={() => setIsNewTaskFormOpen(false)}
        onSubmit={handleCreateTask}
        initialProjectId={projectId}
      />

      {/* Add the TaskDetailSheet component at the end of the return statement, just before the closing </div> */}
      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          isOpen={isTaskDetailOpen}
          onClose={() => setIsTaskDetailOpen(false)}
          onStatusChange={handleTaskStatusChange}
          relatedTasks={getRelatedTasks(selectedTask.id, selectedTask.project_id)}
          handleUpdateTask={handleUpdateTask}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </div>
  )
}
