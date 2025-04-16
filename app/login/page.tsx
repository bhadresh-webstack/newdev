"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/stores/auth-store"
import Link from "next/link"

import AuthLayout from "@/components/auth/auth-layout"
import AuthCard from "@/components/auth/auth-card"
import FormError from "@/components/auth/form-error"
import SubmitButton from "@/components/auth/submit-button"
import AuthFooter from "@/components/auth/auth-footer"

export default function LoginPage() {
  const { signIn, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    email: string | null
    password: string | null
  }>({
    email: null,
    password: null,
  })

  const router = useRouter()
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

  const validateForm = () => {
    const newErrors: {
      email: string | null
      password: string | null
    } = {
      email: null,
      password: null,
    }
    let isValid = true

    // Check if email is empty
    if (!email) {
      newErrors.email = "Email is required"
      isValid = false
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address"
        isValid = false
      }
    }

    // Check if password is empty
    if (!password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (password.length < 6) {
      // Password length validation
      newErrors.password = "Password must be at least 6 characters long"
      isValid = false
    }

    setErrors(newErrors)

    // Set overall form error for the alert
    if (!isValid) {
      setFormError("Please correct the errors below")
    } else {
      setFormError(null)
    }

    return isValid
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form before proceeding
    if (!validateForm()) {
      return
    }

    // Clear any previous errors
    setFormError(null)

    const res = await signIn(email, password)
    if (!res.error) {
      toast({
        title: "Login successful",
        description: "Welcome back to Webstack!",
      })

      // Redirect to dashboard after successful login
      router.push("/app")
    } else {
      setFormError(res.error)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to your account to continue managing your website development projects and track your progress."
      testimonial={{
        quote:
          "Webstack transformed our online presence. The team was professional and delivered a website that exceeded our expectations.",
        author: "John Doe",
        company: "TechStart",
      }}
    >
      <AuthCard title="Login to Webstack" description="Enter your email and password to access your account">
        <form onSubmit={handleLogin} noValidate>
          <div className="space-y-4 px-6 pb-4">
            <FormError error={formError} />

            <div className="space-y-2">
              <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>
                Email
              </Label>
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  className={`transition-all border-muted-foreground/20 focus:border-primary ${errors.email ? "border-destructive focus:border-destructive" : ""}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) {
                      setErrors({ ...errors, email: null })
                    }
                    if (formError) {
                      setFormError(null)
                    }
                  }}
                />
                {errors.email && (
                  <div className="mt-2 flex items-center text-sm font-medium text-destructive bg-destructive/10 p-2 rounded">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </motion.div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>
                  Password
                </Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <Input
                  id="password"
                  type="password"
                  className={`transition-all border-muted-foreground/20 focus:border-primary ${errors.password ? "border-destructive focus:border-destructive" : ""}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) {
                      setErrors({ ...errors, password: null })
                    }
                    if (formError) {
                      setFormError(null)
                    }
                  }}
                />
                {errors.password && (
                  <div className="mt-2 flex items-center text-sm font-medium text-destructive bg-destructive/10 p-2 rounded">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          <div className="px-6 pb-6 pt-2 space-y-4">
            <SubmitButton isLoading={isLoading} loadingText="Logging in..." text="Login" />
            <AuthFooter text="Don't have an account?" linkText="Sign up" linkHref="/signup" />
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
