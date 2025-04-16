"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { CardContent } from "@/components/ui/card"

import AuthLayout from "@/components/auth/auth-layout"
import AuthCard from "@/components/auth/auth-card"
import FormError from "@/components/auth/form-error"
import SubmitButton from "@/components/auth/submit-button"
import AuthFooter from "@/components/auth/auth-footer"
import SuccessMessage from "@/components/auth/success-message"
import EmailInput from "@/components/auth/email-input"
import SelectedPlanDisplay from "@/components/plans/selected-plan-display"
import PlansModal from "@/components/plans/plans-modal"
import { useSignupForm } from "@/hooks/use-signup-form"
import type { PlanType } from "@/lib/types"

// Define the plans data
const plans: PlanType[] = [
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
  const router = useRouter()
  const searchParams = useSearchParams()

  // Form state and handlers from custom hook
  const {
    email,
    setEmail,
    formError,
    errors,
    isSuccess,
    isLoading,
    handleSignup,
    clearEmailError,
    clearFormErrorState,
  } = useSignupForm()

  // Plan selection state
  const [selectedPlan, setSelectedPlan] = useState("")
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

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
    <AuthLayout
      title="Complete Your Purchase"
      description="Enter your email to complete your purchase and get started with your new website project."
      testimonial={{
        quote:
          "The iterative process was seamless. We could see our website evolve with each revision, and the team was quick to implement our feedback.",
        author: "Sarah Johnson",
        company: "GrowFast",
      }}
    >
      <AuthCard title="Checkout" description="Enter your email to complete your purchase">
        {isSuccess ? (
          <CardContent className="space-y-4">
            <SuccessMessage
              title="Registration Successful!"
              message={`We've sent a verification email to ${email}. Please check your inbox to verify your account and set your password.`}
              buttonText="Return to Home"
              onButtonClick={() => router.push("/")}
            />
          </CardContent>
        ) : (
          <form onSubmit={handleSignup} noValidate>
            <CardContent className="space-y-4">
              <FormError error={formError} />

              <EmailInput
                email={email}
                setEmail={setEmail}
                error={errors.email}
                clearError={clearEmailError}
                clearFormError={clearFormErrorState}
              />

              {selectedPlan && (
                <SelectedPlanDisplay
                  plan={currentPlan}
                  selectedPlan={selectedPlan}
                  onViewAllPlans={() => setIsPlansModalOpen(true)}
                />
              )}
            </CardContent>

            <div className="px-6 pb-6 pt-2 space-y-4">
              <SubmitButton isLoading={isLoading} loadingText="Processing..." text="Complete Registration" />
              <AuthFooter text="Already have an account?" linkText="Login" linkHref="/login" />
            </div>
          </form>
        )}
      </AuthCard>

      {/* Plans selection modal */}
      <PlansModal
        isOpen={isPlansModalOpen}
        onOpenChange={setIsPlansModalOpen}
        plans={plans}
        selectedPlan={selectedPlan}
        onSelectPlan={handlePlanSelect}
      />
    </AuthLayout>
  )
}
