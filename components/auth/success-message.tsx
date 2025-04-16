"use client"

import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessMessageProps {
  title: string
  message: string
  buttonText: string
  onButtonClick: () => void
}

export default function SuccessMessage({ title, message, buttonText, onButtonClick }: SuccessMessageProps) {
  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
      </div>
      <p className="text-lg font-medium">{title}</p>
      <p className="text-muted-foreground font-light">{message}</p>
      <Button
        className="mt-4 w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal"
        onClick={onButtonClick}
      >
        {buttonText}
      </Button>
    </div>
  )
}
