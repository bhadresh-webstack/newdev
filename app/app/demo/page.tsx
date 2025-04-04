"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Circle, Clock, AlertCircle, ArrowLeft, Search, Filter, SortAsc, Plus } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { demoTasks, type DemoTask } from "@/lib/data-utils"

// Task status icons
const statusIcons = {
  Pending: <Circle className="h-4 w-4 text-slate-500" />,
  "In Progress": <Clock className="h-4 w-4 text-blue-500" />,
  Completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  Blocked: <AlertCircle className="h-4 w-4 text-red-500" />,
}

// Task group colors
const groupColors = {
  Backlog: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100",
  "To Do": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  "In Progress": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  Review: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  Done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
}

export default function DemoTasksPage() {
  const [tasks, setTasks] = useState<DemoTask[]>(demoTasks)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [groupFilter, setGroupFilter] = useState("all")
  const [viewMode, setViewMode] = useState("list")

  // Filter tasks based on search query and filters
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
    {} as Record<string, DemoTask[]>,
  )

  // All possible task groups
  const taskGroups = ["Backlog", "To Do", "In Progress", "Review", "Done"]

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/app/tasks">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">Demo Tasks</h1>
          </div>
          <p className="text-muted-foreground">Sample task data for demonstration purposes</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-8 bg-white dark:bg-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Pending")}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("In Progress")}>In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Completed")}>Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Blocked")}>Blocked</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SortAsc className="h-4 w-4" />
                Group
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setGroupFilter("all")}>All Groups</DropdownMenuItem>
              {taskGroups.map((group) => (
                <DropdownMenuItem key={group} onClick={() => setGroupFilter(group)}>
                  {group}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tabs defaultValue="list" onValueChange={setViewMode}>
            <TabsList className="grid w-[180px] grid-cols-2">
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="board">Board</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <TabsContent value="list" className="mt-0">
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {statusIcons[task.status] || <Circle className="h-4 w-4 text-slate-500" />}
                        </div>
                        <div>
                          <CardTitle>{task.title}</CardTitle>
                          <CardDescription className="mt-1">Project: {task.project.title}</CardDescription>
                        </div>
                      </div>
                      {task.assigned_to_profile && (
                        <Avatar className="h-8 w-8">
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
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="flex items-center gap-2 mt-4">
                      <Badge variant="outline" className="text-xs">
                        {task.status}
                      </Badge>
                      <Badge className={`text-xs ${groupColors[task.task_group] || "bg-slate-100 text-slate-800"}`}>
                        {task.task_group}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    Updated {new Date(task.updated_at).toLocaleDateString()}
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchQuery || statusFilter !== "all" || groupFilter !== "all"
                    ? "Try adjusting your filters or search query"
                    : "There are no tasks to display"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="board" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {taskGroups.map((group) => (
            <div key={group} className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">{group}</h3>
                <Badge variant="outline" className="text-xs">
                  {groupedTasks[group]?.length || 0}
                </Badge>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg flex-1 min-h-[300px]">
                {groupedTasks[group]?.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-2"
                  >
                    <Card className="p-3">
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">{task.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {task.project.title}
                        </Badge>
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
                    </Card>
                  </motion.div>
                ))}
                {(!groupedTasks[group] || groupedTasks[group].length === 0) && (
                  <div className="text-center p-4 text-sm text-muted-foreground">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </div>
  )
}

