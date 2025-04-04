"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Layers, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { createClient } from "@/lib/supabase/client"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState("account")
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = {
    auth: { signUp: async () => ({ data: {}, error: null }) },
    from: () => ({ insert: async () => ({ error: null }) }),
  }

  // Account details
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Business details
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [phone, setPhone] = useState("")

  // Project details
  const [projectType, setProjectType] = useState("business")
  const [projectDescription, setProjectDescription] = useState("")
  const [pricingTier, setPricingTier] = useState("standard")

  const validateAccountForm = () => {
    if (!firstName) {
      setFormError("First name is required")
      return false
    }

    if (!lastName) {
      setFormError("Last name is required")
      return false
    }

    if (!email) {
      setFormError("Email is required")
      return false
    }

    if (!password) {
      setFormError("Password is required")
      return false
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match")
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address")
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

  const validateBusinessForm = () => {
    if (!companyName) {
      setFormError("Company name is required")
      return false
    }

    if (!industry) {
      setFormError("Industry is required")
      return false
    }

    if (!phone) {
      setFormError("Phone number is required")
      return false
    }

    setFormError(null)
    return true
  }

  const validateProjectForm = () => {
    if (!projectDescription) {
      setFormError("Project description is required")
      return false
    }

    setFormError(null)
    return true
  }

  const handleNextTab = () => {
    if (activeTab === "account" && validateAccountForm()) {
      setActiveTab("business")
    } else if (activeTab === "business" && validateBusinessForm()) {
      setActiveTab("project")
    }
  }

  const handlePrevTab = () => {
    if (activeTab === "business") {
      setActiveTab("account")
    } else if (activeTab === "project") {
      setActiveTab("business")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateProjectForm()) {
      return
    }

    setIsLoading(true)
    setFormError(null)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsLoading(false)
      setIsSuccess(true)
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      })
    } catch (error: any) {
      console.error("Registration error:", error)
      setFormError(error.message || "An unexpected error occurred")
      setIsLoading(false)
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
          <h1 className="text-3xl font-medium mb-4">Get started with Webstack</h1>
          <p className="text-muted-foreground mb-6 max-w-md font-light">
            Register for an account to start your website project. Our team will build, iterate, and host your website
            based on your requirements.
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
                "Webstack simplified our website development process. We provided our requirements and they delivered a
                professional website that exceeded our expectations."
              </motion.blockquote>
              <div className="mt-4 font-normal">— Michael Chen, TechInnovate</div>
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
            <CardTitle className="text-2xl font-medium">Create your account</CardTitle>
            <CardDescription className="font-light">
              Complete the registration process to get started with your website project
            </CardDescription>
          </CardHeader>

          {isSuccess ? (
            <CardContent className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-lg font-medium">Registration successful!</p>
              <p className="text-muted-foreground font-light">
                Please check your email ({email}) to verify your account.
              </p>
              <Button
                className="mt-4 w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal"
                onClick={() => (window.location.href = "/login")}
              >
                Go to login
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                {formError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="business">Business</TabsTrigger>
                    <TabsTrigger value="project">Project</TabsTrigger>
                  </TabsList>

                  <TabsContent value="account" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input
                          id="first-name"
                          className="transition-all border-muted-foreground/20 focus:border-primary"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input
                          id="last-name"
                          className="transition-all border-muted-foreground/20 focus:border-primary"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="transition-all border-muted-foreground/20 focus:border-primary"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        className="transition-all border-muted-foreground/20 focus:border-primary"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        className="transition-all border-muted-foreground/20 focus:border-primary"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal"
                      onClick={handleNextTab}
                    >
                      Next
                    </Button>
                  </TabsContent>

                  <TabsContent value="business" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        className="transition-all border-muted-foreground/20 focus:border-primary"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        className="transition-all border-muted-foreground/20 focus:border-primary"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        className="transition-all border-muted-foreground/20 focus:border-primary"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-between gap-4">
                      <Button type="button" variant="outline" className="w-1/2" onClick={handlePrevTab}>
                        Back
                      </Button>
                      <Button
                        type="button"
                        className="w-1/2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal"
                        onClick={handleNextTab}
                      >
                        Next
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="project" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-type">Project Type</Label>
                      <RadioGroup
                        defaultValue="business"
                        value={projectType}
                        onValueChange={setProjectType}
                        className="grid grid-cols-2 gap-4 pt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="business" id="business" />
                          <Label htmlFor="business">Business Website</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ecommerce" id="ecommerce" />
                          <Label htmlFor="ecommerce">E-commerce</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="portfolio" id="portfolio" />
                          <Label htmlFor="portfolio">Portfolio</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="blog" id="blog" />
                          <Label htmlFor="blog">Blog</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-description">Project Description</Label>
                      <Textarea
                        id="project-description"
                        placeholder="Describe your website requirements, goals, and any specific features you need..."
                        className="min-h-[120px] transition-all border-muted-foreground/20 focus:border-primary"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricing-tier">Pricing Tier</Label>
                      <RadioGroup
                        defaultValue="standard"
                        value={pricingTier}
                        onValueChange={setPricingTier}
                        className="grid grid-cols-1 gap-4 pt-2"
                      >
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="basic" id="basic" className="mt-1" />
                          <div>
                            <Label htmlFor="basic" className="font-medium">
                              Basic - $499
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Simple website with up to 5 pages and 2 rounds of revisions
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="standard" id="standard" className="mt-1" />
                          <div>
                            <Label htmlFor="standard" className="font-medium">
                              Standard - $999
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Professional website with up to 10 pages, 5 rounds of revisions, and basic SEO
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="premium" id="premium" className="mt-1" />
                          <div>
                            <Label htmlFor="premium" className="font-medium">
                              Premium - $1,999
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Advanced website with unlimited pages, unlimited revisions, advanced SEO, and priority
                              support
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="flex justify-between gap-4">
                      <Button type="button" variant="outline" className="w-1/2" onClick={handlePrevTab}>
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="w-1/2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity font-normal"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          "Complete Registration"
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
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
    </div>
  )
}

