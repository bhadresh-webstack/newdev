"use client"

import { useEffect, useState } from "react"
import { BarChart3, Clock, Layers, Loader2, Plus, Search, Users } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

export default function AdminDashboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real implementation, you would fetch actual data
        // For now, we'll simulate loading data
        setTimeout(() => {
          setProjects([
            { id: 1, title: "E-commerce Website", status: "in-development", customer: "Acme Inc.", progress: 65 },
            {
              id: 2,
              title: "Portfolio Redesign",
              status: "waiting-for-feedback",
              customer: "Jane Designer",
              progress: 80,
            },
            { id: 3, title: "Restaurant Website", status: "approved", customer: "Tasty Bites", progress: 95 },
          ])

          setTasks([
            { id: 1, title: "Fix navigation menu", status: "in-progress", priority: "high", assignee: "Alex Johnson" },
            { id: 2, title: "Implement payment gateway", status: "pending", priority: "high", assignee: "Unassigned" },
            { id: 3, title: "Design product page", status: "completed", priority: "medium", assignee: "Sarah Miller" },
          ])

          setCustomers([
            { id: 1, name: "John Smith", company: "Acme Inc.", projects: 2, subscription: "Premium" },
            { id: 2, name: "Jane Designer", company: "Self-employed", projects: 1, subscription: "Standard" },
            { id: 3, name: "Bob Restaurant", company: "Tasty Bites", projects: 1, subscription: "Premium" },
          ])

          setTeamMembers([
            { id: 1, name: "Alex Johnson", role: "Frontend Developer", active_projects: 3 },
            { id: 2, name: "Sarah Miller", role: "UI/UX Designer", active_projects: 2 },
            { id: 3, name: "David Chen", role: "Backend Developer", active_projects: 2 },
          ])

          setIsLoadingData(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [])

  if (isLoadingData) {
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
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete overview of all projects, teams, and customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/app/team")}>
            <Users className="mr-2 h-4 w-4" /> Manage Team
          </Button>
          <Button
            className="bg-gradient-to-r from-primary to-purple-600"
            onClick={() => router.push("/app/projects/new")}
          >
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              {projects.filter((p) => p.status === "approved" || p.status === "in-development").length} in active
              development
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter((t) => t.status !== "completed").length}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter((t) => t.priority === "high" && t.status !== "completed").length} high priority
            </p>
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
              {customers.filter((c) => c.subscription === "Premium").length} premium subscribers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {teamMembers.reduce((sum, member) => sum + member.active_projects, 0)} assigned projects
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search projects..." className="pl-8" />
            </div>
            <Button onClick={() => router.push("/app/projects/new")}>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
              <div>Project</div>
              <div>Customer</div>
              <div>Status</div>
              <div>Progress</div>
              <div>Actions</div>
            </div>

            {projects.map((project) => (
              <div key={project.id} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-muted/50">
                <div className="font-medium">{project.title}</div>
                <div>{project.customer}</div>
                <div>
                  <Badge
                    className={`
                    ${
                      project.status === "in-development"
                        ? "bg-blue-500"
                        : project.status === "waiting-for-feedback"
                          ? "bg-amber-500"
                          : project.status === "approved"
                            ? "bg-green-500"
                            : "bg-slate-500"
                    } 
                    text-white
                  `}
                  >
                    {project.status === "in-development"
                      ? "In Development"
                      : project.status === "waiting-for-feedback"
                        ? "Awaiting Feedback"
                        : project.status === "approved"
                          ? "Approved"
                          : project.status}
                  </Badge>
                </div>
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => router.push(`/app/projects/${project.id}`)}
                  >
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/app/projects/${project.id}/edit`)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={() => router.push("/app/projects")}>
              View All Projects
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Tasks</h2>
            <Button onClick={() => router.push("/app/tasks/new")}>
              <Plus className="mr-2 h-4 w-4" /> New Task
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
              <div>Task</div>
              <div>Assignee</div>
              <div>Status</div>
              <div>Priority</div>
              <div>Actions</div>
            </div>

            {tasks.map((task) => (
              <div key={task.id} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-muted/50">
                <div className="font-medium">{task.title}</div>
                <div>{task.assignee}</div>
                <div>
                  <Badge
                    className={`
                    ${
                      task.status === "completed"
                        ? "bg-green-500"
                        : task.status === "in-progress"
                          ? "bg-blue-500"
                          : "bg-amber-500"
                    } 
                    text-white
                  `}
                  >
                    {task.status === "in-progress"
                      ? "In Progress"
                      : task.status === "completed"
                        ? "Completed"
                        : "Pending"}
                  </Badge>
                </div>
                <div>
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
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => router.push(`/app/tasks/${task.id}`)}
                  >
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/app/tasks/${task.id}/edit`)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={() => router.push("/app/tasks")}>
              View All Tasks
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Customers</h2>
            <Button onClick={() => router.push("/app/customers/new")}>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
              <div>Customer</div>
              <div>Company</div>
              <div>Projects</div>
              <div>Subscription</div>
              <div>Actions</div>
            </div>

            {customers.map((customer) => (
              <div key={customer.id} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-muted/50">
                <div className="font-medium">{customer.name}</div>
                <div>{customer.company}</div>
                <div>{customer.projects}</div>
                <div>
                  <Badge
                    className={`
                    ${customer.subscription === "Premium" ? "bg-purple-500" : "bg-blue-500"} 
                    text-white
                  `}
                  >
                    {customer.subscription}
                  </Badge>
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => router.push(`/app/customers/${customer.id}`)}
                  >
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/app/customers/${customer.id}/edit`)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={() => router.push("/app/customers")}>
              View All Customers
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <Button onClick={() => router.push("/app/team/new")}>
              <Plus className="mr-2 h-4 w-4" /> Add Team Member
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
              <div>Name</div>
              <div>Role</div>
              <div>Active Projects</div>
              <div>Actions</div>
            </div>

            {teamMembers.map((member) => (
              <div key={member.id} className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-muted/50">
                <div className="font-medium">{member.name}</div>
                <div>{member.role}</div>
                <div>{member.active_projects}</div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => router.push(`/app/team/${member.id}`)}
                  >
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/app/team/${member.id}/edit`)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={() => router.push("/app/team")}>
              Manage Team
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Performance Analytics</h2>
            <div className="flex gap-2">
              <Button variant="outline">This Month</Button>
              <Button variant="outline">Export</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Completion Rate</CardTitle>
                <CardDescription>Average time to complete projects</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Analytics visualization would appear here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
                <CardDescription>Based on feedback and reviews</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Analytics visualization would appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={() => router.push("/app/analytics")}>
              View Detailed Analytics
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

