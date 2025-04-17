'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/stores/auth-store'
import { apiRequest } from '@/lib/useApi'
import { ENDPOINT } from '@/lib/api/end-point'
import type { Project, Task } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { TaskDetailSheet } from '@/components/tasks/task-detail-sheet'
import { useTaskOperations } from '@/lib/hooks/use-task-operations'
import { useToast } from '@/hooks/use-toast'
import type { Task as TaskType } from '@/lib/stores/tasks-store'
import { StatsOverview } from '@/components/dashboard/stats-overview'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentProjects } from '@/components/dashboard/recent-projects'
import { RecentTasks } from '@/components/dashboard/recent-tasks'

export default function DashboardPage () {
  const { user, isLoading: authLoading } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Add state for task detail sheet
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)

  const { handleUpdateTask } = useTaskOperations()
  const { toast } = useToast()

  const userRole = user?.role || 'user'
  const userName = user?.user_name || 'User'

  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        // Fetch projects
        const { data: projectsData } = await apiRequest<{
          projects: Project[]
        }>('GET', ENDPOINT.PROJECT.base)

        if (projectsData) {
          setProjects(projectsData.projects || [])

          // Calculate stats directly from projects data
          const totalProjects = projectsData.projects?.length || 0
          const inDevelopment =
            projectsData.projects?.filter(
              p =>
                p.progress_percentage ||
                (0 > 0 && p.progress_percentage) ||
                0 < 100
            ).length || 0
          const awaitingFeedback =
            projectsData.projects?.filter(
              p => p.status === 'Pending' || p.status === 'Review'
            ).length || 0
          const completedProjects =
            projectsData.projects?.filter(
              p => p.progress_percentage || 0 >= 100 || p.status === 'Completed'
            ).length || 0

          setStats({
            totalProjects,
            completedTasks: completedProjects,
            pendingTasks: awaitingFeedback,
            inProgressTasks: inDevelopment
          })
        }

        // Fetch recent tasks
        const { data: tasksData } = await apiRequest<Task[]>(
          'GET',
          ENDPOINT.TASK.base
        )

        if (tasksData) {
          // Sort by most recent and take first 3
          const sortedTasks = [...tasksData]
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .slice(0, 3)

          setRecentTasks(sortedTasks)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user && !authLoading) {
      fetchDashboardData()
    }
  }, [user, authLoading])

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }

  // Add task click handler
  const handleTaskClick = (task: TaskType) => {
    setSelectedTask(task)
    setIsTaskDetailOpen(true)
  }

  // Add task status change handler
  const handleTaskStatusChange = async (
    taskId: string,
    newStatus: string
  ): Promise<void> => {
    try {
      // Optimistically update the UI first
      const taskToUpdate = recentTasks.find(t => t.id === taskId)
      if (taskToUpdate) {
        // Update the selected task if it's open in the detail view
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...selectedTask,
            status: newStatus
          })
        }

        // Update the task in the recentTasks array
        setRecentTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        )
      }

      // Then make the API call
      await handleUpdateTask(taskId, { status: newStatus })

      // Show success message
      toast({
        title: 'Success',
        description: `Task status updated to ${newStatus}`
      })
    } catch (error) {
      console.error('Error updating task status:', error)

      // Show error message
      toast({
        title: 'Error',
        description: 'Failed to update task status. Please try again.',
        variant: 'destructive'
      })

      // Revert optimistic update if there was an error
      if (selectedTask && selectedTask.id === taskId) {
        const originalTask = recentTasks.find(t => t.id === taskId)
        if (originalTask) {
          setSelectedTask(originalTask)
        }
      }
    }
  }

  // Add task update handler
  const handleTaskUpdate = async (updatedTask: TaskType): Promise<void> => {
    try {
      // Update the task in the recentTasks array
      setRecentTasks(prevTasks =>
        prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
      )

      // Update the selected task if it's currently open
      if (selectedTask && selectedTask.id === updatedTask.id) {
        setSelectedTask(updatedTask)
      }

      // Show success message
      toast({
        title: 'Success',
        description: 'Task updated successfully'
      })
    } catch (error) {
      console.error('Error updating task:', error)

      // Show error message
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again.',
        variant: 'destructive'
      })
    }
  }

  // Add function to get related tasks
  const getRelatedTasks = (taskId: string, projectId: string): TaskType[] => {
    return recentTasks.filter(
      t => t.project_id === projectId && t.id !== taskId
    )
  }

  if (isLoading || authLoading) {
    return (
      <div className='space-y-8 animate-pulse'>
        <div className='h-8 bg-muted rounded-md w-2/3'></div>
        <div className='h-4 bg-muted rounded-md w-1/2'></div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className='h-32 bg-muted rounded-lg'></div>
          ))}
        </div>
        <div className='h-64 bg-muted rounded-lg'></div>
      </div>
    )
  }

  // Calculate due date from start date and duration
  const calculateDueDate = (
    startDate: string | undefined,
    durationDays: number | undefined
  ) => {
    if (!startDate || !durationDays) return null

    const date = new Date(startDate)
    date.setDate(date.getDate() + durationDays)
    return date
  }

  return (
    <div className='space-y-8'>
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-2xl md:text-3xl font-semibold tracking-tight'
        >
          Welcome back, {userName}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='text-muted-foreground'
        >
          Here's an overview of your{' '}
          {userRole === 'customer' ? 'projects' : 'workspace'}
        </motion.p>
      </div>

      {/* Stats Overview */}
      <StatsOverview userRole={userRole} stats={stats} />

      {/* Quick Actions */}
      <QuickActions userRole={userRole} />

      {/* Recent Projects */}
      <RecentProjects projects={projects} userRole={userRole} />

      {/* Recent Tasks */}
      <RecentTasks
        recentTasks={recentTasks}
        onTaskClick={handleTaskClick}
        userRole={userRole}
      />

      {/* Task Detail Sheet */}
      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          isOpen={isTaskDetailOpen}
          onClose={() => setIsTaskDetailOpen(false)}
          onStatusChange={handleTaskStatusChange}
          relatedTasks={
            selectedTask
              ? getRelatedTasks(selectedTask.id, selectedTask.project_id)
              : []
          }
          handleUpdateTask={handleUpdateTask}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </div>
  )
}
