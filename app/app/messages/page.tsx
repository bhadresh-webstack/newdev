"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { MessageSquare, Search, Send, ChevronLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useProjectsStore } from "@/lib/stores/projects-store"
import type { Message } from "@/lib/types"
import {
  addMessageListener,
  initializeProjectConnection,
  closeProjectConnection,
  sendMessage as sendMessageToServer,
} from "@/lib/socket"
import { toast } from "@/hooks/use-toast"

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { projects, fetchProjects, fetchProjectMessages } = useProjectsStore()

  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)
  const [showConversationList, setShowConversationList] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setShowConversationList(true)
      }
    }

    handleResize() // Initial check
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Load projects as conversations
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true)
      await fetchProjects()
      setIsLoading(false)
    }

    if (user) {
      loadProjects()
    }
  }, [user, fetchProjects])

  // Transform projects into conversations
  useEffect(() => {
    if (projects.length > 0) {
      const projectConversations = projects.map((project) => ({
        id: project.id,
        title: project.title,
        is_group: true,
        project_title: project.title,
        participants: [
          ...(project.customer
            ? [
                {
                  id: project.customer.id,
                  first_name: project.customer.user_name.split(" ")[0] || "",
                  last_name: project.customer.user_name.split(" ")[1] || "",
                  profile_image: project.customer.profile_image,
                  online: false,
                },
              ]
            : []),
          // Add team members if available
          ...(project.teamMembers || []).map((member) => ({
            id: member.id,
            first_name: member.user_name?.split(" ")[0] || "",
            last_name: member.user_name?.split(" ")[1] || "",
            profile_image: member.profile_image,
            online: false,
          })),
        ],
        unread_count: 0,
        last_message: null,
      }))

      setConversations(projectConversations)

      // Set active conversation from URL or first project
      const projectId = searchParams.get("id")
      if (projectId && projects.some((p) => p.id === projectId)) {
        setActiveConversation(projectId)
      } else if (projectConversations.length > 0 && !activeConversation) {
        setActiveConversation(projectConversations[0].id)
      }
    }
  }, [projects, searchParams, activeConversation])

  // Handle real-time message updates
  useEffect(() => {
    if (!activeConversation || !user?.id) return

    // Load initial messages
    const loadMessages = async () => {
      setIsLoading(true)
      const { data, error } = await fetchProjectMessages(activeConversation)

      if (error) {
        toast({
          title: "Error loading messages",
          description: error,
          variant: "destructive",
        })
      } else if (data) {
        setMessages(data)
      }

      setIsLoading(false)
    }

    loadMessages()

    // Initialize SSE connection
    initializeProjectConnection(activeConversation, user.id)

    // Add message listener
    const handleNewMessage = (message: Message, isReplacement = false) => {
      console.log("New message received:", message, isReplacement ? "(replacement)" : "")

      if (isReplacement) {
        // Replace temporary message with real one
        setMessages((prev) =>
          prev.map((msg) => {
            // Check if this is a temp message that should be replaced
            if (msg.isTemp && msg.sender_id === message.sender_id && msg.message === message.message) {
              return { ...message, isTemp: false }
            }
            return msg
          }),
        )
      } else {
        // Add new message if it doesn't already exist
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some((m) => m.id === message.id)
          if (exists) return prev
          return [...prev, message]
        })

        // Update last message in conversation
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === activeConversation) {
              return {
                ...conv,
                last_message: {
                  content: message.message,
                  created_at: message.created_at,
                  sender_id: message.sender_id,
                },
              }
            }
            return conv
          }),
        )
      }
    }

    addMessageListener(activeConversation, handleNewMessage)

    // Cleanup
    return () => {
      closeProjectConnection(activeConversation)
    }
  }, [activeConversation, user?.id, fetchProjectMessages])

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) => {
    const participantNames = conv.participants
      .map((p: any) => `${p.first_name} ${p.last_name}`)
      .join(" ")
      .toLowerCase()

    const title = conv.title.toLowerCase()
    const query = searchQuery.toLowerCase()

    return participantNames.includes(query) || title.includes(query)
  })

  // Get conversation title
  const getConversationTitle = (conversation: any) => {
    if (conversation.title) return conversation.title

    return conversation.participants.map((p: any) => `${p.first_name} ${p.last_name}`).join(", ")
  }

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return format(date, "h:mm a")
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

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation || !user?.id) return

    // Create temporary message ID
    const tempId = `temp-${Date.now()}`

    // Find a receiver based on user role
    const activeConversationData = conversations.find((conv) => conv.id === activeConversation)
    let receiverId = ""

    if (user.role === "customer") {
      // If user is a customer, send to admin/team members
      // Find the first non-customer participant (admin or team member)
      const adminOrTeamMember = activeConversationData?.participants.find(
        (p) => p.id !== user.id && p.role !== "customer",
      )

      // If no specific admin/team member found, use a default admin ID or project ID
      receiverId = adminOrTeamMember?.id || activeConversation
    } else {
      // If user is admin or team member, send to the customer
      const customer = activeConversationData?.participants.find((p) => p.role === "customer" || p.id !== user.id)
      receiverId = customer?.id || activeConversationData?.participants[0]?.id || ""
    }

    // If still no receiver, use the project ID as a fallback
    if (!receiverId) {
      receiverId = activeConversation
      console.log("Using project ID as receiver:", receiverId)
    }

    // Add temporary message to UI
    const tempMessage: Message = {
      id: tempId,
      project_id: activeConversation,
      sender_id: user.id,
      receiver_id: receiverId,
      message: newMessage,
      created_at: new Date().toISOString(),
      isTemp: true,
      sender: {
        id: user.id,
        user_name: user.user_name || "You",
        profile_image: user.profile_image,
        role: user.role,
      },
    }

    // Store the message text before clearing the input
    const messageText = newMessage

    // Add to messages for immediate display
    setMessages((prev) => [...prev, tempMessage])

    // Clear input immediately for better UX
    setNewMessage("")

    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })

    // Send message to server
    try {
      console.log("Sending message to:", receiverId)
      const result = await sendMessageToServer(activeConversation, messageText, user.id, receiverId)

      if (!result.success) {
        // Mark message as failed
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, sendFailed: true } : msg)))

        toast({
          title: "Failed to send message",
          description: "Please try again",
          variant: "destructive",
        })
      } else if (result.data) {
        // Replace the temporary message with the real one
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...result.data, isTemp: false } : msg)))
      }
    } catch (error) {
      console.error("Error sending message:", error)

      // Mark message as failed
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, sendFailed: true } : msg)))

      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  // Get active conversation data
  const activeConversationData = conversations.find((conv) => conv.id === activeConversation)

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center rounded-lg border bg-background">
        <div className="text-center">
          <h2 className="text-xl font-medium">Please sign in</h2>
          <p className="text-muted-foreground">You need to be signed in to view messages</p>
        </div>
      </div>
    )
  }

  if (isLoading && !activeConversation) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center rounded-lg border bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-lg border bg-background">
      {/* Conversation List */}
      {showConversationList && (
        <div className="w-full md:w-80 border-r flex flex-col h-full">
          <div className="p-4 border-b shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                    activeConversation === conversation.id && "bg-muted",
                  )}
                  onClick={() => {
                    setActiveConversation(conversation.id)
                    if (isMobileView) {
                      setShowConversationList(false)
                    }
                  }}
                >
                  {conversation.is_group ? (
                    <div className="relative flex -space-x-2">
                      {conversation.participants.slice(0, 3).map((participant: any, i: number) => (
                        <div
                          key={participant.id}
                          className="relative h-10 w-10 rounded-full border-2 border-background overflow-hidden"
                          style={{ zIndex: 3 - i }}
                        >
                          <Image
                            src={
                              participant.profile_image ||
                              `/placeholder.svg?height=40&width=40&query=user ${participant.first_name || "/placeholder.svg"}`
                            }
                            alt={`${participant.first_name} ${participant.last_name}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative h-10 w-10 rounded-full overflow-hidden">
                      <Image
                        src={
                          conversation.participants[0]?.profile_image ||
                          `/placeholder.svg?height=40&width=40&query=user ${conversation.participants[0]?.first_name || "/placeholder.svg"}`
                        }
                        alt={`${conversation.participants[0]?.first_name} ${conversation.participants[0]?.last_name}`}
                        fill
                        className="object-cover"
                      />
                      {conversation.participants[0]?.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{getConversationTitle(conversation)}</h3>
                      {conversation.last_message && (
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(conversation.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    {conversation.project_title && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs font-normal">
                          {conversation.project_title}
                        </Badge>
                      </div>
                    )}
                    {conversation.last_message && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {conversation.last_message.sender_id === user.id ? (
                          <span className="text-muted-foreground">You: </span>
                        ) : (
                          ""
                        )}
                        {conversation.last_message.content}
                      </p>
                    )}
                    {conversation.unread_count > 0 && (
                      <div className="mt-1">
                        <Badge className="text-xs">{conversation.unread_count}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">No conversations found</div>
            )}
          </ScrollArea>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {activeConversationData ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConversationList(true)}
                    className="md:hidden"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
                {activeConversationData.is_group ? (
                  <div className="relative flex -space-x-2">
                    {activeConversationData.participants.slice(0, 3).map((participant: any, i: number) => (
                      <div
                        key={participant.id}
                        className="relative h-10 w-10 rounded-full border-2 border-background overflow-hidden"
                        style={{ zIndex: 3 - i }}
                      >
                        <Image
                          src={
                            participant.profile_image ||
                            `/placeholder.svg?height=40&width=40&query=user ${participant.first_name || "/placeholder.svg"}`
                          }
                          alt={`${participant.first_name} ${participant.last_name}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Image
                      src={
                        activeConversationData.participants[0]?.profile_image ||
                        `/placeholder.svg?height=40&width=40&query=user ${activeConversationData.participants[0]?.first_name || "/placeholder.svg"}`
                      }
                      alt={`${activeConversationData.participants[0]?.first_name} ${activeConversationData.participants[0]?.last_name}`}
                      fill
                      className="object-cover"
                    />
                    {activeConversationData.participants[0]?.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>
                )}
                <div>
                  <h2 className="font-medium">{getConversationTitle(activeConversationData)}</h2>
                  {activeConversationData.is_group ? (
                    <p className="text-xs text-muted-foreground">
                      {activeConversationData.participants.length} members
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {activeConversationData.participants[0]?.online ? "Online" : "Offline"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-900/50" id="messages-container">
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
                              <AvatarImage src={user?.profile_image || undefined} alt={user?.user_name || "You"} />
                              <AvatarFallback className="bg-primary text-white text-xs">
                                {getInitials(user?.user_name || "You")}
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
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t bg-white dark:bg-slate-900 p-3">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={user?.profile_image || undefined} alt={user?.user_name || "You"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(user?.user_name || "You")}
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
                        if (newMessage.trim()) handleSendMessage(e)
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!newMessage.trim()}
                    className="h-7 w-7 absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary hover:bg-primary/90 text-white"
                  >
                    <Send className="h-4 w-4 rotate-45" />
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-medium">Select a conversation</h2>
              <p className="text-muted-foreground">Choose a project from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
