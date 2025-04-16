"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PlanCard from "@/components/plans/plan-card"
import type { PlanType } from "@/lib/types"

interface PlansModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  plans: PlanType[]
  selectedPlan: string
  onSelectPlan: (planId: string) => void
}

export default function PlansModal({ isOpen, onOpenChange, plans, selectedPlan, onSelectPlan }: PlansModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium">Choose a Plan</DialogTitle>
          <DialogDescription>Select the plan that best fits your business needs</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} selectedPlan={selectedPlan} onSelect={onSelectPlan} isModal={true} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
