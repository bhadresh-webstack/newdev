"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Clock, Search, ListIcon, LayoutGrid, Plus, GripVertical, ChevronDown, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { demoTasks } from "@/lib/data-utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Add the import for the TaskDetailSheet component at the top of the file
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet"
// Add the import for the NewTaskForm component
import { NewTaskForm } from "@/components/tasks/new-task-form"

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

// Task status dots
const statusDots = {
  Pending: <div className="h-2.5 w-2.5 rounded-full bg-slate-500 mr-2"></div>,
  "In Progress": <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-2"></div>,
  Completed: <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>,
  Blocked: <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></div>,
}

// Task status colors
const statusColors = {
  Pending:
    "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600",
  "In Progress":
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800",
  Completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800",
  Blocked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800",
}

// Task group colors
const groupColors = {
  Backlog: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100",
  "To Do": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  "In Progress": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  Review: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  Done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
}

// Task group header colors
const groupHeaderColors = {
  Backlog: "border-slate-300 dark:border-slate-600",
  "To Do": "border-blue-300 dark:border-blue-700",
  "In Progress": "border-amber-300 dark:border-amber-700",
  Review: "border-purple-300 dark:border-purple-700",
  Done: "border-green-300 dark:border-green-700",
}

export default function TasksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState(demoTasks)
  const [view, setView] = useState(searchParams.get("view") || "list")
  const [projectFilter, setProjectFilter] = useState(searchParams.get("project") || "all")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
  const [groupFilter, setGroupFilter] = useState(searchParams.get("group") || "all")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [draggedTask, setDraggedTask] = useState(null)

  // Add these state variables inside the TasksPage component, after the other state declarations
  const [selectedTask, setSelectedTask] = useState(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  // Add state for the new task form
  const [isNewTaskFormOpen, setIsNewTaskFormOpen] = useState(false)
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false)
  const [isFilterBarVisible, setIsFilterBarVisible] = useState(false)

  useEffect(() => {
    // Set initial state from URL parameters
    setView(searchParams.get("view") || "list")
    setProjectFilter(searchParams.get("project") || "all")
    setStatusFilter(searchParams.get("status") || "all")
    setGroupFilter(searchParams.get("group") || "all")
    setSearchQuery(searchParams.get("q") || "")

    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchParams])

  // Add a new useEffect to filter tasks when filters change
  useEffect(() => {
    // Filter tasks based on current filters
    const filtered = demoTasks.filter((task) => {
      // Search filter
      if (
        searchQuery &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Status filter
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false
      }

      // Group filter
      if (groupFilter !== "all" && task.task_group !== groupFilter) {
        return false
      }

      // Project filter
      if (projectFilter !== "all" && task.project.id !== projectFilter) {
        return false
      }

      return true
    })

    setTasks(filtered)
  }, [searchQuery, statusFilter, groupFilter, projectFilter])

  // Update URL with filters
  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    // Update the local state immediately
    if (key === "view") {
      setView(value)
    } else if (key === "project") {
      setProjectFilter(value)
    } else if (key === "status") {
      setStatusFilter(value)
    } else if (key === "group") {
      setGroupFilter(value)
    } else if (key === "q") {
      setSearchQuery(value)
    }

    // Update the URL
    router.push(`/app/tasks?${params.toString()}`, { scroll: false })
  }

  // Filter tasks based on filters
  const filteredTasks = tasks.filter((task) => {
    // Search filter
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Status filter
    if (statusFilter !== "all" && task.status !== statusFilter) {
      return false
    }

    // Group filter
    if (groupFilter !== "all" && task.task_group !== groupFilter) {
      return false
    }

    // Project filter
    if (projectFilter !== "all" && task.project.id !== projectFilter) {
      return false
    }

    return true
  })

  // Group tasks by task_group for board view
  const groupedTasks = filteredTasks.reduce(
    (acc, task) => {
      const group = task.task_group || "Backlog"
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(task)
      return acc
    },
    {} as Record<string, typeof demoTasks>,
  )

  // All possible task groups
  const taskGroups = ["Backlog", "To Do", "In Progress", "Review", "Done"]

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const handleDragStart = (e, task, group) => {
    e.dataTransfer.setData("taskId", task.id)
    e.dataTransfer.setData("sourceGroup", group)
    setDraggedTask(task.id)

    // Add a delay to set opacity - this helps with the drag image
    setTimeout(() => {
      e.target.style.opacity = "0.4"
    }, 0)
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1"
    setDraggedTask(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add("bg-accent/50")
  }

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("bg-accent/50")
  }

  const handleDrop = (e, targetGroup) => {
    e.preventDefault()
    e.currentTarget.classList.remove("bg-accent/50")

    const taskId = e.dataTransfer.getData("taskId")
    const sourceGroup = e.dataTransfer.getData("sourceGroup")

    if (sourceGroup === targetGroup) return

    // Find the task and update its group
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, task_group: targetGroup }
      }
      return task
    })

    setTasks(updatedTasks)
  }

  // Add this function inside the TasksPage component, before the return statement
  const handleTaskClick = (task) => {
    setSelectedTask(task)
    setIsTaskDetailOpen(true)
  }

  // Add this function inside the TasksPage component, before the return statement
  const handleTaskStatusChange = (taskId, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, status: newStatus }
        }
        return task
      }),
    )
  }

  // Add this function inside the TasksPage component, before the return statement
  const getRelatedTasks = (taskId, projectId) => {
    return tasks.filter((t) => t.project.id === projectId && t.id !== taskId)
  }

  // Add this function to handle creating a new task
  const handleCreateTask = (taskData: any) => {
    // Add the new task to the tasks list
    setTasks((prevTasks) => [taskData, ...prevTasks])
    // Close the dialog
    setIsNewTaskDialogOpen(false)
  }

  // Function to get subtle priority indicator
  const getPriorityIndicator = (priority) => {
    if (priority === "High") {
      return (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-amber-500 border-l-[16px] border-l-transparent"></div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-muted rounded-md w-2/3"></div>
        <div className="h-4 bg-muted rounded-md w-1/2"></div>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="h-10 bg-muted rounded-md w-64"></div>
          <div className="h-10 bg-muted rounded-md w-32"></div>
          <div className="h-10 bg-muted rounded-md w-32"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold tracking-tight"
          >
            Tasks
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground"
          >
            Manage and track tasks across all your projects
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button className="gap-1.5" onClick={() => setIsNewTaskDialogOpen(true)}>
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </motion.div>
      </div>

      <div className="bg-card/60 backdrop-blur-sm rounded-lg border border-border/40 shadow-sm p-4 mb-6">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="search"
                placeholder="Search tasks..."
                className="pl-9 pr-4 py-2 h-9 bg-background/80 border-border/50 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => updateFilters("q", e.target.value || "all")}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-full"
              onClick={() => setIsFilterBarVisible(!isFilterBarVisible)}
              aria-label={isFilterBarVisible ? "Hide filters" : "Show filters"}
              title={isFilterBarVisible ? "Hide filters" : "Show filters"}
            >
              <Filter className={`h-4 w-4 ${isFilterBarVisible ? "text-primary" : ""}`} />
            </Button>
          </div>

          <div className="flex items-center">
            <Tabs value={view} onValueChange={(value) => updateFilters("view", value)} className="hidden md:block">
              <TabsList className="h-9 bg-background/80 border border-border/50 p-0.5">
                <TabsTrigger
                  value="list"
                  className="flex items-center gap-1.5 px-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <ListIcon className="h-4 w-4" />
                  <span>List</span>
                </TabsTrigger>
                <TabsTrigger
                  value="board"
                  className="flex items-center gap-1.5 px-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span>Board</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={view} onValueChange={(value) => updateFilters("view", value)} className="md:hidden">
              <TabsList className="grid w-[100px] grid-cols-2 h-9 bg-background/80 border border-border/50 p-0.5">
                <TabsTrigger
                  value="list"
                  className="flex items-center justify-center data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <ListIcon className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="board"
                  className="flex items-center justify-center data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <LayoutGrid className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {isFilterBarVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 flex flex-wrap gap-2 items-center"
          >
            <div className="flex items-center bg-background/80 rounded-md border border-border/50 divide-x divide-border/50 w-full md:w-auto">
              <Select value={projectFilter} onValueChange={(value) => updateFilters("project", value)}>
                <SelectTrigger className="min-w-[140px] h-9 border-0 rounded-none rounded-l-md bg-transparent focus:ring-0 focus:ring-offset-0 text-sm font-medium">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent className="min-w-[180px]">
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="project-1">E-commerce Website</SelectItem>
                  <SelectItem value="project-2">Mobile App</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value) => updateFilters("status", value)}>
                <SelectTrigger className="min-w-[120px] h-9 border-0 rounded-none bg-transparent focus:ring-0 focus:ring-offset-0 text-sm font-medium">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="min-w-[160px]">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>

              <Select value={groupFilter} onValueChange={(value) => updateFilters("group", value)}>
                <SelectTrigger className="min-w-[120px] h-9 border-0 rounded-none rounded-r-md bg-transparent focus:ring-0 focus:ring-offset-0 text-sm font-medium">
                  <SelectValue placeholder="Group" />
                </SelectTrigger>
                <SelectContent className="min-w-[160px]">
                  <SelectItem value="all">All Groups</SelectItem>
                  {taskGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </div>

      {view === "list" ? (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <motion.div key={task.id} variants={fadeInUp}>
                <div
                  className={`group relative bg-background rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-border ${
                    task.priority === "High" ? "shadow-[inset_0_0_0_1px_rgba(234,88,12,0.2)]" : ""
                  }`}
                  onClick={(e) => {
                    // Prevent opening task details when clicking on dropdown
                    if (e.target.closest("[data-prevent-click]")) {
                      e.stopPropagation()
                      return
                    }
                    handleTaskClick(task)
                  }}
                >
                  {task.priority === "High" && (
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-amber-500 border-l-[16px] border-l-transparent z-10"></div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        className={`${groupColors[task.task_group] || "bg-slate-100 text-slate-800"} px-2 py-0.5 text-[10px] font-medium`}
                      >
                        {task.task_group}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild data-prevent-click>
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium cursor-pointer border ${
                              task.status === "Completed"
                                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                                : task.status === "In Progress"
                                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                  : task.status === "Blocked"
                                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                                    : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                            }`}
                          >
                            <div className="flex items-center">
                              {statusDots[task.status] || (
                                <div className="h-2.5 w-2.5 rounded-full bg-slate-500 mr-2"></div>
                              )}
                              <span>{task.status}</span>
                            </div>
                            <ChevronDown className="h-3 w-3 opacity-70" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" data-prevent-click>
                          <DropdownMenuItem
                            className={task.status === "Pending" ? "bg-accent" : ""}
                            onClick={() => handleTaskStatusChange(task.id, "Pending")}
                          >
                            <div className="h-2.5 w-2.5 rounded-full bg-slate-500 mr-2"></div>
                            Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={task.status === "In Progress" ? "bg-accent" : ""}
                            onClick={() => handleTaskStatusChange(task.id, "In Progress")}
                          >
                            <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-2"></div>
                            In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={task.status === "Completed" ? "bg-accent" : ""}
                            onClick={() => handleTaskStatusChange(task.id, "Completed")}
                          >
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                            Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={task.status === "Blocked" ? "bg-accent" : ""}
                            onClick={() => handleTaskStatusChange(task.id, "Blocked")}
                          >
                            <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></div>
                            Blocked
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mb-2"></div>

                    <h3 className="font-semibold text-base mb-4 line-clamp-1">{task.title}</h3>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="text-xs text-muted-foreground">{task.project.title}</div>

                      <div className="flex items-center gap-2">
                        {task.assigned_to_profile && (
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={task.assigned_to_profile.profile_image || undefined}
                                alt={`${task.assigned_to_profile.first_name} ${task.assigned_to_profile.last_name}`}
                              />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {getInitials(
                                  `${task.assigned_to_profile.first_name} ${task.assigned_to_profile.last_name}`,
                                )}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}

                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(task.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchQuery || statusFilter !== "all" || groupFilter !== "all"
                    ? "Try adjusting your filters or search query"
                    : "There are no tasks to display"}
                </p>
                <Button className="mt-6" onClick={() => setIsNewTaskFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {taskGroups.map((group) => (
            <motion.div
              key={group}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col h-full"
            >
              <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${groupHeaderColors[group]}`}>
                <div className="flex items-center">
                  <h3 className="font-medium text-sm">{group}</h3>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {groupedTasks[group]?.length || 0}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setIsNewTaskFormOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div
                className={`bg-card/50 dark:bg-card/20 rounded-lg flex-1 min-h-[500px] overflow-y-auto p-2 transition-colors duration-200 ${
                  draggedTask ? "border-2 border-dashed border-primary/40" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, group)}
              >
                {groupedTasks[group]?.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="mb-3"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, group)}
                    onDragEnd={handleDragEnd}
                  >
                    <Card
                      className={`hover:shadow-md transition-all ${draggedTask === task.id ? "opacity-40" : ""} cursor-pointer relative ${
                        task.priority === "High" ? "shadow-[inset_0_0_0_1px_rgba(234,88,12,0.2)]" : ""
                      }`}
                      onClick={() => handleTaskClick(task)}
                    >
                      {task.priority === "High" && (
                        <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-amber-500 border-l-[16px] border-l-transparent z-10"></div>
                      )}
                      <CardHeader className="p-3 pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <div className="mr-2">
                                {statusDots[task.status] || (
                                  <div className="h-2.5 w-2.5 rounded-full bg-slate-500"></div>
                                )}
                              </div>
                              <CardTitle className="text-sm font-medium line-clamp-1">{task.title}</CardTitle>
                            </div>
                            <CardDescription className="text-xs line-clamp-2">{task.description}</CardDescription>
                          </div>
                          <div className="ml-2 flex items-center">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-muted-foreground">{task.project.title}</div>
                          {task.assigned_to_profile && (
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={task.assigned_to_profile.profile_image || undefined}
                                alt={`${task.assigned_to_profile.first_name} ${task.assigned_to_profile.last_name}`}
                              />
                              <AvatarFallback className="text-xs">
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
                {(!groupedTasks[group] || groupedTasks[group].length === 0) && (
                  <div className="flex flex-col items-center justify-center h-24 text-center p-4 text-sm text-muted-foreground border border-dashed rounded-md mt-2">
                    <p>No tasks</p>
                    <p className="text-xs mt-1">Drag tasks here</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          isOpen={isTaskDetailOpen}
          onClose={() => setIsTaskDetailOpen(false)}
          onStatusChange={handleTaskStatusChange}
          relatedTasks={getRelatedTasks(selectedTask.id, selectedTask.project.id)}
        />
      )}

      <NewTaskForm
        isOpen={isNewTaskDialogOpen}
        onClose={() => setIsNewTaskDialogOpen(false)}
        onSubmit={handleCreateTask}
      />
      <NewTaskForm isOpen={isNewTaskFormOpen} onClose={() => setIsNewTaskFormOpen(false)} onSubmit={handleCreateTask} />
    </div>
  )
}

