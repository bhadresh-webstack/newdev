"use client"

import { useState, useCallback } from "react"
import { useTasksStore, type Task } from "@/lib/stores/tasks-store"
import { toast } from "@/hooks/use-toast"

export function useTaskOperations() {
  const [isProcessing, setIsProcessing] = useState(false)
  const { createTask, updateTask, deleteTask, updateTaskGroup, batchAssignTasks, batchUnassignTasks } = useTasksStore()

  const handleCreateTask = useCallback(
    async (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
      setIsProcessing(true)

      try {
        const { data, error } = await createTask(taskData)

        if (error) {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          })
          return null
        }

        toast({
          title: "Success",
          description: "Task created successfully",
        })

        return data
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to create task",
          variant: "destructive",
        })
        return null
      } finally {
        setIsProcessing(false)
      }
    },
    [createTask],
  )

  // Modify the handleUpdateTask function to update state without reloading
  const handleUpdateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      setIsProcessing(true)

      try {
        // Log the update attempt for debugging
        console.log("Updating task:", id, updates)

        // Optimistically update the UI first
        const { data, error } = await updateTask(id, updates)

        if (error) {
          console.error("Error from API:", error)
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          })
          return null
        }

        // Success toast only if it's not a status update (to avoid too many notifications)
        if (!updates.status) {
          toast({
            title: "Success",
            description: "Task updated successfully",
          })
        }

        return data
      } catch (err: any) {
        console.error("Exception in handleUpdateTask:", err)
        toast({
          title: "Error",
          description: err.message || "Failed to update task",
          variant: "destructive",
        })
        return null
      } finally {
        setIsProcessing(false)
      }
    },
    [updateTask, toast],
  )

  const handleDeleteTask = useCallback(
    async (id: string) => {
      setIsProcessing(true)

      try {
        const { error } = await deleteTask(id)

        if (error) {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          })
          return false
        }

        toast({
          title: "Success",
          description: "Task deleted successfully",
        })

        return true
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive",
        })
        return false
      } finally {
        setIsProcessing(false)
      }
    },
    [deleteTask],
  )

  const handleUpdateTaskGroup = useCallback(
    async (id: string, newGroup: string) => {
      setIsProcessing(true)

      try {
        const { error } = await updateTaskGroup(id, newGroup)

        if (error) {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          })
          return false
        }

        return true
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to update task group",
          variant: "destructive",
        })
        return false
      } finally {
        setIsProcessing(false)
      }
    },
    [updateTaskGroup],
  )

  const handleBatchAssign = useCallback(
    async (taskIds: string[], userId: string) => {
      setIsProcessing(true)

      try {
        const { error } = await batchAssignTasks(taskIds, userId)

        if (error) {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          })
          return false
        }

        toast({
          title: "Success",
          description: `${taskIds.length} tasks assigned successfully`,
        })

        return true
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to assign tasks",
          variant: "destructive",
        })
        return false
      } finally {
        setIsProcessing(false)
      }
    },
    [batchAssignTasks],
  )

  const handleBatchUnassign = useCallback(
    async (taskIds: string[]) => {
      setIsProcessing(true)

      try {
        const { error } = await batchUnassignTasks(taskIds)

        if (error) {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          })
          return false
        }

        toast({
          title: "Success",
          description: `${taskIds.length} tasks unassigned successfully`,
        })

        return true
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to unassign tasks",
          variant: "destructive",
        })
        return false
      } finally {
        setIsProcessing(false)
      }
    },
    [batchUnassignTasks],
  )

  return {
    isProcessing,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleUpdateTaskGroup,
    handleBatchAssign,
    handleBatchUnassign,
  }
}
