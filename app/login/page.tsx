"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Layers, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

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
          <h1 className="text-3xl font-medium mb-4">Welcome back</h1>
          <p className="text-muted-foreground mb-6 max-w-md font-light">
            Log in to your account to continue managing your website development projects and track your progress.
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
                "Webstack transformed our online presence. The team was professional and delivered a website that
                exceeded our expectations."
              </motion.blockquote>
              <div className="mt-4 font-normal">— John Doe, TechStart</div>
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
            <CardTitle className="text-2xl font-medium">Login to Webstack</CardTitle>
            <CardDescription className="font-light">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin} noValidate>
            <CardContent className="space-y-4">
              {formError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

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
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </motion.div>
              <div className="text-center text-sm font-light">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-normal">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
