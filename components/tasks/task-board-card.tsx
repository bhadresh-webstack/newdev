"use client"

import type React from "react"
import { GripVertical } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

interface TaskBoardCardProps {
  task: Task
  handleTaskClick: (task: Task) => void
  getInitials: (name: string) => string
  draggedTask: string | null
  handleDragStart: (e: React.DragEvent, task: Task, group: string) => void
  handleDragEnd: (e: React.DragEvent) => void
  group: string
}

export function TaskBoardCard({
  task,
  handleTaskClick,
  getInitials,
  draggedTask,
  handleDragStart,
  handleDragEnd,
  group,
}: TaskBoardCardProps) {
  return (
    <Card
      className={`hover:shadow-md transition-all ${draggedTask === task.id ? "opacity-40" : ""} cursor-pointer relative ${
        task.priority === "High" ? "shadow-[inset_0_0_0_1px_rgba(234,88,12,0.2)]" : ""
      }`}
      onClick={() => handleTaskClick(task)}
      draggable
      onDragStart={(e) => handleDragStart(e, task, group)}
      onDragEnd={handleDragEnd}
    >
      {task.priority === "High" && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-amber-500 border-l-[16px] border-l-transparent z-10"></div>
      )}
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <div className="mr-2">
                {statusDots[task.status as keyof typeof statusDots] || (
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
          <div className="text-xs text-muted-foreground">{task.project?.title || "Unknown Project"}</div>
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.profile_image || undefined} alt={task.assignee.user_name} />
              <AvatarFallback className="text-xs">{getInitials(task.assignee.user_name)}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
