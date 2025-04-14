"use client"
import { motion } from "framer-motion"
import { Check, Zap, Shield, Star, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

const pricingTiers = [
  {
    id: "basic",
    name: "Basic",
    description: "Essential website development",
    features: ["Up to 5 pages", "Responsive design", "Contact form", "Basic SEO setup", "1 round of revisions"],
    icon: Zap,
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    id: "standard",
    name: "Standard",
    description: "Professional website with more features",
    features: [
      "Up to 10 pages",
      "Responsive design",
      "Contact form & newsletter",
      "Advanced SEO optimization",
      "Content management system",
      "3 rounds of revisions",
    ],
    icon: Shield,
    gradient: "from-primary to-purple-600",
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Advanced website with all features",
    features: [
      "Unlimited pages",
      "Responsive design",
      "Advanced forms & integrations",
      "Full SEO optimization",
      "Content management system",
      "E-commerce functionality",
      "Unlimited revisions",
    ],
    icon: Star,
    gradient: "from-amber-500 to-orange-500",
  },
]

export default function ProjectBudgetForm({ data, updateData }) {
  // Local state to ensure UI updates immediately
  const [selectedTier, setSelectedTier] = useState(data.tier || "")

  // Update local state when props change
  useEffect(() => {
    setSelectedTier(data.tier || "")
  }, [data.tier])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleTierSelect = (tierId) => {
    setSelectedTier(tierId)
    updateData({ tier: tierId })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label className="text-base font-medium">Select a Pricing Tier</Label>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {pricingTiers.map((tier) => (
            <motion.div
              key={tier.id}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => handleTierSelect(tier.id)}
              className="cursor-pointer"
            >
              <div
                className={`flex flex-col h-full p-4 border rounded-lg transition-all ${
                  selectedTier === tier.id
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-border hover:border-primary/50"
                } ${tier.recommended ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-950" : ""}`}
              >
                <input
                  type="radio"
                  name="pricing-tier"
                  id={`tier-${tier.id}`}
                  value={tier.id}
                  checked={selectedTier === tier.id}
                  onChange={() => handleTierSelect(tier.id)}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-md`}
                  >
                    <tier.icon className="h-5 w-5 text-white" />
                  </div>
                  {tier.recommended && (
                    <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="space-y-1 mb-4">
                  <p className="font-medium text-lg">{tier.name}</p>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
                <ul className="space-y-2 mt-auto">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Project Budget</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="payment-type"
              checked={data.paymentType === "fixed"}
              onCheckedChange={(checked) => {
                updateData({ paymentType: checked ? "fixed" : "hourly" })
              }}
            />
            <Label htmlFor="payment-type" className="text-sm">
              {data.paymentType === "fixed" ? "Fixed Price" : "Hourly Rate"}
            </Label>
          </div>
        </div>

        <div className="bg-muted/50 dark:bg-muted/20 p-6 rounded-lg">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{formatCurrency(data.amount || 0)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {data.paymentType === "fixed" ? "Total project budget" : "Hourly rate"}
              </div>
            </div>

            <Slider
              value={[data.amount || (data.paymentType === "fixed" ? 500 : 25)]}
              min={data.paymentType === "fixed" ? 500 : 25}
              max={data.paymentType === "fixed" ? 10000 : 200}
              step={data.paymentType === "fixed" ? 100 : 5}
              onValueChange={(value) => {
                updateData({ amount: value[0] })
              }}
              className="w-full"
            />

            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{formatCurrency(data.paymentType === "fixed" ? 500 : 25)}</span>
              <span>{formatCurrency(data.paymentType === "fixed" ? 10000 : 200)}</span>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg border border-primary/20">
          <p className="text-sm">
            <strong>Note:</strong> The budget you set will help us match you with the right developers for your project.
            You can discuss the final price with the team after they review your requirements.
          </p>
        </div>
      </div>
    </div>
  )
}
