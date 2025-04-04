"use client"

import { useState } from "react"
import Link from "next/link"
import { LogOut, Moon, Search, Sun, User, X } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationsButton } from "@/components/notifications"
import { cn } from "@/lib/utils"

interface AppHeaderProps {
  user: any
}

export function AppHeader({ user }: AppHeaderProps) {
  const { setTheme, theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false)
  const { signOut, isLoading } = useAuthStore()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const userInitials = getInitials(`${user.first_name || ""} ${user.last_name || ""}`)

  const toggleMobileSearch = () => {
    setIsMobileSearchActive(!isMobileSearchActive)
    if (!isMobileSearchActive) {
      // Focus the input after a short delay to allow the animation to complete
      setTimeout(() => {
        const searchInput = document.getElementById("app-mobile-search-input")
        if (searchInput) searchInput.focus()
      }, 50)
    }
  }

  return (
    <header className="border-b bg-white dark:bg-slate-800 px-6 py-3 relative">
      {isMobileSearchActive ? (
        <div className="absolute inset-0 z-20 flex items-center px-4 bg-white dark:bg-slate-800 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="app-mobile-search-input"
              type="search"
              placeholder="Search..."
              className="pl-10 pr-10 bg-slate-100 dark:bg-slate-700 border-0 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <Button variant="ghost" size="icon" onClick={toggleMobileSearch} className="ml-2">
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "relative transition-all duration-300 ease-in-out hidden md:block",
              isSearchFocused ? "w-full" : "w-full max-w-md",
            )}
          >
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 bg-slate-100 dark:bg-slate-700 border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
          <div
            className={cn(
              "flex items-center gap-4 transition-all duration-300",
              isSearchFocused ? "md:opacity-0 md:invisible" : "opacity-100 visible",
            )}
          >
            {/* Mobile search button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileSearch}>
              <Search className="h-5 w-5" />
            </Button>

            <NotificationsButton />
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile_image} alt={`${user.first_name} ${user.last_name}`} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{`${user.first_name} ${user.last_name}`}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/app/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/settings">
                    <User className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} disabled={isLoading}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoading ? "Signing out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </header>
  )
}
