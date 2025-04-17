"use client"

import { CheckCircle, Plus } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Task } from "@/lib/stores/tasks-store"
import { ProjectTaskList } from "./project-task-list"

interface ProjectTasksTabProps {
  projectTasks: Task[]
  isLoadingTasks: boolean
  handleTaskClick: (task: Task) => void
  setIsNewTaskFormOpen: (isOpen: boolean) => void
}

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export function ProjectTasksTab({
  projectTasks,
  isLoadingTasks,
  handleTaskClick,
  setIsNewTaskFormOpen,
}: ProjectTasksTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-lg font-semibold">Project Tasks</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage and track tasks for this project</p>
        </div>
        <Button
          size="sm"
          className="gap-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          onClick={() => setIsNewTaskFormOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Task
        </Button>
      </div>

      {isLoadingTasks ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {projectTasks.length > 0 ? (
            <ProjectTaskList tasks={projectTasks} onTaskClick={handleTaskClick} />
          ) : (
            <Card className="border border-dashed bg-background/50">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="rounded-full bg-primary/10 p-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-medium mb-1">No tasks found</h3>
                <p className="text-muted-foreground text-center text-sm max-w-md mb-4">
                  This project doesn't have any tasks yet. Create your first task to get started.
                </p>
                <Button
                  size="sm"
                  className="gap-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  onClick={() => setIsNewTaskFormOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create First Task
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  )
}
