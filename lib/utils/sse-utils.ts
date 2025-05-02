// Map to store clients for each project
const clients = new Map<string, Set<{ userId: string; controller: ReadableStreamDefaultController }>>()

// Get the clients map
export function getClientsMap() {
  return clients
}

// Broadcast a message to all clients in a project
export function broadcastToProject(projectId: string, message: any) {
  const projectClients = clients.get(projectId)

  if (!projectClients) {
    return
  }

  const data = JSON.stringify(message)

  for (const client of projectClients) {
    try {
      client.controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
    } catch (error) {
      console.error(`Error broadcasting to client ${client.userId}:`, error)
      // Remove the client if there's an error
      projectClients.delete(client)
    }
  }
}

// Remove a client from a project
export function removeClientFromProject(projectId: string, userId: string) {
  const projectClients = clients.get(projectId)

  if (!projectClients) return

  for (const client of projectClients) {
    if (client.userId === userId) {
      projectClients.delete(client)
      break
    }
  }

  // Remove the project if there are no clients
  if (projectClients.size === 0) {
    clients.delete(projectId)
  }
}
