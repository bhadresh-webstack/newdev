"use client"

import { useEffect, useState } from "react"
import {
  BarChart3,
  Clock,
  FileEdit,
  Layers,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

export default function CustomerDashboard() {
  // Use static profile data instead of relying on external store
  const [profile, setProfile] = useState({
    id: "customer-1",
    first_name: "Customer",
    last_name: "User",
    email: "customer@gmail.com",
    subscription_tier: "premium",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      // Mock projects data
      setProjects([
        {
          id: "1",
          project_id: "1",
          title: "E-commerce Website",
          description: "A fully functional online store with product catalog and checkout",
          status: "in-development",
          progress_percentage: 65,
          total_tasks: 12,
          completed_tasks: 5,
          created_at: "2023-01-15T10:30:00Z",
          type: "ecommerce",
        },
        {
          id: "2",
          project_id: "2",
          title: "Portfolio Redesign",
          description: "Modern portfolio website with project showcase",
          status: "waiting-for-feedback",
          progress_percentage: 80,
          total_tasks: 8,
          completed_tasks: 6,
          created_at: "2023-02-20T14:45:00Z",
          type: "portfolio",
        },
      ])

      // Mock messages data
      setMessages([
        {
          id: 1,
          sender: "Alex Thompson",
          sender_role: "team_member",
          content:
            "I've updated the homepage design based on your feedback. Please check it out and let me know what you think!",
          created_at: "2023-06-15T10:30:00Z",
          read: false,
        },
        {
          id: 2,
          sender: "Sarah Johnson",
          sender_role: "team_member",
          content: "The contact form is now working. I've tested it and everything seems to be functioning correctly.",
          created_at: "2023-06-14T16:45:00Z",
          read: true,
        },
      ])

      setIsLoadingProjects(false)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile.first_name}</h1>
          <p className="text-muted-foreground">Here's an overview of your website projects and their current status.</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-purple-600">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 transition-all duration-200 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200">Total Projects</CardTitle>
            <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
              <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{projects.length}</div>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
              {projects.filter((p) => p.status === "hosted").length} live websites
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 transition-all duration-200 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200">In Development</CardTitle>
            <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-900/20">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {projects.filter((p) => p.status === "in-development" || p.status === "revision-in-progress").length}
            </div>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Projects currently being worked on</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 transition-all duration-200 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200">Awaiting Feedback</CardTitle>
            <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-900/20">
              <RefreshCw className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {projects.filter((p) => p.status === "waiting-for-feedback").length}
            </div>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Projects waiting for your review</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 transition-all duration-200 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200">Subscription</CardTitle>
            <div className="p-2 rounded-full bg-green-50 dark:bg-green-900/20">
              <Settings className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 capitalize">
              {profile.subscription_tier || "Standard"}
            </div>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
              {profile.subscription_tier === "premium"
                ? "Unlimited"
                : profile.subscription_tier === "standard"
                  ? "5"
                  : "2"}{" "}
              revisions per project
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingProjects ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : projects.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-muted mb-4">
                  <Layers className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No projects yet</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  You haven't created any projects yet. Start by creating your first website project.
                </p>
                <Button className="bg-gradient-to-r from-primary to-purple-600">
                  <Plus className="mr-2 h-4 w-4" /> Create Project
                </Button>
              </div>
            ) : (
              projects.map((project) => {
                const ProjectIcon = projectTypeIcons[project.type as keyof typeof projectTypeIcons] || Layers
                return (
                  <div key={project.id}>
                    <Card className="h-full overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
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
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Communication with your project team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-muted mb-4">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No messages yet</h3>
                  <p className="text-muted-foreground mt-2">Messages from your project team will appear here</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex gap-4 p-4 rounded-lg border">
                    <Avatar>
                      <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt="Avatar" />
                      <AvatarFallback>
                        {message.sender
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{message.sender}</h4>
                        {!message.read && (
                          <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{message.content}</p>
                      <p className="text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full">View All Messages</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Files</CardTitle>
              <CardDescription>Access and upload files related to your projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-muted mb-4">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No files yet</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Upload files related to your projects or view files shared by your team
                </p>
                <Button>
                  <Upload className="mr-2 h-4 w-4" /> Upload Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

