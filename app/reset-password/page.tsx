"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

import AuthLayout from "@/components/auth/auth-layout"
import AuthCard from "@/components/auth/auth-card"
import FormError from "@/components/auth/form-error"
import SubmitButton from "@/components/auth/submit-button"
import AuthFooter from "@/components/auth/auth-footer"
import SuccessMessage from "@/components/auth/success-message"

export default function ResetPasswordPage() {
  const { verifyToken, resetPassword, isLoading, error, clearError } = useAuthStore()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isTokenChecking, setIsTokenChecking] = useState(true)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const token = searchParams?.get("token") || ""

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

  // Verify token when component mounts
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsTokenChecking(false)
        setTokenError("Invalid or missing token. Please request a new password reset link.")
        return
      }

      try {
        const { data, error } = await verifyToken(token)

        if (error) {
          setTokenError(error)
          setIsTokenValid(false)
        } else {
          setIsTokenValid(true)
          if (data?.email) {
            setEmail(data.email)
          }
        }
      } catch (err) {
        setTokenError("Failed to verify token. Please try again.")
        setIsTokenValid(false)
      } finally {
        setIsTokenChecking(false)
      }
    }

    checkToken()
  }, [token, verifyToken])

  const validateForm = () => {
    if (!password) {
      setFormError("Password is required")
      return false
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long")
      return false
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match")
      return false
    }

    setFormError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const { error } = await resetPassword(token, password)

    if (!error) {
      setIsSuccess(true)
      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password.",
      })
    } else {
      setFormError(error)
    }
  }

  // Show loading state while checking token
  if (isTokenChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Create a new password for your account to securely access your projects."
      testimonial={{
        quote:
          "Security is our top priority. We ensure your account is protected with strong password policies and regular security updates.",
        author: "Webstack Security Team",
        company: "",
      }}
    >
      <AuthCard
        title="Reset Password"
        description={isTokenValid ? `Create a new password for ${email}` : "Verify your reset token"}
      >
        {!isTokenValid ? (
          <CardContent className="space-y-4 text-center">
            <FormError error={tokenError} />
            <Button
              className="mt-4 w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal"
              onClick={() => router.push("/forgot-password")}
            >
              Request New Reset Link
            </Button>
            <div className="text-center text-sm font-light mt-4">
              <AuthFooter text="Remember your password?" linkText="Back to Login" linkHref="/login" />
            </div>
          </CardContent>
        ) : isSuccess ? (
          <CardContent className="space-y-4">
            <SuccessMessage
              title="Password Reset Successful!"
              message="Your password has been reset successfully. You can now log in with your new password."
              buttonText="Go to Login"
              onButtonClick={() => router.push("/login")}
            />
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-4">
              <FormError error={formError} />

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="transition-all border-muted-foreground/20 focus:border-primary pr-10"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (formError) setFormError(null)
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className="transition-all border-muted-foreground/20 focus:border-primary"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (formError) setFormError(null)
                  }}
                />
              </div>
            </CardContent>

            <div className="px-6 pb-6 pt-2 space-y-4">
              <SubmitButton isLoading={isLoading} loadingText="Resetting password..." text="Reset Password" />
              <AuthFooter text="Remember your password?" linkText="Back to Login" linkHref="/login" />
            </div>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  )
}
