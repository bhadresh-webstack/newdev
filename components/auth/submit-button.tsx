"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SubmitButtonProps {
  isLoading: boolean
  loadingText: string
  text: string
}

export default function SubmitButton({ isLoading, loadingText, text }: SubmitButtonProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText}
          </>
        ) : (
          text
        )}
      </Button>
    </motion.div>
  )
}
