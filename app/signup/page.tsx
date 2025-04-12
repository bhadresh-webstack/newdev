"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Layers, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { useSearchParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

// Define the plans data
const plans = [
  {
    id: "starter",
    title: "Starter",
    price: "$499",
    description: "One-time payment",
    features: [
      "5-page responsive website",
      "2 rounds of revisions",
      "Basic SEO setup",
      "Contact form integration",
      "3 months of hosting included",
    ],
    popular: false,
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    id: "business",
    title: "Business",
    price: "$999",
    description: "One-time payment",
    features: [
      "10-page responsive website",
      "4 rounds of revisions",
      "Advanced SEO optimization",
      "Blog/News section",
      "Social media integration",
      "6 months of hosting included",
    ],
    popular: true,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "enterprise",
    title: "Enterprise",
    price: "$1,999",
    description: "One-time payment",
    features: [
      "20+ page responsive website",
      "Unlimited revisions",
      "E-commerce functionality",
      "Custom integrations",
      "Priority support",
      "12 months of hosting included",
    ],
    popular: false,
    gradient: "from-amber-500 to-orange-500",
  },
]

export default function SignupPage() {
  // Use the auth store for signup functionality
  const { signUp, isLoading, error: authError, clearError } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Form state
  const [email, setEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    email: string | null
  }>({
    email: null,
  })
  const [isSuccess, setIsSuccess] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Plan selection state
  const [selectedPlan, setSelectedPlan] = useState("")
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false)

  // Check auth status and get plan from URL on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false)

      // Get the plan from URL parameters and set it
      const planParam = searchParams.get("plan")
      if (planParam) {
        setSelectedPlan(planParam)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchParams])

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
    const newErrors = {
      email: null as string | null,
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
        title: 'Registration successful!',
        description: "Please check your email to verify your account and set your password."
      })

      setIsSuccess(true)
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred. Please try again.")
    }
  }

  // Function to handle plan selection from the modal
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    setIsPlansModalOpen(false)

    // Update the URL with the selected plan
    const url = new URL(window.location.href)
    url.searchParams.set("plan", planId)
    router.push(url.pathname + url.search)
  }

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Find the current selected plan object
  const currentPlan = plans.find((plan) => plan.id === selectedPlan)

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
          <h1 className="text-3xl font-medium mb-4">Complete Your Purchase</h1>
          <p className="text-muted-foreground mb-6 max-w-md font-light">
            Enter your email to complete your purchase and get started with your new website project.
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
                "The iterative process was seamless. We could see our website evolve with each revision, and the team
                was quick to implement our feedback."
              </motion.blockquote>
              <div className="mt-4 font-normal">— Sarah Johnson, GrowFast</div>
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
            <CardTitle className="text-2xl font-medium">Checkout</CardTitle>
            <CardDescription className="font-light">Enter your email to complete your purchase</CardDescription>
          </CardHeader>
          {isSuccess ? (
            <CardContent className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-lg font-medium">Registration Successful!</p>
              <p className="text-muted-foreground font-light">
                We've sent a verification email to {email}. Please check your inbox to verify your account and set your password.
              </p>
              <Button
                className="mt-4 w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal"
                onClick={() => router.push("/")}
              >
                Return to Home
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleSignup} noValidate>
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
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
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

                {selectedPlan && (
                  <div className="space-y-2 mt-4">
                    <Label className="text-base">Selected Plan</Label>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="overflow-hidden rounded-lg border bg-card shadow-sm"
                    >
                      <div className="relative">
                        {/* Plan badge */}
                        <div className="absolute top-0 right-0">
                          <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                            Selected
                          </div>
                        </div>

                        {/* Plan header */}
                        <div className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-semibold capitalize mb-1">
                                {currentPlan?.title || "Select a plan"}
                              </h3>
                              <div className="text-sm text-muted-foreground">
                                Perfect for{" "}
                                {selectedPlan === "starter"
                                  ? "small businesses"
                                  : selectedPlan === "business"
                                    ? "growing companies"
                                    : "large organizations"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{currentPlan?.price || "-"}</div>
                              <div className="text-xs text-muted-foreground">one-time payment</div>
                            </div>
                          </div>
                        </div>

                        {/* Plan features */}
                        <div className="p-6 pt-4">
                          <ul className="space-y-2">
                            {currentPlan?.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center text-sm">
                              <div className="flex-1">Need a different plan?</div>
                              <button
                                type="button"
                                onClick={() => setIsPlansModalOpen(true)}
                                className="text-primary hover:underline font-medium"
                              >
                                View all plans
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
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
                        Processing...
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </Button>
                </motion.div>
                <div className="text-center text-sm font-light">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline font-normal">
                    Login
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </motion.div>

      {/* Plans selection modal */}
      <Dialog open={isPlansModalOpen} onOpenChange={setIsPlansModalOpen}>
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-medium">Choose a Plan</DialogTitle>
            <DialogDescription>Select the plan that best fits your business needs</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex flex-col h-full"
              >
                <Card
                  className={`border-0 ${plan.popular ? "shadow-xl shadow-primary/20" : "shadow-md hover:shadow-xl"}
                    transition-all duration-300 relative flex flex-col h-full overflow-hidden group
                    ${selectedPlan === plan.id ? "ring-2 ring-primary" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 rounded-bl-lg rounded-tr-lg bg-gradient-to-r from-primary to-purple-600 px-3 py-1 text-xs font-normal text-white">
                      Popular
                    </div>
                  )}
                  {selectedPlan === plan.id && (
                    <div className="absolute top-2 left-2 rounded-full bg-primary/10 p-1">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader>
                    <CardTitle className="font-medium">{plan.title}</CardTitle>
                    <div className="mt-4 text-4xl font-medium bg-clip-text text-transparent bg-gradient-to-r">
                      {plan.price}
                    </div>
                    <CardDescription className="mt-2 font-light">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {plan.features.map((feature, j) => (
                        <motion.li
                          key={j}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: j * 0.1 }}
                          className="flex items-start gap-2"
                        >
                          <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="font-light">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`w-full ${plan.popular ? "bg-gradient-to-r from-primary to-purple-600 hover:opacity-90" : "bg-primary hover:bg-primary/90"} transition-all font-normal`}
                    >
                      {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
