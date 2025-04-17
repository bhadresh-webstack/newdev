"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TaskBoardCard } from "./task-board-card"
import type { Task } from "@/lib/stores/tasks-store"

// Task group header colors
const groupHeaderColors = {
  Backlog: "border-slate-300 dark:border-slate-600",
  "To Do": "border-blue-300 dark:border-blue-700",
  "In Progress": "border-amber-300 dark:border-amber-700",
  Review: "border-purple-300 dark:border-purple-700",
  Done: "border-green-300 dark:border-green-700",
}

interface TaskBoardProps {
  taskGroups: string[]
  groupedTasks: Record<string, Task[]>
  handleTaskClick: (task: Task) => void
  getInitials: (name: string) => string
  draggedTask: string | null
  handleDragStart: (e: React.DragEvent, task: Task, group: string) => void
  handleDragEnd: (e: React.DragEvent) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent, targetGroup: string) => void
  setIsNewTaskFormOpen: (value: boolean) => void
}

export function TaskBoard({
  taskGroups,
  groupedTasks,
  handleTaskClick,
  getInitials,
  draggedTask,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  setIsNewTaskFormOpen,
}: TaskBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {taskGroups.map((group) => (
        <motion.div
          key={group}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col h-full"
        >
          <div
            className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${groupHeaderColors[group as keyof typeof groupHeaderColors] || groupHeaderColors.Backlog}`}
          >
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
              >
                <TaskBoardCard
                  task={task}
                  handleTaskClick={handleTaskClick}
                  getInitials={getInitials}
                  draggedTask={draggedTask}
                  handleDragStart={handleDragStart}
                  handleDragEnd={handleDragEnd}
                  group={group}
                />
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
  )
}
