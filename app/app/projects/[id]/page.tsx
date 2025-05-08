"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect, useRef } from "react"
import type { Message, Project, TeamMember } from "@/lib/types"
// First, let's add a proper type definition for the task creation data
// Add this after the existing imports
import type { CreateTaskData } from "@/lib/types"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProjectsStore } from "@/lib/stores/projects-store"
import { useTasksStore } from "@/lib/stores/tasks-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import type { Task as TaskType } from "@/lib/stores/tasks-store"
import { apiRequest } from "@/lib/useApi"
import { ENDPOINT } from "@/lib/api/end-point"
import { useToast } from "@/hooks/use-toast"

import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet"
import { useTaskOperations } from "@/lib/hooks/use-task-operations"
import { NewTaskForm } from "@/components/tasks/new-task-form"
import {
  initializeProjectConnection,
  addMessageListener,
  removeMessageListener,
  closeProjectConnection,
  sendMessage as sendMessageToServer,
} from "@/lib/socket"

import { ProjectDetailHeader } from "@/components/projects/project-detail-header"
import { ProjectOverviewCard } from "@/components/projects/project-overview-card"
import { ProjectDetailsCard } from "@/components/projects/project-details-card"
import { ProjectTasksTab } from "@/components/projects/project-tasks-tab"
import { ProjectTeamTab } from "@/components/projects/project-team-tab"
import { ProjectMessagesTab } from "@/components/projects/project-messages-tab"
import { ProjectFilesTab } from "@/components/projects/project-files-tab"
import { FileText, MessageSquare, User } from "lucide-react"

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
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
  const { handleCreateTask, handleUpdateTask } = useTaskOperations()

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

  // Update the state variables to include allTeamMembers and projectTeamMembers
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMember[]>([])
  const [projectTeamMembers, setProjectTeamMembers] = useState<TeamMember[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState<string>("")
  const [isAddingMember, setIsAddingMember] = useState<boolean>(false)
  const [newMember, setNewMember] = useState<{ name: string; role: string; email: string }>({
    name: "",
    role: "",
    email: "",
  })
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [isAssigningMember, setIsAssigningMember] = useState<boolean>(false)

  // Inside the ProjectDetailPage component, add this socket-related code after the state declarations
  // Add proper type for socket ref
  const socket = useRef<any>(null)

  // Add this effect to initialize SSE connection and message listeners
  useEffect(() => {
    if (projectId && user?.id) {
      console.log(`Initializing SSE connection for project ${projectId} and user ${user.id}`)

      // Initialize SSE connection for this project
      initializeProjectConnection(projectId, user.id)

      // Set up message listener
      const handleNewMessage = (message: Message, isReplacement?: boolean) => {
        console.log("New message received:", message, isReplacement ? "(replacement)" : "")

        // Skip system messages or messages without proper structure
        if (!message || message.type === "connection" || !message.message) {
          return
        }

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

        // Scroll to bottom when new message arrives
        setTimeout(() => {
          const messagesContainer = document.getElementById("messages-container")
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight
          }
        }, 100)
      }

      // Add the message listener
      addMessageListener(projectId, handleNewMessage)

      // Clean up on unmount
      return () => {
        console.log(`Cleaning up SSE connection for project ${projectId}`)
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
  const getProjectTasks = () => {
    setIsLoadingTasks(true)
    try {
      // Use the tasks data that's already included in the project object
      if (project && project.tasks) {
        console.log("Using tasks from project data:", project.tasks)
        setProjectTasks(project.tasks)
      } else {
        setProjectTasks([])
      }
    } catch (error) {
      console.error("Error setting project tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load project tasks",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTasks(false)
    }
  }

  // Add a new function to fetch project team members
  const getProjectTeamMembers = async (): Promise<void> => {
    setIsLoadingTeam(true)
    try {
      const { data, error } = await apiRequest<{ team_members: TeamMember[] }>(
        "GET",
        ENDPOINT.PROJECT.teamMembers(projectId),
      )

      if (error) {
        console.error("Error fetching project team members:", error)
        return
      }

      if (data?.team_members) {
        setProjectTeamMembers(data.team_members)
      }
    } catch (error) {
      console.error("Error fetching project team members:", error)
    } finally {
      setIsLoadingTeam(false)
    }
  }

  // Update the getTeamMembers function to fetch all team members
  const getTeamMembers = async (): Promise<void> => {
    setIsLoadingTeam(true)
    try {
      const { data, error } = await apiRequest<{ team_members: TeamMember[] }>("GET", ENDPOINT.AUTH.allTeamMember)

      if (error) {
        console.error("Error fetching team members:", error)
        return
      }

      if (data?.team_members) {
        setAllTeamMembers(data.team_members)
      }
    } catch (error) {
      console.error("Error fetching team members:", error)
    } finally {
      setIsLoadingTeam(false)
    }
  }

  // Add a new function to assign a team member to the project
  const assignTeamMember = async (userId: string): Promise<boolean> => {
    setIsAssigningMember(true)
    try {
      const { data, error } = await apiRequest<any>("POST", ENDPOINT.PROJECT.assignTeamMember(projectId), {
        user_id: userId,
      })

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Success",
        description: "Team member assigned to project successfully",
      })

      // Refresh project team members
      await getProjectTeamMembers()
      return true
    } catch (error) {
      console.error("Error assigning team member:", error)
      toast({
        title: "Error",
        description: "Failed to assign team member to project",
        variant: "destructive",
      })
      return false
    } finally {
      setIsAssigningMember(false)
    }
  }

  // Add a new function to remove a team member from the project
  const removeTeamMember = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await apiRequest<any>(
        "DELETE",
        `${ENDPOINT.PROJECT.assignTeamMember(projectId)}?user_id=${userId}`,
      )

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Success",
        description: "Team member removed from project successfully",
      })

      // Refresh project team members
      await getProjectTeamMembers()
      return true
    } catch (error) {
      console.error("Error removing team member:", error)
      toast({
        title: "Error",
        description: "Failed to remove team member from project",
        variant: "destructive",
      })
      return false
    }
  }

  // Function to fetch project messages
  const getProjectMessages = async (): Promise<void> => {
    setIsLoadingMessages(true)
    try {
      const { data, error } = await apiRequest<{ messages: Message[] }>("GET", ENDPOINT.PROJECT.messages(projectId))

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
  const getProjectFiles = async (): Promise<void> => {
    setIsLoadingFiles(true)
    try {
      const { data, error } = await apiRequest<{ files: any[] }>("GET", ENDPOINT.PROJECT.files(projectId))

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
  const sendMessage = async (): Promise<void> => {
    if (!newMessage.trim()) return

    try {
      // Create temporary message for optimistic UI update
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        project_id: projectId,
        sender_id: user?.id || "",
        receiver_id: project?.customer_id || "", // Default to customer, adjust as needed
        message: newMessage,
        created_at: new Date().toISOString(),
        isTemp: true, // Flag to indicate this is a temporary message
        sender: {
          id: user?.id || "",
          user_name: user?.name || "You",
          profile_image: user?.profile_image,
          role: user?.role,
        },
      }

      // Store the message text before clearing the input
      const messageText = newMessage

      // Add to messages for immediate display
      setMessages((prev) => [...prev, tempMessage])

      // Clear input immediately for better UX
      setNewMessage("")

      // Send the message
      const result = await sendMessageToServer(projectId, messageText, user?.id || "", project?.customer_id || "")

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
  const handleDeleteProject = async (): Promise<void> => {
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
      router.push("/app/projects")
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

  // Update the useEffect to fetch project team members
  useEffect(() => {
    if (projectId) {
      getProject()

      if (userRole === "admin" || userRole === "team") {
        getTeamMembers()
        getProjectTeamMembers()
      }

      getProjectMessages()
      getProjectFiles()
    }
  }, [projectId, userRole])

  // Add a new useEffect to update tasks when project changes
  useEffect(() => {
    if (project) {
      getProjectTasks()
    }
  }, [project])

  // Replace the existing handleTaskClick function with this one
  const handleTaskClick = (task: TaskType) => {
    setSelectedTask(task)
    setIsTaskDetailOpen(true)
  }

  // Add this function to handle task status changes
  const handleTaskStatusChange = async (taskId: string, newStatus: string): Promise<void> => {
    try {
      // Optimistically update the UI first
      const taskToUpdate = projectTasks.find((t) => t.id === taskId)
      if (taskToUpdate) {
        // Update the selected task if it's open in the detail view
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
      }

      // Then make the API call
      await handleUpdateTask(taskId, { status: newStatus })

      // After updating the task, refresh the project data to get updated stats
      await getProject()

      // No need to call getProjectTasks() again since it will be triggered by the useEffect when project changes

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
        const originalTask = projectTasks.find((t) => t.id === taskId)
        if (originalTask) {
          setSelectedTask(originalTask)
        }
      }
    }
  }

  // Also update the handleTaskUpdate function to properly handle errors
  // Add a function to handle task updates from the detail sheet
  const handleTaskUpdate = async (updatedTask: TaskType): Promise<void> => {
    try {
      // Update the task in the projectTasks array
      setProjectTasks((prevTasks) => prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))

      // Update the selected task if it's currently open
      if (selectedTask && selectedTask.id === updatedTask.id) {
        setSelectedTask(updatedTask)
      }

      // Refresh the project data to get updated stats
      await getProject()

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

  // Add this function to get related tasks
  const getRelatedTasks = (taskId: string, projectId: string): TaskType[] => {
    return projectTasks.filter((t) => t.project_id === projectId && t.id !== taskId)
  }

  // Then update the onCreateNewTask function to use the proper type and ensure required fields are present
  // Replace the existing onCreateNewTask function with this one:
  // Function to create a new task
  const onCreateNewTask = async (taskData: Partial<TaskType>): Promise<TaskType | null> => {
    try {
      // Ensure required fields are present to satisfy the type requirements
      if (
        !taskData.title ||
        !taskData.description ||
        !taskData.status ||
        !taskData.task_group ||
        !taskData.project_id
      ) {
        toast({
          title: "Error",
          description: "Missing required task fields",
          variant: "destructive",
        })
        return null
      }

      // Create a properly typed task object
      const newTaskData: CreateTaskData = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        task_group: taskData.task_group,
        project_id: taskData.project_id,
        // Optional fields
        assigned_to: taskData.assigned_to || null,
        due_date: taskData.due_date || null,
        priority: taskData.priority || "Medium",
      }

      // Use the handleCreateTask function from useTaskOperations
      const result = await handleCreateTask(newTaskData)

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3 md:space-y-4">
      <ProjectDetailHeader
        projectId={projectId}
        projectTitle={project.title}
        handleDeleteProject={handleDeleteProject}
        isDeleting={isDeleting}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-4"
      >
        <div className="col-span-1 lg:col-span-2">
          <ProjectOverviewCard project={project} userRole={userRole} />
        </div>
        <div className="relative">
          <ProjectDetailsCard project={project} />
        </div>
      </motion.div>

      <Tabs defaultValue={userRole === "customer" ? "messages" : "tasks"} className="w-full">
        <TabsList
          className={`grid ${userRole === "customer" ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"} w-full max-w-md h-9`}
        >
          {(userRole === "admin" || userRole === "team") && (
            <>
              <TabsTrigger value="tasks" className="flex items-center gap-1 text-xs">
                <User className="h-3.5 w-3.5" />
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
            <ProjectTasksTab
              projectTasks={projectTasks}
              isLoadingTasks={isLoadingTasks}
              handleTaskClick={handleTaskClick}
              setIsNewTaskFormOpen={setIsNewTaskFormOpen}
            />
          </TabsContent>
        )}

        {(userRole === "admin" || userRole === "team") && (
          <TabsContent value="team" className="mt-6">
            <ProjectTeamTab
              projectTeamMembers={projectTeamMembers}
              allTeamMembers={allTeamMembers}
              isAssigningMember={isAssigningMember}
              assignTeamMember={assignTeamMember}
              removeTeamMember={removeTeamMember}
            />
          </TabsContent>
        )}

        <TabsContent value="messages" className="mt-6">
          <ProjectMessagesTab
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            user={user}
          />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <ProjectFilesTab files={files} />
        </TabsContent>
      </Tabs>

      <NewTaskForm
        isOpen={isNewTaskFormOpen}
        onClose={() => setIsNewTaskFormOpen(false)}
        onSubmit={onCreateNewTask}
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
