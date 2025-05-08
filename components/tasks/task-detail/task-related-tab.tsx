"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Circle, ArrowUpRight } from "lucide-react"
import type { Task } from "@/lib/stores/tasks-store"
import { JSX } from "react"

interface TaskRelatedTabProps {
  relatedTasks: Task[]
  statusIcons: Record<string, JSX.Element>
  setLocalTask: (task: Task) => void
  setActiveTab: (tab: string) => void
  getInitials: (name: string) => string
}

export function TaskRelatedTab({
  relatedTasks,
  statusIcons,
  setLocalTask,
  setActiveTab,
  getInitials,
}: TaskRelatedTabProps) {

  const getStatusIcon = (status: string | undefined): React.ReactNode => {
    return status ? (statusIcons[status] as React.ReactNode) : null
  }

  return (
    <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border p-4 shadow-sm">
      <div className="space-y-3">
        {relatedTasks.length > 0 ? (
          relatedTasks.map((relatedTask) => (
            <div
              key={relatedTask.id}
              className="flex items-start gap-3 p-3 rounded-md border hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => {
                setLocalTask(relatedTask)
                setActiveTab("details")
              }}
            >
              <div className="mt-0.5 flex-shrink-0">
                {getStatusIcon(relatedTask.status) || (<Circle className="h-4 w-4 text-slate-500" />)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{relatedTask.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{relatedTask.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs px-1.5 py-0 border-muted-foreground/30">
                    {relatedTask.task_group}
                  </Badge>
                  {relatedTask.assignee && (
                    <div className="flex items-center gap-1">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-[8px]">
                          {getInitials(relatedTask.assignee.user_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{relatedTask.assignee.user_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ArrowUpRight className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No related tasks found</p>
            <p className="text-sm mt-1">This task is the only one in the project or no project is assigned.</p>
          </div>
        )}
      </div>
    </div>
  )
}
