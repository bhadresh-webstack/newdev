"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Sun, Moon, User } from "lucide-react"

interface AppHeaderProps {
  user: {
    first_name: string
    last_name: string
    email: string
    profile_image: string | null
  }
}

export default function AppHeader({ user }: AppHeaderProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const handleSignOut = async () => {
    // Simplified sign out
    window.location.href = "/login"
  }

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center px-6">
      <div className="flex-1"></div>

      <div className="flex items-center space-x-4">
        <button
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="relative">
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={toggleDropdown}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden">
              {user.profile_image ? (
                <img
                  src={user.profile_image || "/placeholder.svg"}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              )}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {user.first_name} {user.last_name}
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-10">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
              <Link
                href="/app/profile"
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setDropdownOpen(false)}
              >
                Your Profile
              </Link>
              <Link
                href="/app/settings"
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setDropdownOpen(false)}
              >
                Settings
              </Link>
              <button
                className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

