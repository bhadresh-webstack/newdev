"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Clock,
  User,
  MessageSquare,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { demoTasks, demoProjects } from "@/lib/demo-data"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

// Task status icons and colors
const statusIcons = {
  Pending: <Circle className="h-5 w-5 text-slate-500" />,
  "In Progress": <Clock className="h-5 w-5 text-blue-500" />,
  Completed: <CheckCircle className="h-5 w-5 text-green-500" />,
}

const statusColors = {
  Pending: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string

  const [loading, setLoading] = useState(true)
  const [task, setTask] = useState(demoTasks.find((t) => t.id === taskId))
  const [project, setProject] = useState(null)
  const [comments, setComments] = useState([
    {
      id: "comment-1",
      author: "Alex Johnson",
      content: "I've started working on this task. Should be completed by tomorrow.",
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      author_avatar: null,
    },
    {
      id: "comment-2",
      author: "Sarah Miller",
      content: "Let me know if you need any design assets for this.",
      created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      author_avatar: null,
    },
  ])
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      if (task) {
        const projectData = demoProjects.find((p) => p.project_id === task.project.id)
        setProject(projectData)
      }
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [task])

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

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

    return formatDate(dateString)
  }

  // Handle status change
  const handleStatusChange = (newStatus) => {
    setTask((prev) => {
      if (!prev) return prev
      return { ...prev, status: newStatus }
    })
  }

  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const newCommentObj = {
      id: `comment-${Date.now()}`,
      author: "You",
      content: newComment,
      created_at: new Date().toISOString(),
      author_avatar: null,
    }

    setComments((prev) => [...prev, newCommentObj])
    setNewComment("")
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

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-semibold mb-2">Task Not Found</h2>
        <p className="text-muted-foreground mb-4">The task you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
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
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
            {project && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Project:</span>
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium flex items-center gap-1"
                  onClick={() => router.push(`/app/projects/${task.project.id}`)}
                >
                  {task.project.title}
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <div className="flex items-center gap-2">
                  {statusIcons[task.status]}
                  <span>{task.status}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange("Pending")}>
                <Circle className="mr-2 h-4 w-4 text-slate-500" />
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("In Progress")}>
                <Clock className="mr-2 h-4 w-4 text-blue-500" />
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("Completed")}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">{task.description}</p>
            </CardContent>
          </Card>

          <Tabs defaultValue="comments" className="w-full">
            <TabsList>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments ({comments.length})
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={!newComment.trim()}>
                        Post Comment
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.author_avatar || undefined} alt={comment.author} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                            {getInitials(comment.author)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{comment.author}</p>
                            <p className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_at)}</p>
                          </div>
                          <p className="text-sm mt-2 whitespace-pre-line">{comment.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No comments yet</p>
                  <p className="text-sm">Be the first to comment on this task</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-none">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Sarah Miller</span> changed the status to{" "}
                          <Badge className={statusColors["In Progress"]}>In Progress</Badge>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Yesterday at 2:30 PM</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-none">
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Alex Johnson</span> assigned this task to{" "}
                          <span className="font-medium">Sarah Miller</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-none">
                        <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Alex Johnson</span> created this task
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(task.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={statusColors[task.status]}>{task.status}</Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Assigned To</p>
                {task.assigned_to_profile ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={task.assigned_to_profile.profile_image || undefined}
                        alt={`${task.assigned_to_profile.first_name} ${task.assigned_to_profile.last_name}`}
                      />
                      <AvatarFallback>
                        {getInitials(`${task.assigned_to_profile.first_name} ${task.assigned_to_profile.last_name}`)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {task.assigned_to_profile.first_name} {task.assigned_to_profile.last_name}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm italic">Unassigned</p>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(task.created_at)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formatDate(task.updated_at)}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Project</p>
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium flex items-center gap-1"
                  onClick={() => router.push(`/app/projects/${task.project.id}`)}
                >
                  {task.project.title}
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>

              {task.task_group && (
                <div>
                  <p className="text-sm text-muted-foreground">Group</p>
                  <Badge variant="outline" className="mt-1">
                    {task.task_group}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {demoTasks
                .filter((t) => t.project.id === task.project.id && t.id !== task.id)
                .slice(0, 3)
                .map((relatedTask, index) => (
                  <div
                    key={relatedTask.id}
                    className="flex items-start gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
                    onClick={() => router.push(`/app/tasks/${relatedTask.id}`)}
                  >
                    <div className="mt-0.5">
                      {statusIcons[relatedTask.status] || <Circle className="h-4 w-4 text-slate-500" />}
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">{relatedTask.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{relatedTask.description}</p>
                    </div>
                  </div>
                ))}

              {demoTasks.filter((t) => t.project.id === task.project.id && t.id !== task.id).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No related tasks found</p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => router.push(`/app/projects/${task.project.id}`)}
              >
                View All Project Tasks
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

