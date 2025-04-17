"use client"
import { Calendar, Clock, ChevronDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import type { Task } from "@/lib/stores/tasks-store"

// Task status dots
const statusDots = {
  Pending: <div className="h-2.5 w-2.5 rounded-full bg-slate-500 mr-2"></div>,
  "In Progress": <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-2"></div>,
  QA: <div className="h-2.5 w-2.5 rounded-full bg-purple-500 mr-2"></div>,
  Open: <div className="h-2.5 w-2.5 rounded-full bg-slate-500 mr-2"></div>,
  Completed: <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>,
  Blocked: <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></div>,
}

// Task group colors
const groupColors = {
  Backlog: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100",
  "To Do": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  "In Progress": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  Review: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  Done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
}

interface TaskCardProps {
  task: Task
  handleTaskClick: (task: Task) => void
  handleTaskStatusChange: (taskId: string, newStatus: string) => Promise<void>
  getInitials: (name: string) => string
}

export function TaskCard({ task, handleTaskClick, handleTaskStatusChange, getInitials }: TaskCardProps) {
  return (
    <div
      className={`group relative bg-background rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-border ${
        task.priority === "High" ? "shadow-[inset_0_0_0_1px_rgba(234,88,12,0.2)]" : ""
      }`}
      onClick={(e) => {
        // Prevent opening task details when clicking on dropdown
        if (e.target instanceof HTMLElement && e.target.closest("[data-prevent-click]")) {
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
            className={`${groupColors[task.task_group as keyof typeof groupColors] || "bg-slate-100 text-slate-800"} px-2 py-0.5 text-[10px] font-medium`}
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
                  {statusDots[task.status as keyof typeof statusDots] || (
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
                className={task.status === "QA" ? "bg-accent" : ""}
                onClick={() => handleTaskStatusChange(task.id, "QA")}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-purple-500 mr-2"></div>
                QA
              </DropdownMenuItem>
              <DropdownMenuItem
                className={task.status === "Open" ? "bg-accent" : ""}
                onClick={() => handleTaskStatusChange(task.id, "Open")}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-slate-500 mr-2"></div>
                Open
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
        {task.due_date && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            {new Date(task.due_date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground">{task.project?.title || "Unknown Project"}</div>

          <div className="flex items-center gap-2">
            {task.assignee && (
              <div className="flex items-center gap-1.5">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee.profile_image || undefined} alt={task.assignee.user_name} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(task.assignee.user_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(task.updated_at || task.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
