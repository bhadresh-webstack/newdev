import { io, type Socket } from "socket.io-client"
import { toast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/useApi"
import { ENDPOINT } from "./api/end-point"
import type { Message } from "./types"

// Socket instance that will be reused across the application
let socket: Socket | null = null

// Message event listeners
const messageListeners = new Map<string, ((message: any, isReplacement?: boolean) => void)[]>()

// SSE connections for projects
const projectConnections = new Map<string, EventSource>()

// Temporary message IDs mapping to track pending messages
const tempMessageIds = new Map<string, string>()

// Initialize socket connection
export const initializeSocket = (userId: string): Socket => {
  if (socket) return socket

  // Connect to the socket server with authentication
  socket = io(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000", {
    auth: {
      userId,
    },
    withCredentials: true,
    transports: ["websocket", "polling"],
  })

  // Connection event handlers
  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id)
  })

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error)
    toast({
      title: "Connection Error",
      description: "Failed to connect to messaging service. Retrying...",
      variant: "destructive",
    })
  })

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason)
    if (reason === "io server disconnect") {
      // Reconnect if the server disconnected us
      socket?.connect()
    }
  })

  return socket
}

// Get the existing socket or initialize a new one
export const getSocket = (userId?: string): Socket | null => {
  if (!userId) return null
  if (socket) return socket
  return initializeSocket(userId)
}

// Join a project room to receive project-specific messages
export const joinProjectRoom = (projectId: string) => {
  if (!socket || !socket.connected) {
    console.error("Socket not connected, cannot join room")
    return
  }

  socket.emit("join_project", { projectId })
  console.log(`Joined project room: ${projectId}`)
}

// Leave a project room when navigating away
export const leaveProjectRoom = (projectId: string) => {
  if (!socket || !socket.connected) return

  socket.emit("leave_project", { projectId })
  console.log(`Left project room: ${projectId}`)
}

// Disconnect socket when no longer needed
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    console.log("Socket disconnected and reference cleared")
  }
}

// Filter system messages
const isUserMessage = (message: any): boolean => {
  // Filter out connection messages and other system messages
  return !message.type || message.type !== "connection"
}

// Initialize connection for a project
export const initializeProjectConnection = (projectId: string, userId: string) => {
  if (projectConnections.has(projectId)) {
    return
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin
  const url = `${baseUrl}/api/messages/sse?projectId=${projectId}&userId=${userId}`

  try {
    const eventSource = new EventSource(url)

    eventSource.onopen = () => {
      console.log(`SSE connection opened for project: ${projectId}`)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // Skip system messages like connection notifications
        if (!isUserMessage(data)) {
          console.log("System message received:", data)
          return
        }

        // Check if this is a message that replaces a temporary one
        const tempId = findTempIdForRealMessage(data)
        const isReplacement = !!tempId

        if (isReplacement) {
          // Remove the mapping now that we've processed it
          tempMessageIds.delete(tempId)
        }

        // Notify all listeners for this project
        const listeners = messageListeners.get(projectId) || []
        listeners.forEach((listener) => listener(data, isReplacement))
      } catch (error) {
        console.error("Error parsing message:", error)
      }
    }

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error)
      toast({
        title: "Connection Error",
        description: "Failed to connect to messaging service. Retrying...",
        variant: "destructive",
      })

      // Close and remove the connection
      eventSource.close()
      projectConnections.delete(projectId)

      // Try to reconnect after a delay
      setTimeout(() => {
        initializeProjectConnection(projectId, userId)
      }, 5000)
    }

    projectConnections.set(projectId, eventSource)
  } catch (error) {
    console.error("Failed to create SSE connection:", error)
  }
}

// Find temporary ID for a real message based on content matching
function findTempIdForRealMessage(realMessage: Message) {
  for (const [tempId, messageData] of tempMessageIds.entries()) {
    try {
      const data = JSON.parse(messageData)
      // Match based on sender, message content and timestamp proximity
      if (
        data.sender_id === realMessage.sender_id &&
        data.message === realMessage.message &&
        // Check if timestamps are within 10 seconds of each other
        Math.abs(new Date(data.created_at).getTime() - new Date(realMessage.created_at).getTime()) < 10000
      ) {
        return tempId
      }
    } catch (e) {
      console.error("Error parsing temp message data:", e)
    }
  }
  return null
}

// Add a message listener for a project
export const addMessageListener = (projectId: string, listener: (message: any, isReplacement?: boolean) => void) => {
  if (!messageListeners.has(projectId)) {
    messageListeners.set(projectId, [])
  }

  messageListeners.get(projectId)?.push(listener)
}

// Remove a message listener
export const removeMessageListener = (projectId: string, listener: (message: any, isReplacement?: boolean) => void) => {
  const listeners = messageListeners.get(projectId) || []
  const index = listeners.indexOf(listener)

  if (index !== -1) {
    listeners.splice(index, 1)
    messageListeners.set(projectId, listeners)
  }
}

// Close connection for a project
export const closeProjectConnection = (projectId: string) => {
  const eventSource = projectConnections.get(projectId)

  if (eventSource) {
    eventSource.close()
    projectConnections.delete(projectId)
    messageListeners.delete(projectId)
    console.log(`Closed SSE connection for project: ${projectId}`)
  }
}

// Send a message
export const sendMessage = async (projectId: string, message: string, senderId: string, receiverId: string) => {
  try {
    // Create temporary message data
    const tempId = `temp-${Date.now()}`
    const messageData = {
      id: tempId,
      project_id: projectId,
      sender_id: senderId,
      receiver_id: receiverId,
      message,
      created_at: new Date().toISOString(),
    }

    // Store the temp message data for later matching
    tempMessageIds.set(tempId, JSON.stringify(messageData))

    // Send message to API
    const { data, error } = await apiRequest("POST", ENDPOINT.PROJECT.messages(projectId), {
      message,
      receiver_id: receiverId,
    })

    if (error) {
      // If there's an error, we should keep the temp ID in the map
      // so the UI can show an error state for this message
      throw new Error(error)
    }

    // Return the data so we can update the UI with the real message
    return { success: true, data, tempId }
  } catch (error) {
    console.error("Error sending message:", error)
    return { success: false, error, tempId: null }
  }
}
