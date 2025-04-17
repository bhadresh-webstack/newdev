"use client"

import type React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useState, useEffect } from "react"

interface HeaderProps {
  featuresRef: React.RefObject<HTMLElement | null>
  rolesRef: React.RefObject<HTMLElement | null>
  pricingRef: React.RefObject<HTMLElement | null>
  testimonialsRef: React.RefObject<HTMLElement | null>
  backgroundOpacity: any
}

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

const Header = ({ featuresRef, rolesRef, pricingRef, testimonialsRef, backgroundOpacity }: HeaderProps) => {
  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <Layers className="h-6 w-6 text-primary" />
          <span className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Webstack
          </span>
        </motion.div>
        <nav className="hidden md:flex gap-6">
          {[
            { name: "Features", ref: featuresRef },
            { name: "Roles", ref: rolesRef },
            { name: "Pricing", ref: pricingRef },
            { name: "Testimonials", ref: testimonialsRef },
          ].map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <button
                onClick={() => scrollToSection(item.ref)}
                className="text-sm font-normal hover:text-primary transition-colors"
              >
                {item.name}
              </button>
            </motion.div>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ThemeToggle />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-primary/10 hover:text-primary transition-all font-normal"
              onClick={() => scrollToSection(pricingRef)}
            >
              Sign Up
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10 hover:text-primary transition-all font-normal"
              >
                Login
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  )
}

export default Header
