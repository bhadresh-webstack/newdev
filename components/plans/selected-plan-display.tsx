"use client"

import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import type { PlanType } from "@/lib/types"

interface SelectedPlanDisplayProps {
  plan: PlanType | undefined
  selectedPlan: string
  onViewAllPlans: () => void
}

export default function SelectedPlanDisplay({ plan, selectedPlan, onViewAllPlans }: SelectedPlanDisplayProps) {
  if (!plan) return null

  return (
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
                <h3 className="text-xl font-semibold capitalize mb-1">{plan.title}</h3>
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
                <div className="text-2xl font-bold">{plan.price}</div>
                <div className="text-xs text-muted-foreground">one-time payment</div>
              </div>
            </div>
          </div>

          {/* Plan features */}
          <div className="p-6 pt-4">
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center text-sm">
                <div className="flex-1">Need a different plan?</div>
                <button type="button" onClick={onViewAllPlans} className="text-primary hover:underline font-medium">
                  View all plans
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
