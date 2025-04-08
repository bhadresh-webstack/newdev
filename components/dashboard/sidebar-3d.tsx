'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  CreditCard,
  Settings,
  Users,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useTheme } from 'next-themes'

// Add custom scrollbar hiding
const scrollbarHidingStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

// Define navigation items outside the component to avoid initialization issues
const commonNavItems = [
  {
    name: 'Dashboard',
    href: '/app',
    icon: LayoutDashboard,
    color: 'from-blue-500 to-blue-600',
    shadowColor: 'shadow-blue-500/20'
  },
  {
    name: 'Projects',
    href: '/app/projects',
    icon: FolderKanban,
    color: 'from-purple-500 to-purple-600',
    shadowColor: 'shadow-purple-500/20'
  },
  {
    name: 'Messages',
    href: '/app/messages',
    icon: MessageSquare,
    color: 'from-green-500 to-green-600',
    shadowColor: 'shadow-green-500/20'
  }
]

// Role-specific navigation items
const roleSpecificNavItems = {
  customer: [
    {
      name: 'Payments',
      href: '/app/payments',
      icon: CreditCard,
      color: 'from-pink-500 to-pink-600',
      shadowColor: 'shadow-pink-500/20'
    }
  ],
  team_member: [
    {
      name: 'Tasks',
      href: '/app/tasks',
      icon: FolderKanban,
      color: 'from-cyan-500 to-cyan-600',
      shadowColor: 'shadow-cyan-500/20'
    }
  ],
  admin: [
    {
      name: 'Tasks',
      href: '/app/tasks',
      icon: FolderKanban,
      color: 'from-cyan-500 to-cyan-600',
      shadowColor: 'shadow-cyan-500/20'
    },
    {
      name: 'Customer Management',
      href: '/app/admin/customer',
      icon: Users,
      color: 'from-amber-500 to-amber-600',
      shadowColor: 'shadow-amber-500/20'
    },
    {
      name: 'Team',
      href: '/app/admin/team',
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      shadowColor: 'shadow-indigo-500/20'
    },
    {
      name: 'Settings',
      href: '/app/settings',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      shadowColor: 'shadow-gray-500/20'
    }
  ]
}

