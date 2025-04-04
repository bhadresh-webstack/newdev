"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Layers,
  LayoutDashboard,
  ClipboardList,
  Settings,
  Users,
  MessageSquare,
  FileText,
  CreditCard,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  userRole: string
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  // Define navigation items based on user role
  const navItems = [
    {
      title: "Dashboard",
      href: "/app",
      icon: LayoutDashboard,
      roles: ["customer", "team_member", "admin"],
    },
    {
      title: "Projects",
      href: "/app/projects",
      icon: Layers,
      roles: ["customer", "team_member", "admin"],
    },
    {
      title: "Tasks",
      href: "/app/tasks",
      icon: ClipboardList,
      roles: ["customer", "team_member", "admin"],
    },
    {
      title: "Messages",
      href: "/app/messages",
      icon: MessageSquare,
      roles: ["customer", "team_member", "admin"],
    },
    {
      title: "Files",
      href: "/app/files",
      icon: FileText,
      roles: ["customer", "team_member", "admin"],
    },
    {
      title: "Payments",
      href: "/app/payments",
      icon: CreditCard,
      roles: ["customer", "admin"],
    },
    {
      title: "Team",
      href: "/app/team",
      icon: Users,
      roles: ["team_member", "admin"],
    },
    {
      title: "Settings",
      href: "/app/settings",
      icon: Settings,
      roles: ["customer", "team_member", "admin"],
    },
  ].filter((item) => item.roles.includes(userRole))

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="py-4">
          <div className="flex items-center gap-2 px-4">
            <Layers className="h-6 w-6 text-primary" />
            <span className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Webstack
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(item.href)}>
                  <Link href={item.href} className="flex items-center">
                    <item.icon className="mr-2 h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}

