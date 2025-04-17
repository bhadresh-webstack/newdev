"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { FolderKanban, MessageSquare, CreditCard, Users, ArrowUpRight, CheckCircle } from "lucide-react"

interface QuickActionsProps {
  userRole: string
}

export function QuickActions({ userRole }: QuickActionsProps) {
  // Quick action cards based on user role
  const quickActions = {
    customer: [
      {
        title: "New Project",
        description: "Start a new website project",
        icon: FolderKanban,
        href: "/app/projects/new",
        color: "from-blue-500 to-blue-600",
        iconBg: "bg-blue-500",
      },
      {
        title: "Messages",
        description: "Contact your project team",
        icon: MessageSquare,
        href: "/app/messages",
        color: "from-green-500 to-green-600",
        iconBg: "bg-green-500",
      },
      // {
      //   title: "Documents",
      //   description: "View project documents",
      //   icon: FileText,
      //   href: "/app/documents",
      //   color: "from-amber-500 to-amber-600",
      //   iconBg: "bg-amber-500",
      // },
      {
        title: "Payments",
        description: "Manage your subscriptions",
        icon: CreditCard,
        href: "/app/payments",
        color: "from-purple-500 to-purple-600",
        iconBg: "bg-purple-500",
      },
    ],
    team_member: [
      {
        title: "Tasks",
        description: "View your assigned tasks",
        icon: CheckCircle,
        href: "/app/tasks",
        color: "from-blue-500 to-blue-600",
        iconBg: "bg-blue-500",
      },
      {
        title: "Projects",
        description: "Manage active projects",
        icon: FolderKanban,
        href: "/app/projects",
        color: "from-purple-500 to-purple-600",
        iconBg: "bg-purple-500",
      },
      {
        title: "Messages",
        description: "Communicate with clients",
        icon: MessageSquare,
        href: "/app/messages",
        color: "from-green-500 to-green-600",
        iconBg: "bg-green-500",
      },
      // {
      //   title: "Documents",
      //   description: "Access project files",
      //   icon: FileText,
      //   href: "/app/documents",
      //   color: "from-amber-500 to-amber-600",
      //   iconBg: "bg-amber-500",
      // },
    ],
    admin: [
      {
        title: "Team",
        description: "Manage team members",
        icon: Users,
        href: "/app/admin/team",
        color: "from-indigo-500 to-indigo-600",
        iconBg: "bg-indigo-500",
      },
      {
        title: "Projects",
        description: "Oversee all projects",
        icon: FolderKanban,
        href: "/app/projects",
        color: "from-purple-500 to-purple-600",
        iconBg: "bg-purple-500",
      },
      // {
      //   title: "Settings",
      //   description: "Configure system settings",
      //   icon: CreditCard,
      //   href: "/app/settings",
      //   color: "from-gray-500 to-gray-600",
      //   iconBg: "bg-gray-500",
      // },
      {
        title: "Analytics",
        description: "View performance metrics",
        icon: ArrowUpRight,
        href: "/app/admin/analytics",
        color: "from-blue-500 to-blue-600",
        iconBg: "bg-blue-500",
      },
    ],
  }

  const currentActions = quickActions[userRole as keyof typeof quickActions]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {currentActions.map((action, index) => (
          <motion.div
            key={action.title}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
          >
            <Link href={action.href}>
              <Card className="h-full hover:shadow-md transition-all cursor-pointer overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${action.color}`}></div>
                <CardContent className="p-4 md:p-6 flex items-start gap-4">
                  <div
                    className={`h-10 w-10 md:h-12 md:w-12 rounded-full ${action.iconBg} text-white flex items-center justify-center shadow-lg`}
                  >
                    <action.icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
