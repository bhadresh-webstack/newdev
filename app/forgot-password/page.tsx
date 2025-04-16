"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent } from "@/components/ui/card"

import AuthLayout from "@/components/auth/auth-layout"
import AuthCard from "@/components/auth/auth-card"
import FormError from "@/components/auth/form-error"
import SubmitButton from "@/components/auth/submit-button"
import AuthFooter from "@/components/auth/auth-footer"
import SuccessMessage from "@/components/auth/success-message"

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  // Clear any auth store errors when component unmounts
  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  // Update form error if auth store has an error
  useEffect(() => {
    if (error) {
      setFormError(error)
    }
  }, [error])

  const validateEmail = () => {
    if (!email) {
      setFormError("Email is required")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address")
      return false
    }

    setFormError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail()) {
      return
    }

    const { error } = await forgotPassword(email)

    if (!error) {
      setIsSuccess(true)
      toast({
        title: "Reset link sent",
        description: "Check your email for password reset instructions",
      })
    } else {
      setFormError(error)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your email address and we'll send you a link to reset your password."
      testimonial={{
        quote:
          "The support team at Webstack is incredibly responsive. They helped me regain access to my account within minutes.",
        author: "Michael Brown",
        company: "DigitalEdge",
      }}
    >
      <AuthCard title="Forgot Password" description="Enter your email to receive a password reset link">
        {isSuccess ? (
          <CardContent className="space-y-4">
            <SuccessMessage
              title="Reset Link Sent!"
              message={`We've sent a password reset link to ${email}. Please check your inbox and follow the instructions to reset your password.`}
              buttonText="Send Another Link"
              onButtonClick={() => setIsSuccess(false)}
            />
            <div className="text-center text-sm font-light mt-4">
              <AuthFooter text="Remember your password?" linkText="Back to Login" linkHref="/login" />
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-4">
              <FormError error={formError} />

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    className="transition-all border-muted-foreground/20 focus:border-primary"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (formError) setFormError(null)
                    }}
                  />
                </motion.div>
              </div>
            </CardContent>

            <div className="px-6 pb-6 pt-2 space-y-4">
              <SubmitButton isLoading={isLoading} loadingText="Sending reset link..." text="Send Reset Link" />
              <AuthFooter text="Remember your password?" linkText="Back to Login" linkHref="/login" />
            </div>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  )
}
