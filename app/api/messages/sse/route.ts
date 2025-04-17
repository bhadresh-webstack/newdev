import type { NextRequest } from "next/server"
import { authenticateRequest } from "@/lib/auth-utils"
import { getClientsMap } from "@/lib/utils/sse-utils"

const clients = getClientsMap()

export async function GET(req: NextRequest) {
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

  const stream = new ReadableStream({
    start(controller) {
      if (!clients.has(projectId)) {
        clients.set(projectId, new Set())
      }

      clients.get(projectId)?.add({ userId, controller })

      const data = JSON.stringify({
        type: "connection",
        systemMessage: true,
        message: "Connected to message stream",
      })
      controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
    },
    cancel() {
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

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
