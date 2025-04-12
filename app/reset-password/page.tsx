"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Layers, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthStore } from "@/lib/stores/auth-store"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

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
          <h1 className="text-3xl font-medium mb-4">Reset your password</h1>
          <p className="text-muted-foreground mb-6 max-w-md font-light">
            Create a new password for your account to securely access your projects.
          </p>
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
                "Security is our top priority. We ensure your account is protected with strong password policies and
                regular security updates."
              </motion.blockquote>
              <div className="mt-4 font-normal">— Webstack Security Team</div>
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
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-medium">Reset Password</CardTitle>
            <CardDescription className="font-light">
              {isTokenValid ? `Create a new password for ${email}` : "Verify your reset token"}
            </CardDescription>
          </CardHeader>

          {!isTokenValid ? (
            <CardContent className="space-y-4 text-center">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{tokenError}</AlertDescription>
              </Alert>
              <Button
                className="mt-4 w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal"
                onClick={() => router.push("/forgot-password")}
              >
                Request New Reset Link
              </Button>
              <div className="text-center text-sm font-light mt-4">
                Remember your password?{" "}
                <Link href="/login" className="text-primary hover:underline font-normal">
                  Back to Login
                </Link>
              </div>
            </CardContent>
          ) : isSuccess ? (
            <CardContent className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-lg font-medium">Password Reset Successful!</p>
              <p className="text-muted-foreground font-light">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <Button
                className="mt-4 w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal"
                onClick={() => router.push("/login")}
              >
                Go to Login
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <CardContent className="space-y-4">
                {formError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

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
              <CardFooter className="flex flex-col space-y-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </motion.div>
                <div className="text-center text-sm font-light">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary hover:underline font-normal">
                    Back to Login
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
