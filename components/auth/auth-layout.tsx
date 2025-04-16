"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Layers } from "lucide-react"

// Animation that's used across all auth pages
export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

interface AuthLayoutProps {
  children: ReactNode
  title: string
  description: string
  testimonial: {
    quote: string
    author: string
    company: string
  }
}

export default function AuthLayout({ children, title, description, testimonial }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-poppins">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full md:w-1/2 bg-gradient-to-br from-primary/20 via-purple-500/10 to-background p-8 flex flex-col justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center mb-8 hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2 mb-6">
            <Layers className="h-8 w-8 text-primary" />
            <span className="text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Webstack
            </span>
          </div>
          <h1 className="text-3xl font-medium mb-4">{title}</h1>
          <p className="text-muted-foreground mb-6 max-w-md font-light">{description}</p>
          <div className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 max-w-md"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <motion.blockquote
                className="text-lg font-normal"
                animate={{
                  opacity: [0.9, 1, 0.9],
                  transition: {
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 3,
                    ease: "easeInOut",
                  },
                }}
              >
                {testimonial.quote}
              </motion.blockquote>
              <div className="mt-4 font-normal">
                — {testimonial.author}, {testimonial.company}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full md:w-1/2 p-8 flex items-center justify-center"
      >
        {children}
      </motion.div>
    </div>
  )
}
