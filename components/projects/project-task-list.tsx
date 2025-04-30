"use client"

import { Calendar, CheckCircle, Circle, Clock, MoreHorizontal, Plus } from "lucide-react"
import { motion } from "framer-motion"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Task } from "@/lib/stores/tasks-store"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

interface ProjectTaskListProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

export function ProjectTaskList({ tasks, onTaskClick }: ProjectTaskListProps) {
  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Function to get relative time (days ago)
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))

    if (diffDays > 0) {
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`
    } else if (diffHours > 0) {
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`
    } else if (diffMinutes > 0) {
      return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`
    } else {
      return "Just now"
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <div className="grid grid-cols-12 gap-3 p-3 text-xs font-medium text-muted-foreground border-b">
        <div className="col-span-5">Task</div>
        <div className="col-span-2 text-center">Assignee</div>
        <div className="col-span-2 text-center">Due Date</div>
        <div className="col-span-2 text-center">Priority</div>
        <div className="col-span-1 flex justify-end">
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-primary/10 text-primary">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            variants={fadeInUp}
            className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            onClick={() => onTaskClick(task)}
          >
            <div className="grid grid-cols-12 gap-3 p-3 items-center relative">
              {/* Priority indicator */}
              {task.priority === "High" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
              {task.priority === "Medium" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}

              {/* Task title and description */}
              <div className="col-span-5 flex items-center gap-2">
                <div className="flex-shrink-0">
                  {task.status === "Completed" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : task.status === "In Progress" ? (
                    <Clock className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-400" />
                  )}
                </div>
                <div className="flex items-center gap-2 overflow-hidden">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                    {task.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1 py-0 border-muted-foreground/30 bg-background flex-shrink-0"
                  >
                    {task.task_group || "Backlog"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                    {getRelativeTime(task.created_at)}
                  </span>
                </div>
              </div>

              {/* Assignee */}
              <div className="col-span-2 flex justify-center">
                {task.assignee ? (
                  <Avatar className="h-7 w-7 border border-muted">
                    <AvatarImage src={task.assignee.profile_image || undefined} alt={task.assignee.user_name} />
                    <AvatarFallback className="bg-primary text-white text-xs">
                      {getInitials(task.assignee.user_name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800">
                    Unassigned
                  </Badge>
                )}
              </div>

              {/* Due Date */}
              <div className="col-span-2 flex justify-center items-center text-sm">
                {task.due_date ? (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">{new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">No due date</span>
                )}
              </div>

              {/* Priority */}
              <div className="col-span-2 flex justify-center">
                <Badge
                  className={`${
                    task.priority === "High"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                      : task.priority === "Medium"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
                  } px-2.5 py-0.5 text-xs font-medium`}
                >
                  {task.priority || "Low"}
                </Badge>
              </div>

              {/* Three dots menu */}
              <div className="col-span-1 flex justify-end">
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
