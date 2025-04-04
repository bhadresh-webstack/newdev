"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { FolderKanban, Plus, Search, Filter, ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { demoProjects } from "@/lib/data-utils"

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

export default function ProjectsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [projects, setProjects] = useState(demoProjects)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") || "")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [userRole, setUserRole] = useState("") // Initialize empty, will be populated from localStorage

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Update search query when URL changes
  useEffect(() => {
    setSearchQuery(searchParams?.get("q") || "")
  }, [searchParams])

  // Get user role from localStorage
  useEffect(() => {
    // Only access localStorage after component mounts (client-side)
    const storedRole = typeof window !== "undefined" ? localStorage.getItem("userRole") : null
    // Set a default role if none is found
    setUserRole(storedRole || "customer")
  }, [])

  // Handle search input change without form submission
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    // Update URL with search query
    const params = new URLSearchParams(searchParams?.toString())
    if (value) {
      params.set("q", value)
    } else {
      params.delete("q")
    }

    // Use replace to avoid adding to history stack
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Prevent form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      // Search filter
      if (searchQuery && !project.project_title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Status filter
      if (statusFilter !== "all") {
        const status = getStatusText(project.progress_percentage).toLowerCase().replace(/\s+/g, "-")
        if (status !== statusFilter) {
          return false
        }
      }

      return true
    })
    .sort((a, b) => {
      // Sort by date or progress
      if (sortOrder === "newest") {
        return -1 // Simulating newest first
      } else if (sortOrder === "oldest") {
        return 1 // Simulating oldest first
      } else if (sortOrder === "progress-high") {
        return b.progress_percentage - a.progress_percentage
      } else if (sortOrder === "progress-low") {
        return a.progress_percentage - b.progress_percentage
      }
      return 0
    })

  // Get status badge color
  const getStatusColor = (progress: number) => {
    if (progress >= 100) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
    if (progress > 50) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
  }

  // Get status text
  const getStatusText = (progress: number) => {
    if (progress >= 100) return "Completed"
    if (progress > 50) return "In Progress"
    return "Planning"
  }

  if (loading) {
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold tracking-tight"
          >
            Projects
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground"
          >
            Manage and track your website development projects
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button onClick={() => router.push("/app/projects/new")} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <form onSubmit={handleSubmit} className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-8 bg-background"
            value={searchQuery}
            onChange={handleSearchChange}
            onClick={(e) => e.stopPropagation()} // Prevent click from bubbling up
          />
        </form>

        <div className="flex flex-wrap gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("planning")}>Planning</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("in-progress")}>In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
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
              key={project.project_id}
              variants={fadeInUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card
                className="h-full hover:shadow-md transition-all overflow-hidden cursor-pointer"
                onClick={() => router.push(`/app/projects/${project.project_id}`)}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{project.project_title}</CardTitle>
                      {(userRole === "admin" || userRole === "team") && (
                        <CardDescription>
                          {project.total_tasks} tasks • {project.completed_tasks} completed
                        </CardDescription>
                      )}
                      {userRole === "customer" && <CardDescription>Project ID: {project.project_id}</CardDescription>}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/app/projects/${project.project_id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/app/projects/${project.project_id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Project
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{project.progress_percentage}%</span>
                      </div>
                      <Progress value={project.progress_percentage} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(project.progress_percentage)}>
                        {getStatusText(project.progress_percentage)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/app/projects/${project.project_id}`)
                        }}
                      >
                        View
                        <FolderKanban className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
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
              <Button onClick={() => router.push("/app/projects/new")} className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

