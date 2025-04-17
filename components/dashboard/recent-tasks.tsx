"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProjectTaskList } from "@/components/projects/project-task-list"
import type { Task } from "@/lib/types"

interface RecentTasksProps {
  recentTasks: Task[]
  onTaskClick: (task: Task) => void
  userRole: string
}

export function RecentTasks({ recentTasks, onTaskClick, userRole }: RecentTasksProps) {
  if (userRole !== "team_member" && userRole !== "admin") {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Tasks</h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/app/tasks">
            View All
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {recentTasks.length > 0 ? (
        <ProjectTaskList tasks={recentTasks} onTaskClick={onTaskClick} />
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No recent tasks</h3>
            <p className="text-muted-foreground mt-1">You don't have any tasks assigned to you yet.</p>
          </div>
        </Card>
      )}
    </motion.div>
  )
}
