"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, Clock } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useTaskOperations } from "@/lib/hooks/use-task-operations"
import type { Task } from "@/lib/stores/tasks-store"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/useApi"
import { useAuthStore } from "@/lib/stores/auth-store"

import { TaskHeader } from "./task-detail/task-header"
import { TaskTabs } from "./task-detail/task-tabs"
import { TaskDetailsTab } from "./task-detail/task-details-tab"
import { TaskCommentsTab } from "./task-detail/task-comments-tab"
import { TaskActivityTab } from "./task-detail/task-activity-tab"
import { TaskRelatedTab } from "./task-detail/task-related-tab"
import { TaskSidebar } from "./task-detail/task-sidebar"
import { ENDPOINT } from "@/lib/api/end-point"

// Task status icons and colors
const statusIcons = {
  Pending: <Circle className="h-5 w-5 text-slate-500" />,
  "In Progress": <Clock className="h-5 w-5 text-blue-500" />,
  QA: <Circle className="h-5 w-5 text-purple-500" />,
  Open: <Circle className="h-5 w-5 text-slate-500" />,
  Completed: <CheckCircle className="h-5 w-5 text-green-500" />,
  Blocked: <Circle className="h-5 w-5 text-red-500" />,
}

const statusColors = {
  Pending: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  QA: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  Open: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  Blocked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
}

interface TaskDetailSheetProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>
  onTaskUpdate?: (updatedTask: Task) => void
  relatedTasks: Task[]
  handleUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<any>
}

export interface TeamMember {
  id: string
  user_name: string
  email?: string
  profile_image: string | null
}

