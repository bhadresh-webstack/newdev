"use client"

import { Calendar, CheckCircle, Circle, Clock, MoreHorizontal } from "lucide-react"
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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <div className="grid grid-cols-12 gap-3 p-3 text-xs font-medium text-muted-foreground border-b">
        <div className="col-span-6 md:col-span-5">Task</div>
        <div className="col-span-3 md:col-span-2 text-center">Status</div>
        <div className="hidden md:block md:col-span-2">Due Date</div>
        <div className="col-span-3 md:col-span-3 text-right">Assigned To</div>
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
              <div className="col-span-6 md:col-span-5 flex items-start gap-2">
                <div className="mt-1 flex-shrink-0">
                  {task.status === "Completed" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : task.status === "In Progress" ? (
                    <Clock className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                    {task.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</p>
                  {task.due_date && (
                    <div className="flex items-center text-[10px] text-muted-foreground mt-0.5">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(task.due_date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="outline" className="text-[10px] px-1 py-0 border-muted-foreground/30 bg-background">
                      {task.task_group || "Backlog"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Created {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="col-span-3 md:col-span-2 flex justify-center">
                <Badge
                  className={`${
                    task.status === "Completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : task.status === "In Progress"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                        : task.status === "Blocked"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
                  } px-2.5 py-0.5 font-medium`}
                >
                  {task.status}
                </Badge>
              </div>

              {/* Due Date */}
              <div className="hidden md:flex md:col-span-2 items-center text-sm">
                {task.due_date ? (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No due date</span>
                )}
              </div>

              {/* Assigned To */}
              <div className="col-span-3 md:col-span-3 flex items-center justify-end gap-2">
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <div className="hidden md:block text-sm text-right">
                      <p className="font-medium line-clamp-1">{task.assignee.user_name}</p>
                    </div>
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={task.assignee.profile_image || undefined} alt={task.assignee.user_name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs">
                        {getInitials(task.assignee.user_name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800">
                    Unassigned
                  </Badge>
                )}
              </div>

              {/* Action button that appears on hover */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
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
