"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  CreditCard,
  Calendar,
  CheckCircle,
  ArrowUpCircle,
  Download,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Mock data for the current subscription
const currentSubscription = {
  plan: "Professional",
  status: "Active",
  price: 49.99,
  billingCycle: "Monthly",
  nextBillingDate: "April 15, 2025",
  features: [
    "Up to 10 active projects",
    "Unlimited team members",
    "Priority support",
    "Advanced analytics",
    "Custom domain",
  ],
}

// Mock data for available plans
const availablePlans = [
  {
    id: "basic",
    name: "Basic",
    price: 19.99,
    billingCycle: "Monthly",
    features: ["Up to 3 active projects", "2 team members", "Basic support", "Standard analytics"],
    recommended: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 49.99,
    billingCycle: "Monthly",
    features: [
      "Up to 10 active projects",
      "Unlimited team members",
      "Priority support",
      "Advanced analytics",
      "Custom domain",
    ],
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99.99,
    billingCycle: "Monthly",
    features: [
      "Unlimited projects",
      "Unlimited team members",
      "24/7 dedicated support",
      "Advanced analytics with custom reports",
      "Custom domain",
      "White-labeling",
      "API access",
    ],
    recommended: false,
  },
]

// Mock data for payment history
const paymentHistory = [
  {
    id: "INV-001",
    date: "March 15, 2025",
    amount: 49.99,
    status: "Paid",
    description: "Professional Plan - Monthly",
  },
  {
    id: "INV-002",
    date: "February 15, 2025",
    amount: 49.99,
    status: "Paid",
    description: "Professional Plan - Monthly",
  },
  {
    id: "INV-003",
    date: "January 15, 2025",
    amount: 49.99,
    status: "Paid",
    description: "Professional Plan - Monthly",
  },
  {
    id: "INV-004",
    date: "December 15, 2024",
    amount: 49.99,
    status: "Paid",
    description: "Professional Plan - Monthly",
  },
]

// Mock data for payment methods
const paymentMethods = [
  {
    id: "pm-001",
    type: "Visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2026,
    isDefault: true,
  },
  {
    id: "pm-002",
    type: "Mastercard",
    last4: "5555",
    expMonth: 8,
    expYear: 2025,
    isDefault: false,
  },
]