interface SidebarProps {
  className?: string
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar3D ({
  className,
  mobileOpen,
  onMobileClose
}: SidebarProps) {

  const { user, profile, signOut } = useAuthStore()

  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  // const [userRole, setUserRole] = useState<string>("customer")
  const [navItemsState, setNavItemsState] = useState([...commonNavItems])

  const userRole = user?.role

  // Get user role from localStorage and update navigation items
  useEffect(() => {
    if (userRole) {
      const roleItems =
        roleSpecificNavItems[userRole as keyof typeof roleSpecificNavItems] ||
        []
      setNavItemsState([...commonNavItems, ...roleItems])
    }
  }, [userRole])

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 1024)
        if (window.innerWidth < 1024) {
          setCollapsed(true)
        }
      }

      // Check on mount
      checkIfMobile()

      // Add resize listener
      window.addEventListener('resize', checkIfMobile)

      // Cleanup
      return () => window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Toggle sidebar and dispatch event for layout to respond
  const toggleSidebar = () => {
    setCollapsed(!collapsed)
    const event = new CustomEvent('sidebar-toggle', {
      detail: { collapsed: !collapsed }
    })
    window.dispatchEvent(event)
  }

  if (!mounted) return null

  // Improved isActive function that handles nested routes correctly
  const isActive = (path: string) => {
    // Exact match for dashboard to prevent it from matching all /app/* routes
    if (path === '/app') {
      return pathname === '/app' || pathname === '/app/'
    }
    // For other routes, check if the pathname starts with the path
    return pathname.startsWith(`${path}/`) || pathname === path
  }

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }

  const userInitials = getInitials(
    `${user?.user_name}`
  )

  // Determine sidebar visibility classes based on screen size and state
  const sidebarVisibilityClasses = cn(
    // Base classes
    'flex flex-col border-r bg-background transition-all duration-300 z-30',

    // Desktop positioning (fixed)
    'lg:fixed lg:top-0 lg:left-0 lg:bottom-0',

    // Desktop width based on collapsed state
    collapsed ? 'lg:w-20' : 'lg:w-64',

    // Mobile positioning (fixed and full screen when open)
    'fixed inset-0 w-full',

    // Mobile visibility
    isMobile && !mobileOpen ? 'translate-x-[-100%]' : 'translate-x-0',

    // Custom class
    className
  )

  return (
    <>
      <style jsx global>
        {scrollbarHidingStyle}
      </style>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-20'
          onClick={onMobileClose}
        />
      )}

      <div className={sidebarVisibilityClasses}>
        {/* Toggle button - only show on desktop */}
        {!isMobile && (
          <Button
            variant='ghost'
            size='icon'
            className='absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-md'
            onClick={toggleSidebar}
          >
            {collapsed ? (
              <ChevronRight className='h-4 w-4' />
            ) : (
              <ChevronLeft className='h-4 w-4' />
            )}
          </Button>
        )}

        {/* Close button - only show on mobile */}
        {isMobile && (
          <Button
            variant='ghost'
            size='icon'
            className='absolute top-4 right-4 z-10'
            onClick={onMobileClose}
          >
            <ChevronLeft className='h-5 w-5' />
          </Button>
        )}

        {/* Logo and header */}
        <div className='flex h-16 items-center justify-center border-b px-4'>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <div className='absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary to-purple-600 opacity-75 blur-sm'></div>
              <div className='relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600 text-white'>
                <span className='text-lg font-bold'>W</span>
              </div>
            </div>
            {(!collapsed || isMobile) && (
              <span className='text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600'>
                Webstack
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className='flex-1 overflow-y-auto py-4 no-scrollbar'>
          <nav className='space-y-1 px-2'>
            {navItemsState.map(item => {
              const active = isActive(item.href)

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={isMobile ? onMobileClose : undefined}
                >
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      'group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <div className='relative'>
                      {/* 3D effect with gradient background and shadow */}
                      <div
                        className={cn(
                          'absolute -inset-1 rounded-lg bg-gradient-to-br opacity-0 blur-sm transition-all duration-200',
                          item.color,
                          active ? 'opacity-50' : 'group-hover:opacity-30'
                        )}
                      ></div>
                      <div
                        className={cn(
                          'relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200',
                          active
                            ? `bg-gradient-to-br ${item.color} ${item.shadowColor} text-white shadow-lg`
                            : 'bg-muted text-muted-foreground group-hover:bg-gradient-to-br group-hover:text-white group-hover:shadow-md',
                          item.color,
                          item.shadowColor
                        )}
                      >
                        <item.icon className='h-5 w-5' />
                      </div>
                    </div>

                    {(!collapsed || isMobile) && (
                      <span className='ml-3 transition-all duration-200'>
                        {item.name}
                      </span>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Help section */}
        <div
          className={cn(
            'px-2 py-2',
            collapsed && !isMobile ? 'hidden' : 'block'
          )}
        >
          <Link href='/app/help' onClick={isMobile ? onMobileClose : undefined}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium',
                isActive('/app/help')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <div className='relative'>
                <div className='absolute -inset-1 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 opacity-0 blur-sm transition-all duration-200 group-hover:opacity-30'></div>
                <div
                  className={cn(
                    'relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200',
                    isActive('/app/help')
                      ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20'
                      : 'bg-muted text-muted-foreground group-hover:bg-gradient-to-br group-hover:from-teal-500 group-hover:to-teal-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-teal-500/20'
                  )}
                >
                  <HelpCircle className='h-5 w-5' />
                </div>
              </div>
              <span className='ml-3'>Help & Support</span>
            </motion.div>
          </Link>
        </div>

        {/* User profile */}
        <div className='border-t p-4'>
          <div
            className={cn(
              'flex items-center',
              collapsed && !isMobile ? 'justify-center' : 'justify-between'
            )}
          >
            <div className='flex items-center gap-3'>
              <Avatar className='h-10 w-10 border-2 border-primary/20'>
                <AvatarImage
                  src={profile?.profile_image || undefined}
                  alt={userInitials}
                />
                <AvatarFallback className='bg-gradient-to-br from-primary to-purple-600 text-white'>
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              {(!collapsed || isMobile) && (
                <div className='flex flex-col'>
                  <span className='text-sm font-medium'>
                    {user?.user_name}
                  </span>
                  <span className='text-xs text-muted-foreground capitalize'>
                    {userRole}
                  </span>
                </div>
              )}
            </div>

            {(!collapsed || isMobile) && (
              <Button variant='ghost' size='icon' onClick={() => signOut()}>
                <LogOut className='h-5 w-5 text-muted-foreground hover:text-foreground' />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
