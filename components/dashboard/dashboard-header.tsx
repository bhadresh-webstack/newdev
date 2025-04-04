"use client"

import { useState } from "react"
import { Search, Moon, Sun, User, Settings, LogOut, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

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
import { useAuthStore } from "@/lib/stores/auth-store"
import { cn } from "@/lib/utils"
import { NotificationsButton } from "@/components/notifications"

interface DashboardHeaderProps {
  user: any
  className?: string
  onMobileMenuToggle: () => void
}

export function DashboardHeader({ user, className, onMobileMenuToggle }: DashboardHeaderProps) {
  const { setTheme, theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false)
  const { signOut } = useAuthStore()

  const getInitials = (name: string) => {
    if (!name) return "U"
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
        const searchInput = document.getElementById("mobile-search-input")
        if (searchInput) searchInput.focus()
      }, 50)
    }
  }

  return (
    <header className={cn("border-b h-16 px-4 md:px-6 flex items-center justify-between", className)}>
      {/* Mobile search bar - shown when active */}
      {isMobileSearchActive ? (
        <div className="absolute inset-0 z-20 flex items-center px-4 bg-background border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="mobile-search-input"
              type="search"
              placeholder="Search..."
              className="pl-10 pr-10 bg-muted/50 border-none w-full"
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
        <>
          {/* Mobile sidebar trigger */}
          <div className={cn("flex items-center gap-2", isSearchFocused ? "lg:hidden" : "")}>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMobileMenuToggle}>
              <Menu className="h-5 w-5" />
            </Button>

            {/* Mobile title */}
            <h1 className={cn("text-lg font-medium lg:hidden", isSearchFocused ? "hidden" : "")}>Webstack</h1>
          </div>

          {/* Search - hidden on mobile, visible on tablet and up */}
          <div
            className={cn(
              "hidden md:block transition-all duration-300 ease-in-out",
              isSearchFocused ? "md:w-full lg:w-3/4 xl:w-2/3" : "md:w-1/3 lg:w-1/4",
            )}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 bg-muted/50 border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>

          {/* Right side actions */}
          <div
            className={cn(
              "flex items-center gap-2 md:gap-4 transition-all duration-300",
              isSearchFocused ? "md:opacity-0 md:invisible" : "md:opacity-100 md:visible",
            )}
          >
            {/* Search button on mobile */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileSearch}>
              <Search className="h-5 w-5" />
            </Button>

            {/* Theme toggle */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </motion.div>

            {/* Notifications */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <NotificationsButton />
            </motion.div>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarImage src={user.profile_image} alt={userInitials} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{`${user.first_name} ${user.last_name}`}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </header>
  )
}

