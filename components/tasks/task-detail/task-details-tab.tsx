"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/stores/tasks-store"
import type { TeamMember } from "../task-detail-sheet"

interface TaskDetailsTabProps {
  isEditMode: boolean
  localTask: Task
  editedTask: Task | null
  setEditedTask: (task: Task | null) => void
  handleCancelEdit: () => void
  handleSaveEdit: () => void
  teamMembers?: TeamMember[]
  isLoadingTeamMembers: boolean
  getInitials: (name: string) => string
}

export function TaskDetailsTab({
  isEditMode,
  localTask,
  editedTask,
  setEditedTask,
  handleCancelEdit,
  handleSaveEdit,
  teamMembers,
  isLoadingTeamMembers,
  getInitials,
}: TaskDetailsTabProps) {
  if (isEditMode) {
    return (
      <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border p-5 shadow-sm space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Task Title</Label>
          <Input
            id="title"
            value={editedTask?.title || ""}
            onChange={(e) => {
              if (editedTask) {
                setEditedTask({
                  ...editedTask,
                  title: e.target.value,
                })
              }
            }}
            placeholder="Enter task title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={editedTask?.description || ""}
            onChange={(e) => {
              if (editedTask) {
                setEditedTask({
                  ...editedTask,
                  description: e.target.value,
                })
              }
            }}
            placeholder="Enter task description"
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={editedTask?.priority || ""}
              onValueChange={(value) => {
                if (editedTask) {
                  setEditedTask({
                    ...editedTask,
                    priority: value,
                  })
                }
              }}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task_group">Group</Label>
            <Select
              value={editedTask?.task_group || ""}
              onValueChange={(value) => {
                if (editedTask) {
                  setEditedTask({
                    ...editedTask,
                    task_group: value,
                  })
                }
              }}
            >
              <SelectTrigger id="task_group">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Backlog">Backlog</SelectItem>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assign To</Label>
            <Select
              value={editedTask?.assigned_to || ""}
              onValueChange={(value) => {
                if (editedTask) {
                  setEditedTask({
                    ...editedTask,
                    assigned_to: value,
                  })
                }
              }}
            >
              <SelectTrigger id="assigned_to" disabled={isLoadingTeamMembers}>
                <SelectValue placeholder={isLoadingTeamMembers ? "Loading team members..." : "Select team member"} />
              </SelectTrigger>
              <SelectContent>
                {teamMembers && teamMembers?.length > 0 ? (
                  teamMembers?.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.profile_image || undefined} alt={member.user_name} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                            {getInitials(member.user_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.user_name}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-members">No team members available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !editedTask?.due_date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editedTask?.due_date ? format(new Date(editedTask.due_date), "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={editedTask?.due_date ? new Date(editedTask.due_date) : undefined}
                  onSelect={(date) => {
                    if (editedTask) {
                      setEditedTask({
                        ...editedTask,
                        due_date: date?.toISOString() || null,
                      })
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancelEdit}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit}>Save Changes</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border p-5 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-foreground whitespace-pre-line">{localTask.description}</p>
      </div>
    </div>
  )
}
