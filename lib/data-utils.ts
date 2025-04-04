import demoData from "./demo-data.json"

export type DemoTask = (typeof demoData.tasks)[0]
export type DemoProject = (typeof demoData.projects)[0]
export type DemoConversation = (typeof demoData.conversations)[0]
export type DemoMessage = (typeof demoData.messages)["conv-1"][0]
export type DemoUser = typeof demoData.currentUser

// Export the data
export const demoTasks = demoData.tasks
export const demoProjects = demoData.projects
export const demoConversations = demoData.conversations
export const demoMessages = demoData.messages
export const currentUser = demoData.currentUser

