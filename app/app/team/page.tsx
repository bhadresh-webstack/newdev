"use client"

import { useEffect, useState } from "react"
import {
  BarChart3,
  CheckCircle2,
  Clock,
  FileEdit,
  Filter,
  Layers,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Project status badge colors
const statusColors = {
  submitted: "bg-blue-500",
  "in-development": "bg-amber-500",
  "waiting-for-feedback": "bg-purple-500",
  "revision-in-progress": "bg-indigo-500",
  approved: "bg-green-500",
  hosted: "bg-emerald-500",
}

// Project status display names
const statusNames = {
  submitted: "Submitted",
  "in-development": "In Development",
  "waiting-for-feedback": "Waiting for Feedback",
  "revision-in-progress": "Revision in Progress",
  approved: "Approved",
  hosted: "Hosted",
}

// Project type icons
const projectTypeIcons = {
  business: Layers,
  ecommerce: BarChart3,
  portfolio: FileEdit,
  blog: MessageSquare,
}

export default function TeamDashboard() {
  const [profile, setProfile] = useState({
    id: "team-1",
    first_name: "Team",
    last_name: "Member",
    email: "team@gmail.com",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Use mock data
        setProjects([
          {
            id: "1",
            title: "E-commerce Website",
            description: "A fully functional online store with product catalog and checkout",
            status: "in-development",
            progress_percentage: 65,
            created_at: "2023-01-15T10:30:00Z",
            profiles: {
              first_name: "John",
              last_name: "Doe",
              email: "john@example.com",
              company_name: "Acme Inc.",
            },
          },
          {
            id: "2",
            title: "Portfolio Redesign",
            description: "Modern portfolio website with project showcase",
            status: "waiting-for-feedback",
            progress_percentage: 80,
            created_at: "2023-02-20T14:45:00Z",
            profiles: {
              first_name: "Jane",
              last_name: "Smith",
              email: "jane@example.com",
              company_name: "Design Studio",
            },
          },
        ])

        // This is a placeholder for actual task fetching
        setTasks([
          {
            id: 1,
            title: "Review homepage design",
            project_id: 1,
            project_title: "TechInnovate Website",
            status: "in-progress",
            priority: "high",
            due_date: "2023-06-20T00:00:00Z",
          },
          {
            id: 2,
            title: "Implement contact form",
            project_id: 1,
            project_title: "TechInnovate Website",
            status: "completed",
            priority: "medium",
            due_date: "2023-06-15T00:00:00Z",
          },
          {
            id: 3,
            title: "Set up hosting environment",
            project_id: 2,
            project_title: "GrowFast E-commerce",
            status: "pending",
            priority: "high",
            due_date: "2023-06-25T00:00:00Z",
          },
        ])

        // Use mock data for customers
        setCustomers([
          {
            id: "1",
            first_name: "John",
            last_name: "Doe",
            email: "john@example.com",
            company_name: "Acme Inc.",
            subscription_tier: "premium",
          },
          {
            id: "2",
            first_name: "Jane",
            last_name: "Smith",
            email: "jane@example.com",
            company_name: "Design Studio",
            subscription_tier: "standard",
          },
          {
            id: "3",
            first_name: "Bob",
            last_name: "Johnson",
            email: "bob@example.com",
            company_name: "Tech Solutions",
            subscription_tier: "premium",
          },
        ])

        setIsLoadingProjects(false)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoadingProjects(false)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter projects based on search query and status filter
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.profiles?.company_name || "").toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Dashboard</h1>
          <p className="text-muted-foreground">Manage projects, tasks, and customer communications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" /> Team
          </Button>
          <Button className="bg-gradient-to-r from-primary to-purple-600">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              {projects.filter((p) => p.status === "hosted").length} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter((t) => t.status === "in-progress").length}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter((t) => t.priority === "high" && t.status === "in-progress").length} high priority
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter((p) => p.status === "waiting-for-feedback").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting customer review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              {customers.filter((c) => c.subscription_tier === "premium").length} premium
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in-development">In Development</SelectItem>
                  <SelectItem value="waiting-for-feedback">Waiting for Feedback</SelectItem>
                  <SelectItem value="revision-in-progress">Revision in Progress</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="hosted">Hosted</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingProjects ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-muted mb-4">
                  <Layers className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No projects found</h3>
                <p className="text-muted-foreground mt-2 mb-4">Try adjusting your search or filter criteria</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredProjects.map((project) => {
                const ProjectIcon = projectTypeIcons[project.type as keyof typeof projectTypeIcons] || Layers
                return (
                  <div key={project.id} className="cursor-pointer">
                    <Card className="h-full overflow-hidden hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <Badge
                            className={`${statusColors[project.status as keyof typeof statusColors] || "bg-gray-500"} text-white`}
                          >
                            {statusNames[project.status as keyof typeof statusNames] || project.status}
                          </Badge>
                          <ProjectIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <CardTitle className="mt-2">{project.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {project.status === "hosted"
                                ? "100%"
                                : project.status === "approved"
                                  ? "90%"
                                  : project.status === "waiting-for-feedback"
                                    ? "75%"
                                    : project.status === "revision-in-progress"
                                      ? "60%"
                                      : project.status === "in-development"
                                        ? "40%"
                                        : "20%"}
                            </span>
                          </div>
                          <Progress
                            value={
                              project.status === "hosted"
                                ? 100
                                : project.status === "approved"
                                  ? 90
                                  : project.status === "waiting-for-feedback"
                                    ? 75
                                    : project.status === "revision-in-progress"
                                      ? 60
                                      : project.status === "in-development"
                                        ? 40
                                        : 20
                            }
                            className="h-2"
                          />
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`/placeholder.svg?height=24&width=24`} alt="Customer avatar" />
                            <AvatarFallback>
                              {project.profiles?.first_name?.[0] || "C"}
                              {project.profiles?.last_name?.[0] || ""}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground truncate">
                            {project.profiles?.company_name || "Customer"}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="text-xs text-muted-foreground">
                        Created on {new Date(project.created_at).toLocaleDateString()}
                      </CardFooter>
                    </Card>
                  </div>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>Tasks assigned to you across all projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-muted mb-4">
                    <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No tasks assigned</h3>
                  <p className="text-muted-foreground mt-2">You don't have any tasks assigned to you at the moment</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-2 h-10 rounded-full ${
                          task.status === "completed"
                            ? "bg-green-500"
                            : task.status === "in-progress"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {task.project_title} • Due {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`
                        ${
                          task.priority === "high"
                            ? "bg-red-500"
                            : task.priority === "medium"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }
                        text-white
                      `}
                      >
                        {task.priority}
                      </Badge>
                      <Badge
                        className={`
                        ${
                          task.status === "completed"
                            ? "bg-green-500"
                            : task.status === "in-progress"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }
                        text-white
                      `}
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>All customers and their project statuses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {customers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-muted mb-4">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No customers yet</h3>
                  <p className="text-muted-foreground mt-2">Customer accounts will appear here once created</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
                    <div>Customer</div>
                    <div>Company</div>
                    <div>Projects</div>
                    <div>Subscription</div>
                    <div>Status</div>
                  </div>
                  {customers.map((customer) => (
                    <div key={customer.id} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt="Customer avatar" />
                          <AvatarFallback>
                            {customer.first_name?.[0] || ""}
                            {customer.last_name?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {customer.first_name} {customer.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">{customer.email}</div>
                        </div>
                      </div>
                      <div>{customer.company_name || "—"}</div>
                      <div>{0}</div>
                      <div className="capitalize">{customer.subscription_tier || "Standard"}</div>
                      <div>
                        <Badge className="bg-green-500 text-white">Active</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
