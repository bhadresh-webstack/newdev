"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  FolderKanban,
  CheckCircle,
  Clock,
  Circle,
  MessageSquare,
  FileText,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Calendar,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { demoProjects, demoTasks } from "@/lib/data-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

// Task status icons and colors
const statusIcons = {
  Pending: <Circle className="h-4 w-4 text-slate-500" />,
  "In Progress": <Clock className="h-4 w-4 text-blue-500" />,
  Completed: <CheckCircle className="h-4 w-4 text-green-500" />,
}

const statusColors = {
  Pending: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState(demoProjects.find((p) => p.project_id === projectId))
  const [projectTasks, setProjectTasks] = useState(demoTasks.filter((t) => t.project.id === projectId))

  const [userRole, setUserRole] = useState<"admin" | "team" | "customer" | "user">("user")

  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: "Alex Johnson", role: "Project Manager", image: null },
    { id: 2, name: "Sarah Miller", role: "UI/UX Designer", image: null },
    { id: 3, name: "David Chen", role: "Frontend Developer", image: null },
  ])
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMember, setNewMember] = useState({ name: "", role: "", email: "" })

  // Simulate fetching user role - in a real app, this would come from your auth system
  useEffect(() => {
    // This is a placeholder - replace with your actual auth logic
    // For example: setUserRole(authStore.user?.role || 'user')
    const simulatedRole = localStorage.getItem("userRole") || "user"
    setUserRole(simulatedRole as any)
  }, [])

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Navigate to task details
  const handleTaskClick = (taskId: string) => {
    router.push(`/app/tasks/${taskId}`)
  }

  const handleAddMember = () => {
    if (!newMember.name || !newMember.role) return

    const newId = teamMembers.length > 0 ? Math.max(...teamMembers.map((m) => m.id)) + 1 : 1

    setTeamMembers([
      ...teamMembers,
      {
        id: newId,
        name: newMember.name,
        role: newMember.role,
        image: null,
      },
    ])

    // Reset form
    setNewMember({ name: "", role: "", email: "" })
    setIsAddingMember(false)
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted rounded-md w-1/3"></div>
          <div className="h-10 bg-muted rounded-md w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-muted rounded-lg md:col-span-2"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
        <div className="h-10 bg-muted rounded-md w-64"></div>
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-semibold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/app/projects")}>Back to Projects</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/app/projects")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">{project.project_title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => router.push(`/app/projects/${projectId}/edit`)}>
            <Edit className="h-4 w-4" />
            Edit Project
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Project Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={fadeInUp} className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>Track progress and manage tasks for {project.project_title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">{project.progress_percentage}%</span>
                </div>
                <Progress value={project.progress_percentage} className="h-3" />
              </div>

              {/* Only show detailed stats to team members and admins */}
              {(userRole === "admin" || userRole === "team") && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                        <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Tasks</p>
                        <p className="text-2xl font-semibold">{project.total_tasks}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-2xl font-semibold">{project.completed_tasks}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">In Progress</p>
                        <p className="text-2xl font-semibold">{project.total_tasks - project.completed_tasks}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  className={
                    project.progress_percentage >= 100
                      ? statusColors["Completed"]
                      : project.progress_percentage > 0
                        ? statusColors["In Progress"]
                        : statusColors["Pending"]
                  }
                >
                  {project.progress_percentage >= 100
                    ? "Completed"
                    : project.progress_percentage > 0
                      ? "In Progress"
                      : "Planning"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">March 10, 2023</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">March 25, 2023</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">Acme Corporation</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pricing Tier</p>
                <p className="font-medium">Standard</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Tabs defaultValue={userRole === "customer" ? "messages" : "tasks"} className="w-full">
        <TabsList className={`grid ${userRole === "customer" ? "grid-cols-2" : "grid-cols-4"} w-full max-w-md`}>
          {(userRole === "admin" || userRole === "team") && (
            <>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Team
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Files
          </TabsTrigger>
        </TabsList>

        {(userRole === "admin" || userRole === "team") && (
          <TabsContent value="tasks" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Project Tasks</h2>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
              {projectTasks.length > 0 ? (
                projectTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    variants={fadeInUp}
                    onClick={() => handleTaskClick(task.id)}
                    className="cursor-pointer"
                  >
                    <Card className="hover:shadow-md transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {statusIcons[task.status] || <Circle className="h-4 w-4 text-slate-500" />}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{task.title}</CardTitle>
                              <CardDescription className="mt-1 line-clamp-2">{task.description}</CardDescription>
                            </div>
                          </div>
                          <Badge className={statusColors[task.status] || "bg-slate-100 text-slate-800"}>
                            {task.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardFooter className="flex justify-between pt-4 border-t mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Updated {formatDate(task.updated_at)}</span>
                        </div>
                        {task.assigned_to_profile && (
                          <div className="flex items-center gap-2">
                            <p className="text-sm">Assigned to:</p>
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={task.assigned_to_profile.profile_image || undefined}
                                alt={`${task.assigned_to_profile.first_name} ${task.assigned_to_profile.last_name}`}
                              />
                              <AvatarFallback>
                                {getInitials(
                                  `${task.assigned_to_profile.first_name} ${task.assigned_to_profile.last_name}`,
                                )}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <CheckCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      This project doesn't have any tasks yet. Create your first task to get started.
                    </p>
                    <Button className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Add Task
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>
        )}

        {(userRole === "admin" || userRole === "team") && (
          <TabsContent value="team" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Team Members</h2>
              <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Add a new team member to this project. They will have access to project resources.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        className="col-span-3"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        className="col-span-3"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">
                        Role
                      </Label>
                      <Select
                        value={newMember.role}
                        onValueChange={(value) => setNewMember({ ...newMember, role: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Project Manager">Project Manager</SelectItem>
                          <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                          <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                          <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                          <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                          <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleAddMember}>
                      Add to Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.image || undefined} alt={member.name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="messages" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Project Messages</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Message
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  {
                    sender: "Alex Johnson",
                    message:
                      "I've updated the homepage design based on client feedback. Please review when you get a chance.",
                    time: "2 days ago",
                  },
                  {
                    sender: "Sarah Miller",
                    message: "The new color scheme looks great! I've made some minor adjustments to the spacing.",
                    time: "1 day ago",
                  },
                ].map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                        {getInitials(message.sender)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{message.sender}</p>
                        <p className="text-xs text-muted-foreground">{message.time}</p>
                      </div>
                      <p className="text-sm mt-1">{message.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                      {getInitials("You")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      className="w-full p-2 rounded-md border min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Type your message here..."
                    ></textarea>
                    <div className="flex justify-end mt-2">
                      <Button>Send Message</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Project Files</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Upload File
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Homepage Design.fig", type: "Design", size: "2.4 MB", date: "Mar 15, 2023" },
                  { name: "Project Requirements.pdf", type: "Document", size: "1.2 MB", date: "Mar 10, 2023" },
                  { name: "Logo Assets.zip", type: "Archive", size: "4.7 MB", date: "Mar 12, 2023" },
                ].map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-primary/10">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <span>{file.type}</span>
                              <span className="mx-2">•</span>
                              <span>{file.size}</span>
                              <span className="mx-2">•</span>
                              <span>{file.date}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 border rounded-md bg-muted/20">
        <p className="text-sm font-medium mb-2">Current role: {userRole}</p>
        <div className="flex gap-2">
          <Button size="sm" variant={userRole === "admin" ? "default" : "outline"} onClick={() => switchRole("admin")}>
            Admin
          </Button>
          <Button size="sm" variant={userRole === "team" ? "default" : "outline"} onClick={() => switchRole("team")}>
            Team
          </Button>
          <Button
            size="sm"
            variant={userRole === "customer" ? "default" : "outline"}
            onClick={() => switchRole("customer")}
          >
            Customer
          </Button>
          <Button size="sm" variant={userRole === "user" ? "default" : "outline"} onClick={() => switchRole("user")}>
            User
          </Button>
        </div>
      </div>
    </div>
  )
}

// Add this function at the bottom of the component, before the final return statement
const switchRole = (role: "admin" | "team" | "customer" | "user") => {
  localStorage.setItem("userRole", role)
  setUserRole(role)
}

