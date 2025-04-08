"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  CheckCircle,
  Circle,
  Clock,
  User,
  MessageSquare,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpRight,
  Calendar,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { demoProjects } from "@/lib/demo-data"
import { motion } from "framer-motion"

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

interface TaskDetailSheetProps {
  task: any
  isOpen: boolean
  onClose: () => void
  onStatusChange: (taskId: string, newStatus: string) => void
  relatedTasks: any[]
}

export function TaskDetailSheet({ task, isOpen, onClose, onStatusChange, relatedTasks = [] }: TaskDetailSheetProps) {
  const [project, setProject] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("comments")
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
    if (task) {
      const projectData = demoProjects.find((p) => p.project_id === task.project.id)
      setProject(projectData)
    }
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
  const handleStatusChange = (newStatus: string) => {
    if (task) {
      onStatusChange(task.id, newStatus)
    }
  }

  // Handle comment submission
  const handleCommentSubmit = (e: React.FormEvent) => {
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

  if (!task) return null

  // Priority badge styling
  const getPriorityBadge = (priority: string) => {
    const priorityStyles = {
      Low: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      Medium: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      High: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityStyles[priority as keyof typeof priorityStyles] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"}`}
      >
        {priority}
      </span>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto p-0">
        <div className="flex flex-col h-full">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 p-6 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">{statusIcons[task.status]}</div>
                <SheetTitle className="text-xl font-semibold tracking-tight">{task.title}</SheetTitle>
              </div>
            </div>

            {project && (
              <div className="flex items-center gap-2 text-muted-foreground ml-8">
                <span className="text-sm">Project:</span>
                <Button variant="link" className="p-0 h-auto text-sm font-medium flex items-center gap-1">
                  {task.project.title}
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-4 ml-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 bg-white/80 dark:bg-black/20 backdrop-blur-sm"
                  >
                    {statusIcons[task.status]}
                    <span>{task.status}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleStatusChange("Pending")} className="gap-2">
                    <Circle className="h-4 w-4 text-slate-500" />
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("In Progress")} className="gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("Completed")} className="gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Completed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {task.priority && getPriorityBadge(task.priority)}

              <div className="flex-grow"></div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <User className="h-4 w-4" />
                    Assign Task
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-grow overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Description card with subtle styling */}
              <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border p-5 shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-foreground whitespace-pre-line">{task.description}</p>
                </div>
              </div>

              {/* Two column layout for larger screens */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {/* Custom tabs with animated underline */}
                  <div className="border-b mb-4">
                    <div className="flex space-x-6">
                      <button
                        onClick={() => setActiveTab("comments")}
                        className={`relative pb-2 text-sm font-medium transition-colors ${
                          activeTab === "comments" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4" />
                          <span>Comments ({comments.length})</span>
                        </div>
                        {activeTab === "comments" && (
                          <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab("activity")}
                        className={`relative pb-2 text-sm font-medium transition-colors ${
                          activeTab === "activity" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>Activity</span>
                        </div>
                        {activeTab === "activity" && (
                          <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Comments tab content */}
                  {activeTab === "comments" && (
                    <div className="space-y-4">
                      <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border p-4 shadow-sm">
                        <form onSubmit={handleCommentSubmit} className="space-y-3">
                          <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[100px] resize-none bg-transparent border-muted"
                          />
                          <div className="flex justify-end">
                            <Button type="submit" disabled={!newComment.trim()} size="sm" className="gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5" />
                              Post Comment
                            </Button>
                          </div>
                        </form>
                      </div>

                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border p-4 shadow-sm"
                          >
                            <div className="flex gap-3">
                              <Avatar className="h-8 w-8 border">
                                <AvatarImage src={comment.author_avatar || undefined} alt={comment.author} />
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                                  {getInitials(comment.author)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">{comment.author}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatRelativeTime(comment.created_at)}
                                  </p>
                                </div>
                                <p className="text-sm whitespace-pre-line">{comment.content}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {comments.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border p-4">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="font-medium">No comments yet</p>
                            <p className="text-sm mt-1">Be the first to comment on this task</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Activity tab content */}
                  {activeTab === "activity" && (
                    <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border p-4 shadow-sm">
                      <div className="space-y-4">
                        {/* Activity timeline with connecting line */}
                        <div className="relative pl-6 border-l-2 border-muted pb-1">
                          <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
                          <div className="mb-1">
                            <p className="text-sm">
                              <span className="font-medium">Sarah Miller</span> changed the status to{" "}
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              >
                                In Progress
                              </Badge>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Yesterday at 2:30 PM</p>
                          </div>
                        </div>

                        <div className="relative pl-6 border-l-2 border-muted pb-1">
                          <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-1"></div>
                          <div className="mb-1">
                            <p className="text-sm">
                              <span className="font-medium">Alex Johnson</span> assigned this task to{" "}
                              <span className="font-medium">Sarah Miller</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                          </div>
                        </div>

                        <div className="relative pl-6 border-l-2 border-muted">
                          <div className="absolute w-3 h-3 bg-purple-500 rounded-full -left-[7px] top-1"></div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Alex Johnson</span> created this task
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{formatDate(task.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Task details sidebar */}
                <div className="space-y-4">
                  <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Task Details</h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <Badge className={`${statusColors[task.status]} px-2 py-0.5`}>{task.status}</Badge>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Priority</p>
                          {task.priority ? (
                            getPriorityBadge(task.priority)
                          ) : (
                            <span className="text-xs italic text-muted-foreground">Not set</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                        {task.assigned_to_profile ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 border">
                              <AvatarImage
                                src={task.assigned_to_profile.profile_image || undefined}
                                alt={`${task.assigned_to_profile.first_name} ${task.assigned_to_profile.last_name}`}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                                {getInitials(
                                  `${task.assigned_to_profile.first_name} ${task.assigned_to_profile.last_name}`,
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {task.assigned_to_profile.first_name} {task.assigned_to_profile.last_name}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs italic text-muted-foreground">Unassigned</p>
                        )}
                      </div>

                      <Separator className="my-2" />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Created</p>
                          <p className="text-sm">{formatDate(task.created_at)}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Updated</p>
                          <p className="text-sm">{formatDate(task.updated_at)}</p>
                        </div>
                      </div>

                      {task.due_date && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-sm">{formatDate(task.due_date)}</p>
                          </div>
                        </div>
                      )}

                      {task.task_group && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Group</p>
                          <Badge variant="outline" className="mt-1 font-normal">
                            {task.task_group}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Related tasks card */}
                  {relatedTasks.length > 0 && (
                    <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border p-4 shadow-sm">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Related Tasks</h3>

                      <div className="space-y-2">
                        {relatedTasks.slice(0, 3).map((relatedTask) => (
                          <div
                            key={relatedTask.id}
                            className="flex items-start gap-2 p-2 rounded-md transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer group"
                          >
                            <div className="mt-0.5 flex-shrink-0">
                              {statusIcons[relatedTask.status] || <Circle className="h-4 w-4 text-slate-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                {relatedTask.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{relatedTask.description}</p>
                            </div>
                          </div>
                        ))}

                        {relatedTasks.length > 3 && (
                          <Button variant="ghost" size="sm" className="w-full mt-1 text-xs h-7">
                            View all {relatedTasks.length} related tasks
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
