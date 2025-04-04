"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CalendarIcon, Clock, Flame, Hourglass } from "lucide-react"
import { format, addDays } from "date-fns"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export default function ProjectTimelineForm({ data, updateData }) {
  const [estimatedEndDate, setEstimatedEndDate] = useState(addDays(data.startDate, data.duration))

  useEffect(() => {
    setEstimatedEndDate(addDays(data.startDate, data.duration))
  }, [data.startDate, data.duration])

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label className="text-base font-medium">Project Duration (in days)</Label>

        <div className="bg-muted/50 dark:bg-muted/20 p-6 rounded-lg">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
              <Hourglass className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{data.duration} days</div>
              <div className="text-sm text-muted-foreground mt-1">Estimated project duration</div>
            </div>

            <Slider
              value={[data.duration]}
              min={7}
              max={180}
              step={1}
              onValueChange={(value) => updateData({ duration: value[0] })}
              className="w-full"
            />

            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>1 week</span>
              <span>6 months</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Project Start Date</Label>

        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !data.startDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.startDate ? format(data.startDate, "PPP") : "Select a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.startDate}
                onSelect={(date) => updateData({ startDate: date })}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center p-4 bg-muted/50 dark:bg-muted/20 rounded-lg">
          <Clock className="h-5 w-5 text-muted-foreground mr-2" />
          <span className="text-sm">
            Estimated completion date: <strong>{format(estimatedEndDate, "PPP")}</strong>
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Project Priority</Label>

        <RadioGroup
          value={data.priority}
          onValueChange={(value) => updateData({ priority: value })}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              id: "low",
              name: "Low",
              description: "No urgent deadline",
              icon: Hourglass,
              gradient: "from-blue-500 to-cyan-400",
            },
            {
              id: "medium",
              name: "Medium",
              description: "Needed soon",
              icon: Clock,
              gradient: "from-primary to-purple-600",
            },
            {
              id: "high",
              name: "High",
              description: "Urgent project",
              icon: Flame,
              gradient: "from-amber-500 to-orange-500",
            },
          ].map((priority) => (
            <motion.div key={priority.id} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Label
                htmlFor={priority.id}
                className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                  data.priority === priority.id
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value={priority.id} id={priority.id} className="sr-only" />
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${priority.gradient} flex items-center justify-center shadow-md`}
                  >
                    <priority.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{priority.name}</p>
                    <p className="text-sm text-muted-foreground">{priority.description}</p>
                  </div>
                </div>
              </Label>
            </motion.div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}

