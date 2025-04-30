"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { format, isToday, isYesterday } from "date-fns"
import { Search, Send, Paperclip, Smile, MoreVertical, Info, ChevronLeft, Check, CheckCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
      if (!message || message.type === "connection" || !message.message) {
        return
      }

      setMessages((prev) => {
        if (isReplacement) {
          // Replace temporary message with real one
          return prev.map((msg) =>
            msg.id === message.id ||
            (msg.id.toString().startsWith("temp-") &&
              msg.sender_id === message.sender_id &&
              msg.message === message.message)
              ? message
              : msg,
          )
        } else {
          // Check if message already exists
          const exists = prev.some((m) => m.id === message.id)
          if (exists) return prev
          return [...prev, message]
        }
      })

      // Scroll to bottom when new message arrives
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
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
    if (isToday(date)) {
      return format(date, "h:mm a")
    } else if (isYesterday(date)) {
      return "Yesterday"
    } else {
      return format(date, "MMM d")
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups: Record<string, Message[]>, message) => {
    const date = new Date(message.created_at).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation || !user?.id) return

    // Create temporary message ID
    const tempId = `temp-${Date.now()}`

    // Add temporary message to UI
    const tempMessage: Message = {
      id: tempId,
      project_id: activeConversation,
      sender_id: user.id,
      receiver_id: "", // Will be set by the server
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

    // Add to messages
    setMessages((prev) => [...prev, tempMessage])

    // Clear input
    setNewMessage("")

    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })

    // Send message to server
    try {
      // Find a receiver (first participant that's not the current user)
      const activeConversationData = conversations.find((conv) => conv.id === activeConversation)
      const receiver = activeConversationData?.participants.find((p) => p.id !== user.id)
      const receiverId = receiver?.id || ""

      const result = await sendMessageToServer(activeConversation, newMessage, user.id, receiverId)

      if (!result.success) {
        // Mark message as failed
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, sendFailed: true } : msg)))

        toast({
          title: "Failed to send message",
          description: "Please try again",
          variant: "destructive",
        })
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

  // Function to render message status indicators
  const renderMessageStatus = (message: Message) => {
    if (message.sendFailed) {
      return <span className="text-xs text-red-500">Failed</span>
    }

    if (message.isTemp) {
      return <Check className="h-3 w-3" />
    }

    return <CheckCheck className="h-3 w-3" />
  }

  // Get active conversation data
  const activeConversationData = conversations.find((conv) => conv.id === activeConversation)

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-lg border bg-background">
        <div className="text-center">
          <h2 className="text-xl font-medium">Please sign in</h2>
          <p className="text-muted-foreground">You need to be signed in to view messages</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-lg border bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] max-h-[800px] overflow-hidden rounded-lg border bg-background">
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
          <div className="flex-1 overflow-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                    activeConversation === conversation.id && "bg-muted",
                  )}
                  onClick={() => setActiveConversation(conversation.id)}
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
                        {conversation.last_message.isTemp && <span className="text-xs italic ml-1">(sending...)</span>}
                        {conversation.last_message.sendFailed && (
                          <span className="text-xs text-red-500 italic ml-1">(failed)</span>
                        )}
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
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {activeConversationData ? (
          <>
            {/* Chat Header - Fixed */}
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
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Project Info</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>More</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Messages - Using ScrollArea for proper scrolling */}
            <ScrollArea className="flex-1 h-[calc(100%-8rem)]">
              <div className="p-3">
                {Object.entries(groupedMessages).length > 0 ? (
                  Object.entries(groupedMessages).map(([date, dateMessages]) => (
                    <div key={date} className="space-y-4">
                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t"></div>
                        <span className="mx-4 flex-shrink text-xs text-muted-foreground">
                          {isToday(new Date(date))
                            ? "Today"
                            : isYesterday(new Date(date))
                              ? "Yesterday"
                              : format(new Date(date), "MMMM d, yyyy")}
                        </span>
                        <div className="flex-grow border-t"></div>
                      </div>
                      <div className="space-y-4">
                        {dateMessages.map((message) => (
                          <div
                            key={message.id}
                            className={cn("flex", message.sender_id === user.id ? "justify-end" : "justify-start")}
                          >
                            <div
                              className={cn(
                                "max-w-[75%] rounded-lg px-4 py-2",
                                message.sender_id === user.id ? "bg-primary text-primary-foreground" : "bg-muted",
                                message.isTemp && "opacity-70",
                                message.sendFailed && "border border-red-500",
                              )}
                            >
                              {message.message}
                              <div
                                className={cn(
                                  "mt-1 flex justify-end gap-1",
                                  message.sender_id === user.id
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground",
                                )}
                              >
                                <span className="text-xs">{format(new Date(message.created_at), "h:mm a")}</span>
                                {message.sender_id === user.id && renderMessageStatus(message)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full py-10">
                    <div className="text-center">
                      <p className="text-muted-foreground">No messages yet</p>
                      <p className="text-sm text-muted-foreground">Start the conversation by sending a message</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input - Fixed */}
            <div className="border-t p-2 shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="icon">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
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
