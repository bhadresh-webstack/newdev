"use client"

import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EmailInputProps {
  email: string
  setEmail: (email: string) => void
  error: string | null | undefined
  clearError: () => void
  clearFormError?: () => void
}

export default function EmailInput({ email, setEmail, error, clearError, clearFormError }: EmailInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email" className={error ? "text-destructive" : ""}>
        Email
      </Label>
      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          className={`transition-all border-muted-foreground/20 focus:border-primary ${error ? "border-destructive focus:border-destructive" : ""}`}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) {
              clearError()
            }
            if (clearFormError) {
              clearFormError()
            }
          }}
        />
        {error && (
          <div className="mt-2 flex items-center text-sm font-medium text-destructive bg-destructive/10 p-2 rounded">
            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </motion.div>
    </div>
  )
}
