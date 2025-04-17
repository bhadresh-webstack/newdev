"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/projects/project-card"
import { EmptyProjects } from "@/components/projects/empty-projects"
import type { Project } from "@/lib/types"

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

interface RecentProjectsProps {
  projects: Project[]
  userRole: string
}

export function RecentProjects({ projects, userRole }: RecentProjectsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Projects</h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/app/projects">
            View All
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {projects.length > 0 ? (
          projects
            .slice(0, 3)
            .map((project) => {
              const transformedProject = {
                ...project,
                updated_at: project.updated_at ?? undefined,
              };
              return (
                <ProjectCard
                  key={transformedProject.id}
                  project={transformedProject}
                  onDelete={() => {}}
                  isDeleting={false}
                />
              );
            })
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="col-span-full"
          >
            <EmptyProjects searchQuery={""} userRole={userRole} />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
