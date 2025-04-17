"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationsSidebar } from "./notifications-sidebar"
import { Notification } from "@/lib/types"

// Demo notification data with more entries to test scrolling
export const demoNotifications: Notification[] = [
  {
    id: "1",
    read: false,
    title: "New Project Submitted",
    message: "Client ABC has submitted a new project request for review.",
    time: "5 minutes ago",
    type: "info",
  },
  {
    id: "2",
    read: false,
    title: "Payment Received",
    message: "Payment of $1,500 has been received for Project XYZ.",
    time: "1 hour ago",
    type: "success",
  },
  {
    id: "3",
    read: true,
    title: "Deadline Approaching",
    message: "Project DEF is due in 2 days. Please ensure all deliverables are ready.",
    time: "3 hours ago",
    type: "warning",
  },
  {
    id: "4",
    read: true,
    title: "Team Meeting",
    message: "Reminder: Weekly team meeting tomorrow at 10:00 AM.",
    time: "Yesterday",
    type: "info",
  },
  {
    id: "5",
    read: true,
    title: "New Comment",
    message: "John Doe commented on your task: 'Looks great, just a few minor tweaks needed.'",
    time: "2 days ago",
    type: "info",
  },
  // Additional notifications for scrolling test
  {
    id: "6",
    read: false,
    title: "System Update",
    message: "The platform will be undergoing maintenance tonight from 2-4 AM EST.",
    time: "2 days ago",
    type: "warning",
  },
  {
    id: "7",
    read: true,
    title: "New Team Member",
    message: "Please welcome Sarah Johnson who has joined the design team.",
    time: "3 days ago",
    type: "info",
  },
  {
    id: "8",
    read: false,
    title: "Client Feedback",
    message: "Client XYZ has provided feedback on the latest design iteration.",
    time: "3 days ago",
    type: "info",
  },
  {
    id: "9",
    read: true,
    title: "Project Milestone Completed",
    message: "The development team has completed Phase 1 of Project ABC ahead of schedule.",
    time: "4 days ago",
    type: "success",
  },
  {
    id: "10",
    read: true,
    title: "Invoice Generated",
    message: "Invoice #12345 has been generated and sent to the client.",
    time: "5 days ago",
    type: "info",
  },
  {
    id: "11",
    read: true,
    title: "Resource Allocation",
    message: "Additional resources have been allocated to Project XYZ.",
    time: "1 week ago",
    type: "info",
  },
  {
    id: "12",
    read: true,
    title: "Security Alert",
    message: "Multiple failed login attempts detected. Please verify your account security.",
    time: "1 week ago",
    type: "error",
  },
  {
    id: "13",
    read: true,
    title: "Performance Review",
    message: "Your quarterly performance review is scheduled for next Monday.",
    time: "1 week ago",
    type: "info",
  },
  {
    id: "14",
    read: true,
    title: "Budget Approval",
    message: "The budget for Q3 has been approved by the finance department.",
    time: "2 weeks ago",
    type: "success",
  },
  {
    id: "15",
    read: true,
    title: "Training Opportunity",
    message: "New training courses are available on the learning platform.",
    time: "2 weeks ago",
    type: "info",
  },
]

export function NotificationsButton() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(demoNotifications)

  // Calculate unread count
  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length
    setUnreadCount(count)
  }, [notifications])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  // Handle close explicitly
  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="relative rounded-full" onClick={() => setIsOpen(true)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground">
            {unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationsSidebar
        isOpen={isOpen}
        onClose={handleClose}
        notifications={notifications}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
        unreadCount={unreadCount}
      />
    </>
  )
}
