"use client"

import { motion } from "framer-motion"
import { Calendar, CheckCircle, Trash2, Users } from "lucide-react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuthStore } from "@/lib/stores/auth-store"
import type { Project } from "@/lib/stores/projects-store"

interface ProjectCardProps {
  project: Project
  onDelete: (projectId: string) => void
  isDeleting: boolean
}

export function ProjectCard({ project, onDelete, isDeleting }: ProjectCardProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const userRole = user?.role

  // Update the getStatusText and getStatusColor functions to properly handle undefined values

  // Get status text
  const getStatusText = (progress: number | undefined): string => {
    if (!progress) return "Planning"
    if (progress >= 100) return "Completed"
    if (progress > 50) return "In Progress"
    return "Planning"
  }

  // Get status badge color
  const getStatusColor = (progress: number | undefined): string => {
    if (!progress) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
    if (progress >= 100) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
    if (progress > 50) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
  }

  // Calculate due date from start date and duration
  const calculateDueDate = (startDate: string | undefined, durationDays: number | undefined) => {
    if (!startDate || !durationDays) return null

    const date = new Date(startDate)
    date.setDate(date.getDate() + durationDays)
    return date
  }

  return (
    <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }}>
      <Card
        className="overflow-hidden cursor-pointer relative group border-border/40 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 shadow-sm hover:shadow-md transition-all duration-300"
        onClick={() => router.push(`/app/projects/${project.id}`)}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600 z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <div className="p-3 relative z-10">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 pr-4">
              <h3 className="text-base font-semibold truncate">{project.title}</h3>
              {(userRole === "admin" || userRole === "team_member") && (
                <p className="text-xs text-muted-foreground">
                  {project.total_tasks || 0} tasks • {project.completed_tasks || 0} completed
                </p>
              )}
              {userRole === "customer" && (
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
            {userRole === "admin" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-red-500"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(project.id)
                }}
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground font-medium">Progress</span>
              <span className="font-semibold">{project.progress_percentage || 0}%</span>
            </div>
            <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${project.progress_percentage || 0}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between pt-1 mt-1 border-t border-border/30 text-xs">
              <div className="flex items-center gap-1">
                <Badge className={`${getStatusColor(project.progress_percentage)} px-1.5 py-0 text-[10px] font-medium`}>
                  {getStatusText(project.progress_percentage)}
                </Badge>

                {userRole === "team_member" && (
                  <div className="flex items-center gap-1 ml-1">
                    {project.isTeamMember ? (
                      <Badge
                        variant="outline"
                        className="px-1.5 py-0 text-[10px] font-medium border-primary/30 text-primary"
                      >
                        <Users className="h-2.5 w-2.5 mr-0.5" />
                        Team
                      </Badge>
                    ) : (
                      project.hasAssignedTasks && (
                        <Badge
                          variant="outline"
                          className="px-1.5 py-0 text-[10px] font-medium border-purple-500/30 text-purple-500"
                        >
                          <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                          Tasks
                        </Badge>
                      )
                    )}
                  </div>
                )}

                {userRole !== "customer" && userRole !== "team_member" && (
                  <>
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/80 to-purple-600/80 flex items-center justify-center text-white text-[10px] font-bold ml-1">
                      {userRole === "admin" && project.customer_id === user.id
                        ? "S"
                        : project.customer_name
                          ? project.customer_name.charAt(0).toUpperCase()
                          : "P"}
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[60px]">
                      {userRole === "admin" && project.customer_id === user.id
                        ? "Self"
                        : project.customer_name || "Project"}
                    </span>
                  </>
                )}
              </div>

              {project.start_date && project.duration_days && (
                <div className="flex items-center text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {calculateDueDate(project.start_date, project.duration_days)?.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
