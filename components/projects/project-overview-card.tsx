"use client"

import { motion } from "framer-motion"
import { CheckCircle, Clock, FolderKanban } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/project-utils"
import { Project } from "@/lib/types"

interface ProjectOverviewCardProps {
  project: Project
  userRole: string
}

export function ProjectOverviewCard({ project, userRole }: ProjectOverviewCardProps) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.6 }}
    >
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 z-0"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12 z-0"></div>

        <CardHeader className="relative z-10 border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-2 px-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                Project Overview
              </CardTitle>
              <CardDescription className="text-sm mt-0.5">
                Track progress and manage tasks for {project.title}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary px-2 py-0.5 text-xs">
                {(project.progress_percentage || 0) >= 100
                  ? "Completed"
                  : (project.progress_percentage || 0) > 0
                    ? "In Progress"
                    : "Planning"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-3 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>Overall Progress</span>
              <span className="text-primary font-bold">{project.progress_percentage}%</span>
            </div>
            <div className="relative">
              <div className="overflow-hidden h-2 text-xs flex rounded-lg bg-primary/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress_percentage}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary to-purple-600 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Key Project Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div className="space-y-0">
              <p className="text-xs font-medium text-muted-foreground">Client</p>
              <p className="font-medium text-sm">{project.customer_name}</p>
            </div>
            <div className="space-y-0">
              <p className="text-xs font-medium text-muted-foreground">Budget</p>
              <p className="font-medium text-sm">${project.budget || 2500}</p>
            </div>
            <div className="space-y-0">
              <p className="text-xs font-medium text-muted-foreground">Start Date</p>
              <p className="font-medium text-sm">{formatDate(project.start_date || "2025-04-06T00:00:00.000Z")}</p>
            </div>
            <div className="space-y-0">
              <p className="text-xs font-medium text-muted-foreground">Duration</p>
              <p className="font-medium text-sm">{project.duration_days || 112} days</p>
            </div>
            <div className="space-y-0">
              <p className="text-xs font-medium text-muted-foreground">Priority</p>
              <p className="font-medium text-sm capitalize">{project.priority || "Low"}</p>
            </div>
            <div className="space-y-0">
              <p className="text-xs font-medium text-muted-foreground">Payment Type</p>
              <p className="font-medium text-sm capitalize">{project.payment_type || "Fixed"}</p>
            </div>
          </div>

          {/* Only show detailed stats to team members and admins */}
          {(userRole === "admin" || userRole === "team") && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="group">
                <Card className="border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-primary/50">
                  <CardContent className="p-2 flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
                      <FolderKanban className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Total Tasks</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{project.total_tasks}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="group">
                <Card className="border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-primary/50">
                  <CardContent className="p-2 flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-sm shadow-green-500/20 group-hover:shadow-green-500/40 transition-all duration-300">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Completed</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">{project.completed_tasks}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -3, transition: { duration: 0.2 } }} className="group">
                <Card className="border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-primary/50">
                  <CardContent className="p-2 flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 shadow-sm shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">In Progress</p>
                      <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      {(project.total_tasks || 0) - (project.completed_tasks || 0)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
