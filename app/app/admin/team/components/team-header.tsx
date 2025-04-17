"use client"

import { motion } from "framer-motion"
import { Users } from "lucide-react"

export function TeamHeader() {
  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2"
      >
        <Users className="h-6 w-6 md:h-7 md:w-7" /> Team Management
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-muted-foreground"
      >
        Manage your team members and their access permissions
      </motion.p>
    </div>
  )
}
