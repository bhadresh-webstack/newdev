import type { NextRequest } from "next/server"
import { authenticateRequest } from "@/lib/auth-utils"

// Connected clients by project
const clients = new Map<
  string,
  Set<{
    userId: string
    controller: ReadableStreamController<any>
  }>
>()

export async function GET(req: NextRequest) {
  // Authenticate the request
  const auth = await authenticateRequest(req as any)

  if (!auth.authenticated) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get("projectId")
  const userId = searchParams.get("userId") || auth.userId

  if (!projectId || !userId) {
    return new Response("Missing projectId or userId", { status: 400 })
  }

  // Create a new response with a readable stream
  const stream = new ReadableStream({
    start(controller) {
      // Add client to the project's client list
      if (!clients.has(projectId)) {
        clients.set(projectId, new Set())
      }

      clients.get(projectId)?.add({ userId, controller })

      // Send initial connection message with a clear type for filtering
      const data = JSON.stringify({
        type: "connection",
        systemMessage: true,
        message: "Connected to message stream",
      })
      controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
    },
    cancel() {
      // Remove client when connection is closed
      const projectClients = clients.get(projectId)
      if (projectClients) {
        for (const client of projectClients) {
          if (client.userId === userId) {
            projectClients.delete(client)
            break
          }
        }

        if (projectClients.size === 0) {
          clients.delete(projectId)
        }
      }
    },
  })

  // Return the response with appropriate headers for SSE
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

// Helper function to broadcast a message to all clients in a project
export function broadcastToProject(projectId: string, message: any) {
  const projectClients = clients.get(projectId)

  if (!projectClients) {
    return
  }

  const data = JSON.stringify(message)

  for (const client of projectClients) {
    client.controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
  }
}
