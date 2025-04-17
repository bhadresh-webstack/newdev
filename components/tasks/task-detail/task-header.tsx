"use client"

import { Button } from "@/components/ui/button"
import { SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpRight, Circle, CheckCircle, Clock, Edit, MoreHorizontal, Trash2, User } from "lucide-react"
import type { Task } from "@/lib/stores/tasks-store"

interface TaskHeaderProps {
  task: Task
  statusIcons: Record<string, JSX.Element>
  statusColors: Record<string, string>
  handleStatusChange: (newStatus: string) => Promise<void>
  handleEditClick: () => void
  handleDelete: () => void
  getPriorityBadge: (priority: string | undefined) => JSX.Element | null
  isAdmin: boolean
}

export function TaskHeader({
  task,
  statusIcons,
  statusColors,
  handleStatusChange,
  handleEditClick,
  handleDelete,
  getPriorityBadge,
  isAdmin,
}: TaskHeaderProps) {
  // Helper function to safely get status icon
  const getStatusIcon = (status: string | undefined): React.ReactNode => {
    if (!status || !(status in statusIcons)) {
      return statusIcons.Pending as React.ReactNode
    }
    return statusIcons[status] as React.ReactNode
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 p-6 border-b">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{getStatusIcon(task.status)}</div>
          <SheetTitle className="text-xl font-semibold tracking-tight">{task.title}</SheetTitle>
        </div>
      </div>

      {task.project && (
        <div className="flex items-center gap-2 text-muted-foreground ml-8">
          <span className="text-sm">Project:</span>
          <Button variant="link" className="p-0 h-auto text-sm font-medium flex items-center gap-1">
            {task.project.title}
            <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-4 ml-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-white/80 dark:bg-black/20 backdrop-blur-sm">
              {getStatusIcon(task.status)}
              <span>{task.status}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleStatusChange("Pending")} className="gap-2">
              <Circle className="h-4 w-4 text-slate-500" />
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("In Progress")} className="gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("QA")} className="gap-2">
              <Circle className="h-4 w-4 text-purple-500" />
              QA
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("Open")} className="gap-2">
              <Circle className="h-4 w-4 text-slate-500" />
              Open
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("Completed")} className="gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("Blocked")} className="gap-2">
              <Circle className="h-4 w-4 text-red-500" />
              Blocked
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {task.priority && (getPriorityBadge(task.priority) as React.ReactNode)}

        <div className="flex-grow"></div>

        {isAdmin && (<DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">

              <DropdownMenuItem className="gap-2" onClick={handleEditClick}>
                <Edit className="h-4 w-4" />
                Edit Task
              </DropdownMenuItem>

            <DropdownMenuItem className="gap-2">
              <User className="h-4 w-4" />
              Assign Task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 gap-2" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>)}
      </div>
    </div>
  )
}
