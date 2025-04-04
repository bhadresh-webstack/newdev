"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Briefcase, CheckSquare, MessageSquare, FileText, Settings, HelpCircle } from "lucide-react"

interface AppSidebarProps {
  userRole?: string
}

export default function AppSidebar({ userRole = "customer" }: AppSidebarProps) {
  const pathname = usePathname()

  // Improved isActive function that handles nested routes correctly
  const isActive = (path: string) => {
    // Exact match for dashboard to prevent it from matching all /app/* routes
    if (path === "/app") {
      return pathname === "/app" || pathname === "/app/"
    }
    // For other routes, check if the pathname starts with the path
    return pathname.startsWith(`${path}/`) || pathname === path
  }

  const navItems = [
    { name: "Dashboard", href: "/app", icon: Home },
    { name: "Projects", href: "/app/projects", icon: Briefcase },
    { name: "Tasks", href: "/app/tasks", icon: CheckSquare },
    { name: "Messages", href: "/app/messages", icon: MessageSquare },
    { name: "Documents", href: "/app/documents", icon: FileText },
  ]

  // Admin-only navigation items
  const adminItems = [
    { name: "Team Members", href: "/app/team", icon: Users },
    { name: "Settings", href: "/app/settings", icon: Settings },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Webstack</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.href)
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {(userRole === "admin" || userRole === "team_member") && (
          <>
            <div className="mt-8 mb-2">
              <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Administration
              </p>
            </div>
            <ul className="space-y-1">
              {adminItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.href)
                        ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <Link
          href="/app/help"
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            isActive("/app/help")
              ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <HelpCircle className="mr-3 h-5 w-5" />
          Help & Support
        </Link>
      </div>
    </aside>
  )
}

