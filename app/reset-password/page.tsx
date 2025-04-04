"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Layers, Loader2, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Alert, AlertDescription } from "@/components/ui/alert"

import axios from "axios"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

export default function ResetPasswordPage() {

  const {resetPassword , isLoading} =useAuthStore()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [token,setToken] = useState("")
  // const { updatePassword, isLoading, error, clearError } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()


  useEffect(() => {
    // Check if we have the necessary parameters from the email link
    // if (!searchParams.has("type") || searchParams.get("type") !== "recovery") {
    const tokenFromUrl = searchParams.get("token")
    if(!tokenFromUrl){
      toast({
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired",
        variant: "destructive",
      })
    }
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      // router.replace("/reset-password", undefined);
    }


    // clearError()
  // }, [searchParams, toast, clearError])
  }, [searchParams, toast])

  const validateForm = () => {
    if (!password) {
      setFormError("Password is required")
      return false
    }

    if (!confirmPassword) {
      setFormError("Please confirm your password")
      return false
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match")
      return false
    }

    // Password strength validation
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long")
      return false
    }

    setFormError(null)
    return true
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }


      // Simulate API delay
      const res = await resetPassword(token,password)
      if (!res.error) {
        setIsSuccess(true)
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully",
        })
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
          <Link href="/login" className="inline-flex items-center mb-8 hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
          <div className="flex items-center gap-2 mb-6">
            <Layers className="h-8 w-8 text-primary" />
            <span className="text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Webstack
            </span>
          </div>
          <h1 className="text-3xl font-medium mb-4">Reset your password</h1>
          <p className="text-muted-foreground mb-6 max-w-md font-light">Create a new password for your account.</p>
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
            <CardTitle className="text-2xl font-medium">Create new password</CardTitle>
            <CardDescription className="font-light">Enter a new password for your account</CardDescription>
          </CardHeader>
          {isSuccess ? (
            <CardContent className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <p className="text-lg font-medium">Password updated</p>
              <p className="text-muted-foreground font-light">Your password has been updated successfully</p>
              <Button
                className="mt-4 w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal"
                onClick={() => router.push("/login")}
              >
                Back to login
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-4">
                {(formError) && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError }</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Input
                      id="password"
                      type="password"
                      className="transition-all border-muted-foreground/20 focus:border-primary"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Input
                      id="confirm-password"
                      type="password"
                      className="transition-all border-muted-foreground/20 focus:border-primary"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </motion.div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal"
                    // disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating password...
                      </>
                    ) : (
                      "Update password"
                    )}
                  </Button>
                </motion.div>
              </CardFooter>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
