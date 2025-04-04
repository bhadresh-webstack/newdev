"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { format, isToday, isYesterday } from "date-fns"
import { Search, Send, Paperclip, Smile, MoreVertical, Info, ChevronLeft, Check, CheckCheck, File } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { currentUser, demoConversations, demoMessages } from "@/lib/data-utils"

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("id") || "conv-1"
  const [activeConversation, setActiveConversation] = useState(conversationId)
  const [conversations, setConversations] = useState(demoConversations)
  const [messages, setMessages] = useState(demoMessages[activeConversation] || [])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)
  const [showConversationList, setShowConversationList] = useState(true)
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

  // Handle conversation change
  useEffect(() => {
    if (activeConversation) {
      // Limit the number of messages to reduce scrolling
      const limitedMessages = demoMessages[activeConversation] ? [...demoMessages[activeConversation]].slice(-15) : []

      setMessages(limitedMessages)

      // Mark messages as read when conversation is opened
      const updatedConversations = conversations.map((conv) => {
        if (conv.id === activeConversation) {
          return { ...conv, unread_count: 0 }
        }
        return conv
      })
      setConversations(updatedConversations)

      // Update URL
      router.push(`/app/messages?id=${activeConversation}`, { scroll: false })

      // On mobile, hide conversation list when a conversation is selected
      if (isMobileView) {
        setShowConversationList(false)
      }
    }
  }, [activeConversation, router, isMobileView])

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) => {
    const participantNames = conv.participants
      .map((p) => `${p.first_name} ${p.last_name}`)
      .join(" ")
      .toLowerCase()

    const title = conv.title.toLowerCase()
    const query = searchQuery.toLowerCase()

    return participantNames.includes(query) || title.includes(query)
  })

  // Get conversation title
  const getConversationTitle = (conversation: (typeof conversations)[0]) => {
    if (conversation.title) return conversation.title

    return conversation.participants.map((p) => `${p.first_name} ${p.last_name}`).join(", ")
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
  const groupedMessages = messages.reduce((groups: Record<string, typeof messages>, message) => {
    const date = new Date(message.created_at).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const newMsg = {
      id: `msg-new-${Date.now()}`,
      conversation_id: activeConversation,
      sender_id: currentUser.id,
      content: newMessage,
      created_at: new Date().toISOString(),
      read: true,
    }

    // Update messages - keep only the last 15 messages to avoid excessive scrolling
    setMessages((prev) => {
      const updatedMessages = [...prev, newMsg]
      return updatedMessages.slice(-15)
    })

    // Update last message in conversation list
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === activeConversation) {
        return {
          ...conv,
          last_message: {
            content: newMessage,
            created_at: new Date().toISOString(),
            sender_id: currentUser.id,
          },
        }
      }
      return conv
    })
    setConversations(updatedConversations)

    // Clear input
    setNewMessage("")
  }

  // Get active conversation data
  const activeConversationData = conversations.find((conv) => conv.id === activeConversation)

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
            {filteredConversations.map((conversation) => (
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
                    {conversation.participants.slice(0, 3).map((participant, i) => (
                      <div
                        key={participant.id}
                        className="relative h-10 w-10 rounded-full border-2 border-background overflow-hidden"
                        style={{ zIndex: 3 - i }}
                      >
                        <Image
                          src={participant.profile_image || "/placeholder.svg?height=40&width=40"}
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
                      src={conversation.participants[0].profile_image || "/placeholder.svg?height=40&width=40"}
                      alt={`${conversation.participants[0].first_name} ${conversation.participants[0].last_name}`}
                      fill
                      className="object-cover"
                    />
                    {conversation.participants[0].online && (
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
                      {conversation.last_message.sender_id === currentUser.id ? (
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
            ))}
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
                    {activeConversationData.participants.slice(0, 3).map((participant, i) => (
                      <div
                        key={participant.id}
                        className="relative h-10 w-10 rounded-full border-2 border-background overflow-hidden"
                        style={{ zIndex: 3 - i }}
                      >
                        <Image
                          src={participant.profile_image || "/placeholder.svg?height=40&width=40"}
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
                        activeConversationData.participants[0].profile_image || "/placeholder.svg?height=40&width=40"
                      }
                      alt={`${activeConversationData.participants[0].first_name} ${activeConversationData.participants[0].last_name}`}
                      fill
                      className="object-cover"
                    />
                    {activeConversationData.participants[0].online && (
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
                      {activeConversationData.participants[0].online ? "Online" : "Offline"}
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
                    <TooltipContent>Info</TooltipContent>
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
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
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
                          className={cn("flex", message.sender_id === currentUser.id ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[75%] rounded-lg px-4 py-2",
                              message.sender_id === currentUser.id ? "bg-primary text-primary-foreground" : "bg-muted",
                            )}
                          >
                            {message.content}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment) => (
                                  <div
                                    key={attachment.id}
                                    className="flex items-center gap-2 rounded-md bg-background/10 p-2"
                                  >
                                    <File className="h-4 w-4" />
                                    <span className="text-sm flex-1 truncate">{attachment.name}</span>
                                    {attachment.size && <span className="text-xs">{attachment.size}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div
                              className={cn(
                                "mt-1 flex justify-end gap-1",
                                message.sender_id === currentUser.id
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground",
                              )}
                            >
                              <span className="text-xs">{format(new Date(message.created_at), "h:mm a")}</span>
                              {message.sender_id === currentUser.id &&
                                (message.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
              <p className="text-muted-foreground">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