export function TaskDetailSheet({
  task,
  isOpen,
  onClose,
  onStatusChange,
  relatedTasks = [],
  handleUpdateTask,
  onTaskUpdate,
}: TaskDetailSheetProps) {
  const [localTask, setLocalTask] = useState<Task | null>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [comments, setComments] = useState([
    {
      id: "comment-1",
      author: "Alex Johnson",
      content: "I've started working on this task. Should be completed by tomorrow.",
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      author_avatar: null,
    },
    {
      id: "comment-2",
      author: "Sarah Miller",
      content: "Let me know if you need any design assets for this.",
      created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      author_avatar: null,
    },
  ])
  const { handleDeleteTask } = useTaskOperations()
  const { toast } = useToast()

  // Add a new state variable for edit mode after the other state declarations
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedTask, setEditedTask] = useState<Task | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[] | undefined>()
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false)

  // Get the current user's role from auth store
  const { user } = useAuthStore()
  const isAdmin = user?.role === "admin"

  // Add effect to fix pointer-events issue when sheet is closed
  useEffect(() => {
    // When sheet is opened
    if (isOpen) {
      // No need to do anything here, the Sheet component handles this
    } else {
      // When sheet is closed, ensure pointer-events are restored
      document.body.style.pointerEvents = ""

      // Also ensure any other modal-related styles are cleaned up
      document.body.classList.remove("overflow-hidden")
    }

    // Cleanup function that runs when component unmounts or isOpen changes
    return () => {
      // Ensure pointer-events are restored when component unmounts
      document.body.style.pointerEvents = ""
      document.body.classList.remove("overflow-hidden")
    }
  }, [isOpen])

  const fetchTeamMembers = async () => {
    if (teamMembers) return // Don't fetch if we already have team members

    setIsLoadingTeamMembers(true)
    try {
      const { data, error } = await apiRequest<{ team_members: TeamMember[] }>("GET", ENDPOINT.AUTH.allTeamMember)

      if (error) {
        console.error("Error fetching team members:", error)
        toast({
          title: "Error",
          description: "Failed to load team members. Using default options.",
          variant: "destructive",
        })
      } else if (data && data.team_members && data.team_members.length > 0) {
        setTeamMembers(data.team_members)
      }
    } catch (error) {
      console.error("Error fetching team members:", error)
    } finally {
      setIsLoadingTeamMembers(false)
    }
  }

  // Update local task state when the task prop changes
  useEffect(() => {
    if (task) {
      setLocalTask(task)
    }
  }, [task])

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
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

    return formatDate(dateString)
  }

  // Handle status change with optimistic UI update
  const handleStatusChange = async (newStatus: string) => {
    if (localTask) {
      try {
        // Update local state immediately for optimistic UI update
        setLocalTask({
          ...localTask,
          status: newStatus,
        })

        // Call the parent handler to update the backend
        await onStatusChange(localTask.id, newStatus)

        // Show success toast
        toast({
          title: "Status Updated",
          description: `Task status changed to ${newStatus}`,
        })
      } catch (error) {
        console.error("Error updating task status:", error)

        // Revert to original status if there's an error
        if (localTask) {
          setLocalTask({
            ...localTask,
            status: localTask.status,
          })
        }

        // Show error toast
        toast({
          title: "Error",
          description: "Failed to update task status",
          variant: "destructive",
        })
      }
    }
  }

  // Handle delete task
  const handleDelete = async () => {
    if (localTask) {
      const success = await handleDeleteTask(localTask.id)
      if (success) {
        // Ensure pointer-events are restored before closing
        document.body.style.pointerEvents = ""
        onClose()
      }
    }
  }

  // Add this function to handle entering edit mode
  const handleEditClick = () => {
    if (localTask) {
      setEditedTask({ ...localTask })
    }
    setIsEditMode(true)
    fetchTeamMembers()
  }

  // Add this function to handle saving edits
  const handleSaveEdit = async () => {
    if (!editedTask) return

    try {
      console.log("Saving task edits:", editedTask)

      // Update the local state immediately for optimistic UI update
      setLocalTask(editedTask)

      // Prepare the update data
      const updateData = {
        title: editedTask.title,
        description: editedTask.description,
        priority: editedTask.priority,
        due_date: editedTask.due_date,
        task_group: editedTask.task_group,
        assigned_to: editedTask.assigned_to,
      }

      // Call the API to update the task
      const result = await handleUpdateTask(editedTask.id, updateData)

      if (!result) {
        throw new Error("Failed to update task")
      }

      // Exit edit mode
      setIsEditMode(false)

      // Call onTaskUpdate if provided
      if (onTaskUpdate) {
        onTaskUpdate(result as Task)
      }

      // Show success message
      toast({
        title: "Success",
        description: "Task updated successfully",
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })

      // Don't exit edit mode on error so user can try again
      // But revert optimistic update
      if (localTask) {
        setEditedTask(localTask)
      }
    }
  }

  // Add this function to handle canceling edits
  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditedTask(null)
  }

  // Custom close handler to ensure pointer-events are restored
  const handleSheetClose = () => {
    // Ensure pointer-events are restored
    document.body.style.pointerEvents = ""
    // Call the original onClose
    onClose()
  }

  if (!localTask) return null

  // Priority badge styling
  const getPriorityBadge = (priority: string | undefined) => {
    if (!priority) return null

    const priorityStyles = {
      Low: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      Medium: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      High: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          priorityStyles[priority as keyof typeof priorityStyles] ||
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
        }`}
      >
        {priority}
      </span>
    )
  }


  // Render the task detail sheet
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleSheetClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto p-0">
        <div className="flex flex-col h-full">
          {/* Header with gradient background */}
          <TaskHeader
            task={localTask}
            statusIcons={statusIcons}
            statusColors={statusColors}
            handleStatusChange={handleStatusChange}
            handleEditClick={handleEditClick}
            handleDelete={handleDelete}
            getPriorityBadge={getPriorityBadge}
            isAdmin={isAdmin}
          />

          {/* Main content area */}
          <div className="flex-grow overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Two column layout for larger screens */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {/* Custom tabs with animated underline */}
                  <TaskTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    commentsCount={comments.length}
                    relatedTasksCount={relatedTasks.length}
                  />

                  {/* Details tab content */}
                  {activeTab === "details" && (
                    <div className="space-y-4">
                      <TaskDetailsTab
                        isEditMode={isEditMode}
                        localTask={localTask}
                        editedTask={editedTask}
                        setEditedTask={setEditedTask}
                        handleCancelEdit={handleCancelEdit}
                        handleSaveEdit={handleSaveEdit}
                        teamMembers={teamMembers}
                        isLoadingTeamMembers={isLoadingTeamMembers}
                        getInitials={getInitials}
                      />
                    </div>
                  )}

                  {/* Comments tab content */}
                  {activeTab === "comments" && (
                    <TaskCommentsTab
                      comments={comments}
                      setComments={setComments as any}
                      getInitials={getInitials}
                      formatRelativeTime={formatRelativeTime}
                    />
                  )}

                  {/* Activity tab content */}
                  {activeTab === "activity" && <TaskActivityTab task={localTask} formatDate={formatDate} />}

                  {/* Related tasks tab content */}
                  {activeTab === "related" && (
                    <TaskRelatedTab
                      relatedTasks={relatedTasks}
                      statusIcons={statusIcons}
                      setLocalTask={setLocalTask}
                      setActiveTab={setActiveTab}
                      getInitials={getInitials}
                    />
                  )}
                </div>

                {/* Task details sidebar */}
                <TaskSidebar
                  task={localTask}
                  statusColors={statusColors}
                  getPriorityBadge={getPriorityBadge}
                  getInitials={getInitials}
                  formatDate={formatDate}
                  relatedTasks={relatedTasks}
                  statusIcons={statusIcons}
                  setLocalTask={setLocalTask}
                  setActiveTab={setActiveTab}
                />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
