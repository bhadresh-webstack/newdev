"use client"

import type React from "react"

import { useState, useEffect, useCallback, memo } from "react"
import { CalendarIcon, CheckCircle, Circle, Clock } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/useApi" // Updated import path
import { ENDPOINT } from "@/lib/api/end-point" // Updated import path

// Task status options with icons
const statusOptions = [
  { value: "Pending", label: "Pending", icon: <Circle className="h-4 w-4 text-slate-500" /> },
  { value: "In Progress", label: "In Progress", icon: <Clock className="h-4 w-4 text-blue-500" /> },
  { value: "Completed", label: "Completed", icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
  { value: "Blocked", label: "Blocked", icon: <Circle className="h-4 w-4 text-red-500" /> },
]

// Priority options
const priorityOptions = [
  {
    value: "Low",
    label: "Low",
    color:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  {
    value: "Medium",
    label: "Medium",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  {
    value: "High",
    label: "High",
    color: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
]

// Default task group options (fallback)
const defaultGroupOptions = [
  { value: "Backlog", label: "Backlog" },
  { value: "To Do", label: "To Do" },
  { value: "In Progress", label: "In Progress" },
  { value: "Review", label: "Review" },
  { value: "Done", label: "Done" },
]

interface Project {
  id: string
  title: string
}

interface TeamMember {
  id: string
  user_name: string
  email?: string
  profile_image: string | null
}

interface NewTaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskData: any) => Promise<any>
  initialProjectId?: string
  initialTaskGroup?: string
}

export const NewTaskForm = memo(function NewTaskForm({
  isOpen,
  onClose,
  onSubmit,
  initialProjectId = "",
  initialTaskGroup = "To Do",
}: NewTaskFormProps) {
  // Data states
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [taskGroups, setTaskGroups] = useState<string[]>([])

  // Loading states
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false)
  const [isLoadingTaskGroups, setIsLoadingTaskGroups] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Pending",
    priority: "Medium",
    task_group: initialTaskGroup,
    project_id: initialProjectId,
    assigned_to: "",
    due_date: null as Date | null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when it opens with initial values
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        status: "Pending",
        priority: "Medium",
        task_group: initialTaskGroup,
        project_id: initialProjectId,
        assigned_to: "",
        due_date: null,
      })
      setErrors({})

      // Fetch data when the form opens
      fetchProjects()
      fetchTeamMembers()

      // If we have an initial project ID, fetch task groups for that project
      if (initialProjectId) {
        fetchTaskGroups(initialProjectId)
      } else {
        fetchTaskGroups()
      }
    }
  }, [isOpen, initialProjectId, initialTaskGroup])

  // Fetch projects from API
  const fetchProjects = useCallback(async () => {
    if (projects.length > 0) return // Don't fetch if we already have projects

    setIsLoadingProjects(true)
    try {
      const { data, error } = await apiRequest<{ projects: Project[] }>("GET", ENDPOINT.PROJECT.base)

      if (error) {
        console.error("Error fetching projects:", error)
        toast({
          title: "Error",
          description: "Failed to load projects. Using default options.",
          variant: "destructive",
        })
      } else if (data && data.projects && data.projects.length > 0) {
        setProjects(data.projects)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setIsLoadingProjects(false)
    }
  }, [projects.length, toast])

  // Fetch team members from API
  const fetchTeamMembers = useCallback(async () => {
    if (teamMembers.length > 0) return // Don't fetch if we already have team members

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
  }, [teamMembers.length])

  // Fetch task groups from API
  const fetchTaskGroups = useCallback(async (projectId?: string) => {
    setIsLoadingTaskGroups(true)
    try {
      let url = ENDPOINT.TASK.groups
      if (projectId) {
        url = `${url}?projectId=${projectId}`
      }

      const { data, error } = await apiRequest<string[]>("GET", url)

      if (error) {
        console.error("Error fetching task groups:", error)
      } else if (data && data.length > 0) {
        setTaskGroups(data)
      }
    } catch (error) {
      console.error("Error fetching task groups:", error)
    } finally {
      setIsLoadingTaskGroups(false)
    }
  }, [])

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const handleChange = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      // If project changes, fetch task groups for that project
      if (field === "project_id" && value) {
        fetchTaskGroups(value)
      }

      // Clear error for this field if it exists
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [errors, fetchTaskGroups],
  )

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.project_id) {
      newErrors.project_id = "Project is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData.title, formData.project_id])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      setIsSubmitting(true)

      try {
        // Use the onSubmit callback with the form data
        const result = await onSubmit(formData)

        if (result) {
          // Reset form
          setFormData({
            title: "",
            description: "",
            status: "Pending",
            priority: "Medium",
            task_group: initialTaskGroup,
            project_id: initialProjectId,
            assigned_to: "",
            due_date: null,
          })

          onClose()
        }
      } catch (error: any) {
        console.error("Error creating task:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to create task. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, initialProjectId, initialTaskGroup, onClose, onSubmit, validateForm],
  )

  // Get group options - use API data if available, otherwise use defaults
  const groupOptions =
    taskGroups.length > 0 ? taskGroups.map((group) => ({ value: group, label: group })) : defaultGroupOptions

  // Determine if we should disable the project selection
  // If initialProjectId is provided, it means we're opening from a project page
  const disableProjectSelection = !!initialProjectId

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="flex flex-col max-h-[85vh]">
          <DialogHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 p-6 border-b">
            <div className="flex items-center">
              <DialogTitle className="text-xl font-semibold tracking-tight">Create New Task</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground mt-1.5">
              Add a new task to your project
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto p-6">
            <form id="new-task-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className={cn(errors.title ? "text-destructive" : "")}>
                    Task Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Enter task title"
                    className={cn(errors.title ? "border-destructive" : "")}
                  />
                  {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Enter task description"
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project" className={cn(errors.project_id ? "text-destructive" : "")}>
                      Project <span className="text-destructive">*</span>
                    </Label>
                    {disableProjectSelection ? (
                      // If we have an initialProjectId, show the selected project as non-editable
                      <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted">
                        {projects.find((p) => p.id === initialProjectId)?.title || "Current Project"}
                      </div>
                    ) : (
                      // Otherwise, show the dropdown
                      <Select value={formData.project_id} onValueChange={(value) => handleChange("project_id", value)}>
                        <SelectTrigger
                          id="project"
                          className={cn(errors.project_id ? "border-destructive" : "")}
                          disabled={isLoadingProjects}
                        >
                          <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select project"} />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.length > 0 ? (
                            projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.title}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="project-1">E-commerce Website</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                    {errors.project_id && <p className="text-xs text-destructive mt-1">{errors.project_id}</p>}
                  </div>

                  <div>
                    <Label htmlFor="assigned_to">Assign To</Label>
                    <Select value={formData.assigned_to} onValueChange={(value) => handleChange("assigned_to", value)}>
                      <SelectTrigger id="assigned_to" disabled={isLoadingTeamMembers}>
                        <SelectValue
                          placeholder={isLoadingTeamMembers ? "Loading team members..." : "Select team member"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.length > 0 ? (
                          teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={member.profile_image || undefined} alt={member.user_name} />
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                    {getInitials(member.user_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{member.user_name}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-members">No team members available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                      <SelectTrigger id="status">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            {statusOptions.find((option) => option.value === formData.status)?.icon}
                            <span>{formData.status}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              {option.icon}
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                      <SelectTrigger id="priority">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`${priorityOptions.find((option) => option.value === formData.priority)?.color} text-xs border`}
                            >
                              {formData.priority}
                            </Badge>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Badge className={`${option.color} text-xs border`}>{option.label}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="task_group">Group</Label>
                    <Select value={formData.task_group} onValueChange={(value) => handleChange("task_group", value)}>
                      <SelectTrigger id="task_group" disabled={isLoadingTaskGroups}>
                        <SelectValue placeholder={isLoadingTaskGroups ? "Loading groups..." : "Select group"} />
                      </SelectTrigger>
                      <SelectContent>
                        {groupOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.due_date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.due_date ? format(formData.due_date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.due_date || undefined}
                        onSelect={(date) => handleChange("due_date", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </form>
          </div>

          <DialogFooter className="p-6 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="new-task-form" disabled={isSubmitting} className="gap-1.5">
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
})
