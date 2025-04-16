"use client"

import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { PlanType } from "@/lib/types"

interface PlanCardProps {
  plan: PlanType
  selectedPlan: string
  onSelect: (planId: string) => void
  isModal?: boolean
}

export default function PlanCard({ plan, selectedPlan, onSelect, isModal = false }: PlanCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }} className="flex flex-col h-full">
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
          <div className="mt-4 text-4xl font-medium bg-clip-text text-transparent bg-gradient-to-r">{plan.price}</div>
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
            onClick={() => onSelect(plan.id)}
            className={`w-full ${plan.popular ? "bg-gradient-to-r from-primary to-purple-600 hover:opacity-90" : "bg-primary hover:bg-primary/90"} transition-all font-normal`}
          >
            {selectedPlan === plan.id ? "Selected" : "Select Plan"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
