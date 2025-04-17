"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"

import { useAuthStore } from "@/lib/stores/auth-store"
import { useProjectsStore } from "@/lib/stores/projects-store"
import { useToast } from "@/hooks/use-toast"
import { useProjectFilters } from "@/lib/hooks/use-project-filters"

import { ProjectHeader } from "@/components/projects/project-header"
import { ProjectFilters } from "@/components/projects/project-filters"
import { ProjectCard } from "@/components/projects/project-card"
import { EmptyProjects } from "@/components/projects/empty-projects"
import { ProjectLoadingSkeleton } from "@/components/projects/project-loading-skeleton"
import type { Project } from "@/lib/stores/projects-store"

// Animation variants
const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

export default function ProjectsPage() {
  const { fetchProjects, deleteProject, isLoading, error } = useProjectsStore()
  const { user } = useAuthStore()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [projects, setProjects] = useState<Project[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const userRole = user?.role

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    relationshipFilter,
    setRelationshipFilter,
    filterProjects,
  } = useProjectFilters()

  // Fetch projects on component mount
  const loadProjects = async () => {
    try {
      const { data, error } = await fetchProjects()

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      if (data) {
        setProjects(data as Project[])
      }
    } catch (err) {
      console.error("Error loading projects:", err)
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Load projects on initial render
  useEffect(() => {
    loadProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update search query when URL changes
  useEffect(() => {
    const query = searchParams?.get("q") || ""
    setSearchQuery(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }

  // Prevent form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  // Handle project deletion
  const handleDeleteProject = async (projectId: string) => {
    try {
      setIsDeleting(true)

      const { error } = await deleteProject(projectId)

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Project deleted successfully",
      })

      // Reload projects after deletion
      loadProjects()
    } catch (err) {
      console.error("Error deleting project:", err)
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Filter and sort projects
  const filteredProjects = filterProjects(projects)

  if (isLoading && projects.length === 0) {
    return <ProjectLoadingSkeleton />
  }

  return (
    <div className="space-y-8">
      <ProjectHeader userRole={userRole} />

      <ProjectFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSubmit={handleSubmit}
        setStatusFilter={setStatusFilter}
        setRelationshipFilter={setRelationshipFilter}
        setSortOrder={setSortOrder}
        userRole={userRole}
      />

      {filteredProjects.length > 0 ? (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={handleDeleteProject} isDeleting={isDeleting} />
          ))}
        </motion.div>
      ) : (
        <EmptyProjects searchQuery={searchQuery} userRole={userRole} />
      )}
    </div>
  )
}
