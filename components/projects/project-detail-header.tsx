"use client"

import { ArrowLeft, Edit, MoreHorizontal, Settings, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

interface ProjectDetailHeaderProps {
  projectId: string
  projectTitle: string
  handleDeleteProject: () => void
  isDeleting: boolean
}

export function ProjectDetailHeader({
  projectId,
  projectTitle,
  handleDeleteProject,
  isDeleting,
}: ProjectDetailHeaderProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={() => router.push("/projects")}
        >
          <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </Button>
        <div className="flex items-center">
          <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 capitalize">
            {projectTitle}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary shadow-sm"
          onClick={() => router.push(`/projects/${projectId}/edit`)}
        >
          <Edit className="h-3.5 w-3.5" />
          Edit
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Project Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={handleDeleteProject} disabled={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete Project"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}
