"use client"
import { motion } from "framer-motion"
import { Search, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TaskCard } from "./task-card"
import type { Task } from "@/lib/stores/tasks-store"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

interface TaskListProps {
  tasks: Task[]
  handleTaskClick: (task: Task) => void
  handleTaskStatusChange: (taskId: string, newStatus: string) => Promise<void>
  getInitials: (name: string) => string
  setIsNewTaskDialogOpen: (value: boolean) => void
}

export function TaskList({
  tasks,
  handleTaskClick,
  handleTaskStatusChange,
  getInitials,
  setIsNewTaskDialogOpen,
}: TaskListProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <motion.div key={task.id} variants={fadeInUp}>
            <TaskCard
              task={task}
              handleTaskClick={handleTaskClick}
              handleTaskStatusChange={handleTaskStatusChange}
              getInitials={getInitials}
            />
          </motion.div>
        ))
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="col-span-full"
        >
          <div className="flex flex-col items-center justify-center py-16 bg-card rounded-lg border border-dashed">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-muted-foreground text-center max-w-md">Try adjusting your filters or search query</p>
            <Button className="mt-6" onClick={() => setIsNewTaskDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
