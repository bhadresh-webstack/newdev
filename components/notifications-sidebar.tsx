"use client"

import { X, Check, Bell, Info, AlertTriangle } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type NotificationType = "info" | "success" | "warning" | "error"

interface Notification {
  id: string
  read: boolean
  title: string
  message: string
  time: string
  type: NotificationType
}

interface NotificationsSidebarProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  unreadCount: number
}

export function NotificationsSidebar({
  isOpen,
  onClose,
  notifications,
  markAsRead,
  markAllAsRead,
  unreadCount,
}: NotificationsSidebarProps) {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <Check className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex h-5 items-center justify-center rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground">
                  {unreadCount} new
                </span>
              )}
            </SheetTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
              {/* Fixed close button with explicit onClick handler */}
              <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5rem)]">
          {notifications.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center p-4">
              <Bell className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn("p-4 transition-colors hover:bg-muted/50", !notification.read && "bg-muted/20")}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
                          {notification.title}
                        </p>
                        {!notification.read && <span className="flex-shrink-0 rounded-full bg-primary h-2 w-2" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

