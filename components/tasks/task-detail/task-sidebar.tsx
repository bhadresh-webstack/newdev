"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Calendar, Circle } from "lucide-react"
import type { Task } from "@/lib/stores/tasks-store"

interface TaskSidebarProps {
  task: Task
  statusColors: Record<string, string>
  getPriorityBadge: (priority: string | undefined) => JSX.Element | null
  getInitials: (name: string) => string
  formatDate: (dateString: string | null | undefined) => string
  relatedTasks: Task[]
  statusIcons: Record<string, JSX.Element>
  setLocalTask: (task: Task) => void
  setActiveTab: (tab: string) => void
}

export function TaskSidebar({
  task,
  statusColors,
  getPriorityBadge,
  getInitials,
  formatDate,
  relatedTasks,
  statusIcons,
  setLocalTask,
  setActiveTab,
}: TaskSidebarProps) {
  const getStatusIcon = (status: string | undefined): React.ReactNode => {
    return status ? (statusIcons[status] as React.ReactNode) : null
  }
  return (
    <div className="space-y-4">
      <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border p-4 shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Task Details</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Badge
                className={`${
                  statusColors[task.status as keyof typeof statusColors] || statusColors.Pending
                } px-2 py-0.5`}
              >
                {task.status}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Priority</p>
              {task.priority ? (
                getPriorityBadge(task.priority) as React.ReactNode
              ) : (
                <span className="text-xs italic text-muted-foreground">Not set</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
            {task.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border">
                  <AvatarImage src={task.assignee.profile_image || undefined} alt={task.assignee.user_name} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                    {getInitials(task.assignee.user_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{task.assignee.user_name}</span>
              </div>
            ) : (
              <p className="text-xs italic text-muted-foreground">Unassigned</p>
            )}
          </div>

          <Separator className="my-2" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Created</p>
              <p className="text-sm">{formatDate(task.created_at)}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Updated</p>
              <p className="text-sm">{formatDate(task.updated_at)}</p>
            </div>
          </div>

          {task.due_date && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Due Date</p>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm">{formatDate(task.due_date)}</p>
              </div>
            </div>
          )}

          {task.task_group && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Group</p>
              <Badge variant="outline" className="mt-1 font-normal">
                {task.task_group}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Related tasks card */}
      {relatedTasks.length > 0 && (
        <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border p-4 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Related Tasks</h3>

          <div className="space-y-2">
            {relatedTasks.slice(0, 3).map((relatedTask) => (
              <div
                key={relatedTask.id}
                className="flex items-start gap-2 p-2 rounded-md transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer group"
                onClick={() => {
                  // Update the local task to show the related task details
                  setLocalTask(relatedTask)
                }}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {getStatusIcon(relatedTask.status) || (
                    <Circle className="h-4 w-4 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {relatedTask.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{relatedTask.description}</p>
                </div>
              </div>
            ))}

            {relatedTasks.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-1 text-xs h-7"
                onClick={() => setActiveTab("related")}
              >
                View all {relatedTasks.length} related tasks
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
