"use client"

import { MessageSquare } from "lucide-react"
import { useEffect } from "react"
import { motion } from "framer-motion"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Message } from "@/lib/types"

// Update the ProjectMessagesTab component props to include the project and user role
interface ProjectMessagesTabProps {
  messages: Message[]
  newMessage: string
  setNewMessage: (message: string) => void
  sendMessage: () => void
  user: any
  project?: any // Add project prop
}

export function ProjectMessagesTab({
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  user,
  project,
}: ProjectMessagesTabProps) {
  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]): { date: string; messages: Message[] }[] => {
    const groups: Record<string, Message[]> = {}

    messages.forEach((message) => {
      const date = new Date(message.created_at)
      const dateStr = date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      if (!groups[dateStr]) {
        groups[dateStr] = []
      }

      groups[dateStr].push(message)
    })

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }))
  }

  // Add this effect to scroll to the bottom when new messages arrive
  useEffect(() => {
    // Scroll to the bottom of the messages container when messages change
    const messagesContainer = document.getElementById("messages-container")
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }, [messages])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Project Messages</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Communicate with team members and clients</p>
        </div>
      </div>

      <Card className="border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="h-[450px] overflow-y-auto p-0 bg-slate-50/50 dark:bg-slate-900/50" id="messages-container">
            <div className="px-4 py-3">
              {messages.length > 0 ? (
                groupMessagesByDate(messages).map((group, groupIndex) => (
                  <div key={group.date} className="space-y-3 mb-6">
                    {/* Date header */}
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-slate-200/70 dark:bg-slate-800/70 px-3 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
                        {group.date}
                      </div>
                    </div>

                    {/* Messages for this date */}
                    {group.messages.map((message, index) => {
                      const isCurrentUser = message.sender?.id === user?.id
                      const isTemp = message.isTemp
                      const showSender = index === 0 || group.messages[index - 1]?.sender?.id !== message.sender?.id

                      return (
                        <motion.div
                          key={message.id || `${groupIndex}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className={`flex gap-2 ${isCurrentUser ? "justify-end" : "justify-start"} ${
                            !showSender && !isCurrentUser ? "pl-10" : ""
                          } ${!showSender && isCurrentUser ? "pr-10" : ""} mb-3`}
                        >
                          {!isCurrentUser && showSender && (
                            <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                              <AvatarImage
                                src={message.sender?.profile_image || undefined}
                                alt={message.sender?.user_name || "User"}
                              />
                              <AvatarFallback
                                className={`text-xs ${
                                  message.sender?.role === "admin" || message.sender?.role === "team_member"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                }`}
                              >
                                {getInitials(message.sender?.user_name || "User")}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {isCurrentUser && showSender && (
                            <Avatar className="h-8 w-8 mt-1 flex-shrink-0 order-2 ml-2">
                              <AvatarImage src={user?.profile_image || undefined} alt={user?.name || "You"} />
                              <AvatarFallback className="bg-primary text-white text-xs">
                                {getInitials(user?.name || "You")}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-[80%]`}>
                            {showSender && !isCurrentUser && (
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs font-medium">{message.sender?.user_name || "User"}</p>
                                {message.sender?.role && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                                  >
                                    {message.sender.role === "admin"
                                      ? "Admin"
                                      : message.sender.role === "team_member"
                                        ? "Team"
                                        : "Client"}
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div
                              className={`rounded-lg px-3 py-2 ${
                                isCurrentUser
                                  ? `bg-primary text-white dark:bg-primary dark:text-white ${
                                      isTemp ? "opacity-70" : ""
                                    }`
                                  : "bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <p
                                  className={`text-[10px] ${isCurrentUser ? "text-white/70" : "text-muted-foreground"}`}
                                >
                                  {new Date(message.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                {isTemp && (
                                  <span className="text-[10px] italic text-white/70">
                                    {isCurrentUser ? "sending..." : ""}
                                  </span>
                                )}
                                {message.sendFailed && (
                                  <span className="text-[10px] text-red-300 italic">failed to send</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <div className="rounded-full bg-primary/5 p-3 mb-3">
                    <MessageSquare className="h-6 w-6 text-primary/70" />
                  </div>
                  <h3 className="text-base font-medium mb-1">No messages yet</h3>
                  <p className="text-muted-foreground text-sm max-w-md mb-4">
                    Start the conversation with your team or client to discuss project details.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Message input area with styling */}
          <div className="border-t bg-white dark:bg-slate-900 p-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(user?.name || "You")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 pr-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/30 text-sm"
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      if (newMessage.trim()) sendMessage()
                    }
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="h-7 w-7 absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary hover:bg-primary/90 text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="rotate-45"
                  >
                    <path d="m5 12 14-9-9 14v-5H5Z" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
