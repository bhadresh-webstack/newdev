"use client"

import { motion } from "framer-motion"
import {
  Briefcase,
  ClipboardList,
  CreditCard,
  Calendar,
  CheckCircle,
  Code,
  Zap,
  DollarSign,
  Clock,
  Flame,
  Hourglass,
  Shield,
  Star,
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

const tierIcons = {
  basic: { icon: Zap, gradient: "from-blue-500 to-cyan-400" },
  standard: { icon: Shield, gradient: "from-primary to-purple-600" },
  premium: { icon: Star, gradient: "from-amber-500 to-orange-500" },
}

const priorityIcons = {
  low: { icon: Hourglass, gradient: "from-blue-500 to-cyan-400" },
  medium: { icon: Clock, gradient: "from-primary to-purple-600" },
  high: { icon: Flame, gradient: "from-amber-500 to-orange-500" },
}

export default function ProjectReviewForm({ data, onSubmit, isSubmitting }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const tierInfo = tierIcons[data.budget.tier]
  const TierIcon = tierInfo?.icon || Shield
  const tierGradient = tierInfo?.gradient || "from-primary to-purple-600"

  const priorityInfo = priorityIcons[data.timeline.priority]
  const PriorityIcon = priorityInfo?.icon || Clock
  const priorityGradient = priorityInfo?.gradient || "from-primary to-purple-600"

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4 shadow-lg">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold">Review Your Project</h2>
        <p className="text-muted-foreground">Please review all the information before submitting</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-lg border shadow-sm overflow-hidden"
        >
          <div className="bg-primary/5 dark:bg-primary/10 p-4 flex items-center">
            <Briefcase className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-medium">Project Details</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <p className="font-medium">{data.details.title || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p>{data.details.category || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm line-clamp-3">{data.details.description || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Visibility</p>
              <p className="capitalize">{data.details.visibility}</p>
            </div>
          </div>
        </motion.div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg border shadow-sm overflow-hidden"
        >
          <div className="bg-primary/5 dark:bg-primary/10 p-4 flex items-center">
            <ClipboardList className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-medium">Requirements</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Technical Requirements</p>
              <p className="text-sm line-clamp-2">{data.requirements.technicalRequirements || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Required Skills</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {data.requirements.skills.length > 0 ? (
                  data.requirements.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-2 py-1 text-xs bg-primary/10 dark:bg-primary/20 flex items-center gap-1"
                    >
                      <Code className="h-3 w-3 text-primary" />
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm italic">None specified</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deliverables</p>
              {data.requirements.deliverables.length > 0 ? (
                <ul className="text-sm list-disc list-inside">
                  {data.requirements.deliverables.map((deliverable, index) => (
                    <li key={index}>{deliverable}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic">None specified</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Budget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-lg border shadow-sm overflow-hidden"
        >
          <div className="bg-primary/5 dark:bg-primary/10 p-4 flex items-center">
            <CreditCard className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-medium">Budget</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${tierGradient} flex items-center justify-center shadow-md mr-3`}
              >
                <TierIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium capitalize">{data.budget.tier} Tier</p>
                <p className="text-sm text-muted-foreground">Selected pricing package</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget Amount</p>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                  <p className="font-medium">{formatCurrency(data.budget.amount)}</p>
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {data.budget.paymentType} Price
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg border shadow-sm overflow-hidden"
        >
          <div className="bg-primary/5 dark:bg-primary/10 p-4 flex items-center">
            <Calendar className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-medium">Timeline</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${priorityGradient} flex items-center justify-center shadow-md mr-3`}
              >
                <PriorityIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium capitalize">{data.timeline.priority} Priority</p>
                <p className="text-sm text-muted-foreground">Project urgency level</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{data.timeline.duration} days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{format(data.timeline.startDate, "PPP")}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg border border-primary/20 mt-6">
        <p className="text-sm">
          <strong>Note:</strong> By submitting this project, you agree to our terms of service and privacy policy. Our
          team will review your project details and get back to you within 24-48 hours.
        </p>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 transition-opacity shadow-md px-8 py-6 text-lg"
        >
          {isSubmitting ? "Submitting..." : "Submit Project"}
          <CheckCircle className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

