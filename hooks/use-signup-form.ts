"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import type { FormErrors } from "@/lib/types"

export function useSignupForm() {
  const { signUp, isLoading, error: authError, clearError } = useAuthStore()
  const { toast } = useToast()

  // Form state
  const [email, setEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({
    email: null,
  })
  const [isSuccess, setIsSuccess] = useState(false)

  // Reset form error when auth store error changes
  useEffect(() => {
    if (authError) {
      setFormError(authError)
    }

    return () => {
      // Clear auth store error when component unmounts
      clearError()
    }
  }, [authError, clearError])

  // Form validation
  const validateForm = () => {
    const newErrors: FormErrors = {
      email: null,
    }
    let isValid = true

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

    setErrors(newErrors)

    // Set overall form error for the alert
    if (!isValid) {
      setFormError("Please enter a valid email address")
    } else {
      setFormError(null)
    }

    return isValid
  }

  // Handle signup form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    // Force validation on submit
    if (!validateForm()) {
      return
    }

    setFormError(null)

    try {
      // Call the signUp function from auth store
      const { data, error } = await signUp(email, userName)

      if (error) {
        setFormError(error)
        return
      }

      // Show success toast and set success state
      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account and set your password.",
      })

      setIsSuccess(true)
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred. Please try again.")
    }
  }

  const clearEmailError = () => {
    setErrors({ ...errors, email: null })
  }

  const clearFormErrorState = () => {
    setFormError(null)
  }

  return {
    email,
    setEmail,
    userName,
    setUserName,
    formError,
    setFormError,
    errors,
    isSuccess,
    setIsSuccess,
    isLoading,
    validateForm,
    handleSignup,
    clearEmailError,
    clearFormErrorState,
  }
}
