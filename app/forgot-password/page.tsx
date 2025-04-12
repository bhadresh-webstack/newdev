"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Layers, Loader2, AlertCircle, CheckCircle } from "lucide-react"

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
            Enter your email address and we'll send you a link to reset your password.
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
                "The support team at Webstack is incredibly responsive. They helped me regain access to my account
                within minutes."
              </motion.blockquote>
              <div className="mt-4 font-normal">— Michael Brown, DigitalEdge</div>
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
            <CardTitle className="text-2xl font-medium">Forgot Password</CardTitle>
            <CardDescription className="font-light">Enter your email to receive a password reset link</CardDescription>
          </CardHeader>
          {isSuccess ? (
            <CardContent className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-lg font-medium">Reset Link Sent!</p>
              <p className="text-muted-foreground font-light">
                We've sent a password reset link to {email}. Please check your inbox and follow the instructions to
                reset your password.
              </p>
              <Button
                className="mt-4 w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal"
                onClick={() => setIsSuccess(false)}
              >
                Send Another Link
              </Button>
              <div className="text-center text-sm font-light mt-4">
                Remember your password?{" "}
                <Link href="/login" className="text-primary hover:underline font-normal">
                  Back to Login
                </Link>
              </div>
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
                  <Label htmlFor="email">Email</Label>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
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
                        Sending reset link...
                      </>
                    ) : (
                      "Send Reset Link"
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
