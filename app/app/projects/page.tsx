"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, Search, Filter, ArrowUpDown, Trash2, Calendar, Users, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useProjectsStore, type Project } from "@/lib/stores/projects-store"
import { useToast } from "@/hooks/use-toast"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}

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

// Extended Project type with relationship flags
interface EnhancedProject extends Project {
  isTeamMember?: boolean
  hasAssignedTasks?: boolean
}

export default function ProjectsPage() {
  const { fetchProjects, deleteProject, isLoading, error } = useProjectsStore()
  const { user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [projects, setProjects] = useState<EnhancedProject[]>([])
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") || "")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [relationshipFilter, setRelationshipFilter] = useState("all") // For team members: all, team, tasks
  const [isDeleting, setIsDeleting] = useState(false)

  const userRole = user?.role

  // Get status text
  const getStatusText = (progress: number) => {
    if (progress >= 100) return "Completed"
    if (progress > 50) return "In Progress"
    return "Planning"
  }

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
        setProjects(data)
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

    // Only reload if the query has changed
    // if (query !== searchQuery) {
    //   loadProjects()
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }

  // Prevent form submission
  const handleSubmit = (e: React.FormEvent) => {
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
  const filteredProjects = projects
    .filter((project) => {
      // Apply status filter
      if (statusFilter !== "all") {
        const projectStatus = getStatusText(project.progress_percentage || 0)
        if (projectStatus !== statusFilter) {
          return false
        }
      }

      // Apply relationship filter for team members
      if (userRole === "team_member" && relationshipFilter !== "all") {
        if (relationshipFilter === "team" && !project.isTeamMember) {
          return false
        }
        if (relationshipFilter === "tasks" && !project.hasAssignedTasks) {
          return false
        }
      }

      // Apply search filter if needed
      if (searchQuery) {
        return project.title.toLowerCase().includes(searchQuery.toLowerCase())
      }

      return true
    })
    .sort((a, b) => {
      // Sort by date or progress
      if (sortOrder === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortOrder === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortOrder === "progress-high") {
        return (b.progress_percentage || 0) - (a.progress_percentage || 0)
      } else if (sortOrder === "progress-low") {
        return (a.progress_percentage || 0) - (b.progress_percentage || 0)
      }
      return 0
    })

  // Get status badge color
  const getStatusColor = (progress: number) => {
    if (progress >= 100) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
    if (progress > 50) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
  }

  if (isLoading && projects.length === 0) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted rounded-md w-1/3"></div>
          <div className="h-10 bg-muted rounded-md w-32"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-10 bg-muted rounded-md w-64"></div>
          <div className="h-10 bg-muted rounded-md w-32"></div>
          <div className="h-10 bg-muted rounded-md w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  // Calculate due date from start date and duration
  const calculateDueDate = (startDate: string | undefined, durationDays: number | undefined) => {
    if (!startDate || !durationDays) return null

    const date = new Date(startDate)
    date.setDate(date.getDate() + durationDays)
    return date
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your development projects efficiently</p>
        </div>
        {(userRole === "admin" || userRole === "customer") && (
          <Button
            onClick={() => router.push("/app/projects/new")}
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <form onSubmit={handleSubmit} className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-7 h-8 text-sm bg-background"
            value={searchQuery}
            onChange={handleSearchChange}
            onClick={(e) => e.stopPropagation()}
          />
        </form>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Planning")}>Planning</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("In Progress")}>In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Completed")}>Completed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {userRole === "team_member" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Relationship
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setRelationshipFilter("all")}>All Projects</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRelationshipFilter("team")}>Team Member</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRelationshipFilter("tasks")}>Assigned Tasks</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortOrder("newest")}>Newest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("oldest")}>Oldest First</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder("progress-high")}>Progress (High to Low)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("progress-low")}>Progress (Low to High)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
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
                          handleDeleteProject(project.id)
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
                        <Badge
                          className={`${getStatusColor(project.progress_percentage || 0)} px-1.5 py-0 text-[10px] font-medium`}
                        >
                          {getStatusText(project.progress_percentage || 0)}
                        </Badge>

                        {userRole === "team_member" && (
                          <div className="flex items-center gap-1 ml-1">
                            {project.isTeamMember && (
                              <Badge
                                variant="outline"
                                className="px-1.5 py-0 text-[10px] font-medium border-primary/30 text-primary"
                              >
                                <Users className="h-2.5 w-2.5 mr-0.5" />
                                Team
                              </Badge>
                            )}
                            {project.hasAssignedTasks && (
                              <Badge
                                variant="outline"
                                className="px-1.5 py-0 text-[10px] font-medium border-purple-500/30 text-purple-500"
                              >
                                <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                                Tasks
                              </Badge>
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
                            {calculateDueDate(project.start_date, project.duration_days)?.toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                {searchQuery ? `No projects matching "${searchQuery}"` : "Get started by creating your first project"}
              </p>
              {(userRole === "admin" || userRole === "customer") && (
                <Button onClick={() => router.push("/app/projects/new")} className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
