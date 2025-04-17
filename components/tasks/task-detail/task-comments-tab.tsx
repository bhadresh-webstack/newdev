"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare } from "lucide-react"
import { motion } from "framer-motion"

interface Comment {
  id: string
  author: string
  content: string
  created_at: string
  author_avatar: string | null
}

interface TaskCommentsTabProps {
  comments: Comment[]
  setComments: (comments: Comment[]) => void
  getInitials: (name: string) => string
  formatRelativeTime: (dateString: string) => string
}

export function TaskCommentsTab({ comments, setComments, getInitials, formatRelativeTime }: TaskCommentsTabProps) {
  const [newComment, setNewComment] = useState("")

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const newCommentObj: Comment = {
      id: `comment-${Date.now()}`,
      author: "You",
      content: newComment,
      created_at: new Date().toISOString(),
      author_avatar: null,
    }

    setComments([...comments, newCommentObj])
    setNewComment("")
  }

  return (
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
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_at)}</p>
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
  )
}
