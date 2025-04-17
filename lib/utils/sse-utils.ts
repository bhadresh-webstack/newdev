const clients = new Map<
  string,
  Set<{
    userId: string
    controller: ReadableStreamDefaultController<any>
  }>
>()

export function getClientsMap() {
  return clients
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
