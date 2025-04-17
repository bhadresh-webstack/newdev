"use client"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface TaskHeaderProps {
  setIsNewTaskDialogOpen: (value: boolean) => void
}

export function TaskHeader({ setIsNewTaskDialogOpen }: TaskHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-semibold tracking-tight"
        >
          Tasks
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground"
        >
          Manage and track tasks across all your projects
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Button className="gap-1.5" onClick={() => setIsNewTaskDialogOpen(true)}>
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </motion.div>
    </div>
  )
}