export default function PaymentsPage() {
  const [selectedPlan, setSelectedPlan] = useState(currentSubscription.plan.toLowerCase())
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showAddCardDialog, setShowAddCardDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setShowUpgradeDialog(false)
      // Show success message or redirect
    }, 1500)
  }

  const handleCancel = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setShowCancelDialog(false)
      // Show success message or redirect
    }, 1500)
  }

  const handleAddCard = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setShowAddCardDialog(false)
      // Show success message or refresh payment methods
    }, 1500)
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-semibold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">Manage your subscription and payment methods.</p>
      </motion.div>

      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {/* Current Subscription */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Current Subscription</CardTitle>
                    <CardDescription>Your current plan and billing details</CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    {currentSubscription.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">{currentSubscription.plan} Plan</h3>
                    <p className="text-muted-foreground">
                      ${currentSubscription.price}/
                      {currentSubscription.billingCycle.toLowerCase() === "monthly" ? "month" : "year"}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <ArrowUpCircle className="mr-2 h-4 w-4" />
                          Change Plan
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Change Subscription Plan</DialogTitle>
                          <DialogDescription>Select a new plan that better fits your needs.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="billing-cycle">Billing Cycle</Label>
                            <Select value={billingCycle} onValueChange={setBillingCycle}>
                              <SelectTrigger id="billing-cycle" className="w-[180px]">
                                <SelectValue placeholder="Select billing cycle" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly (Save 20%)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid gap-4">
                            {availablePlans.map((plan) => (
                              <div key={plan.id} className="relative">
                                <RadioGroupItem value={plan.id} id={plan.id} className="peer sr-only" />
                                <Label
                                  htmlFor={plan.id}
                                  className="flex flex-col space-y-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                  <div className="flex justify-between">
                                    <div className="font-semibold">{plan.name}</div>
                                    <div>
                                      ${billingCycle === "yearly" ? (plan.price * 0.8 * 12).toFixed(2) : plan.price}/
                                      {billingCycle === "yearly" ? "year" : "month"}
                                    </div>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    <ul className="list-disc pl-5 space-y-1">
                                      {plan.features.slice(0, 3).map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                      ))}
                                      {plan.features.length > 3 && <li>+{plan.features.length - 3} more features</li>}
                                    </ul>
                                  </div>
                                </Label>
                                {plan.recommended && (
                                  <Badge className="absolute -top-2 -right-2 bg-primary">Recommended</Badge>
                                )}
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpgrade} disabled={isLoading}>
                            {isLoading ? "Processing..." : "Confirm Change"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Cancel Subscription</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancel Subscription</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to cancel your subscription? You'll lose access to premium features.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                              Your subscription will be canceled immediately and you'll lose access to all premium
                              features.
                            </AlertDescription>
                          </Alert>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                            Keep Subscription
                          </Button>
                          <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
                            {isLoading ? "Processing..." : "Confirm Cancellation"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Billing Details</h4>
                    <div className="rounded-md border p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Billing Cycle</span>
                        <span>{currentSubscription.billingCycle}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Next Billing Date</span>
                        <span>{currentSubscription.nextBillingDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span>•••• 4242 (Visa)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Plan Features</h4>
                    <div className="rounded-md border p-4">
                      <ul className="space-y-2">
                        {currentSubscription.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Available Plans */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>Compare our subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  {availablePlans.map((plan) => (
                    <Card key={plan.id} className={`overflow-hidden ${plan.recommended ? "border-primary" : ""}`}>
                      {plan.recommended && (
                        <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                          Recommended
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <div className="mt-1">
                          <span className="text-2xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground">
                            /{plan.billingCycle.toLowerCase() === "monthly" ? "month" : "year"}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          variant={plan.name === currentSubscription.plan ? "outline" : "default"}
                          disabled={plan.name === currentSubscription.plan}
                          onClick={() => {
                            setSelectedPlan(plan.id)
                            setShowUpgradeDialog(true)
                          }}
                        >
                          {plan.name === currentSubscription.plan ? "Current Plan" : "Select Plan"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history" className="space-y-6">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View your past payments and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 font-medium border-b">
                    <div>Invoice</div>
                    <div>Date</div>
                    <div>Amount</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="grid grid-cols-5 p-4 border-b last:border-0 items-center">
                      <div>{payment.id}</div>
                      <div>{payment.date}</div>
                      <div>${payment.amount.toFixed(2)}</div>
                      <div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Invoice
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="methods" className="space-y-6">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your saved payment methods</CardDescription>
                  </div>
                  <Dialog open={showAddCardDialog} onOpenChange={setShowAddCardDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>Add a new credit or debit card to your account.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="card-name">Cardholder Name</Label>
                          <Input id="card-name" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="card-number">Card Number</Label>
                          <Input id="card-number" placeholder="4242 4242 4242 4242" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input id="expiry" placeholder="MM/YY" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="123" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="default-card" className="rounded border-gray-300" />
                          <Label htmlFor="default-card">Make default payment method</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddCardDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddCard} disabled={isLoading}>
                          {isLoading ? "Processing..." : "Add Card"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {method.type} •••• {method.last4}
                            {method.isDefault && (
                              <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                Default
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Expires {method.expMonth}/{method.expYear}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" disabled={method.isDefault}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
                <CardDescription>Your billing address for invoices and receipts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue="John Doe" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="company">Company (Optional)</Label>
                      <Input id="company" defaultValue="Acme Inc." className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" defaultValue="123 Main St" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" defaultValue="San Francisco" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="state">State / Province</Label>
                      <Input id="state" defaultValue="CA" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP / Postal Code</Label>
                      <Input id="zip" defaultValue="94103" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select defaultValue="us">
                      <SelectTrigger id="country" className="mt-1">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Address</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

