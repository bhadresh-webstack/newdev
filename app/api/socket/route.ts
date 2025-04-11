import type { Server as NetServer } from "http"
import type { NextApiRequest } from "next"
import { Server as SocketIOServer } from "socket.io"
import { NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth-utils"

// Socket.io server instance
let io: SocketIOServer | null = null

// Initialize Socket.io server
const initializeSocketServer = (req: NextApiRequest, res: any) => {
  if (!io) {
    const httpServer = res.socket.server as NetServer
    io = new SocketIOServer(httpServer, {
      path: "/api/socket",
      cors: {
        origin: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    })

    // Socket.io connection handler
    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id)

      // Authenticate the socket connection
      const userId = socket.handshake.auth.userId
      if (!userId) {
        console.log("Socket connection rejected: No user ID provided")
        socket.disconnect(true)
        return
      }

      // Store user ID in socket data
      socket.data.userId = userId

      // Join project room
      socket.on("join_project", ({ projectId }) => {
        if (!projectId) return

        socket.join(`project:${projectId}`)
        console.log(`User ${userId} joined project room: ${projectId}`)
      })

      // Leave project room
      socket.on("leave_project", ({ projectId }) => {
        if (!projectId) return

        socket.leave(`project:${projectId}`)
        console.log(`User ${userId} left project room: ${projectId}`)
      })

      // Handle new messages
      socket.on("send_message", async (messageData) => {
        try {
          const { project_id, sender_id, receiver_id, message } = messageData

          // Validate message data
          if (!project_id || !sender_id || !message) {
            console.error("Invalid message data:", messageData)
            return
          }

          // Save message to database (you would implement this)
          // const savedMessage = await saveMessageToDatabase(messageData)

          // Broadcast message to all clients in the project room
          io.to(`project:${project_id}`).emit("new_message", messageData)

          console.log(`Message sent to project ${project_id} by user ${sender_id}`)
        } catch (error) {
          console.error("Error handling message:", error)
        }
      })

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
      })
    })
  }

  return io
}

export async function GET(req: Request) {
  // Authenticate the request
  const auth = await authenticateRequest(req as any)

  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  return NextResponse.json({ socketEnabled: true })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
