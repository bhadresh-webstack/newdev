"use client"
import { motion } from "framer-motion"
import { Globe, Lock } from "lucide-react"
import { useState, useEffect } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DetailsData {
  title: string
  category: string
  description: string
  visibility: string
  errors?: {
    title?: string
    category?: string
    description?: string
  }
}

interface ProjectDetailsFormProps {
  data: DetailsData
  updateData: (data: Partial<DetailsData>) => void
}

const categories = [
  "Web Development",
  "Mobile App",
  "UI/UX Design",
  "E-commerce",
  "CMS",
  "Landing Page",
  "Blog/News Site",
  "Portfolio",
  "Other",
]

export default function ProjectDetailsForm({ data, updateData }: ProjectDetailsFormProps) {
  const [errors, setErrors] = useState<{
    title: string
    category: string
    description: string
  }>({
    title: "",
    category: "",
    description: "",
  })

  // Update local errors when they come from parent component
  useEffect(() => {
    if (data.errors) {
      setErrors(data.errors as any)
    }
  }, [data.errors])

  // Fix the handleChange function with proper types
  const handleChange = (field: keyof DetailsData, value: string) => {
    updateData({ [field]: value })

    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  // Fix the validateField function with proper types
  const validateField = (field: keyof DetailsData, value: string): string => {
    switch (field) {
      case "title":
        return !value.trim() ? "Project title is required" : ""
      case "category":
        return !value ? "Please select a category" : ""
      case "description":
        return !value.trim()
          ? "Project description is required"
          : value.trim().length < 20
            ? "Description should be at least 20 characters"
            : ""
      default:
        return ""
    }
  }

  // Fix the handleBlur function with proper types
  const handleBlur = (field: keyof DetailsData, value: string) => {
    const errorMessage = validateField(field, value)
    setErrors((prev) => ({
      ...prev,
      [field]: errorMessage,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-medium">
          Project Title
        </Label>
        <Input
          id="title"
          placeholder="Enter a clear, descriptive title for your project"
          value={data.title}
          onChange={(e) => handleChange("title", e.target.value)}
          onBlur={(e) => handleBlur("title", e.target.value)}
          className={`h-12 ${errors.title ? "border-red-500" : ""}`}
        />
        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
        <p className="text-sm text-muted-foreground">
          A good title clearly identifies what you need (e.g., "E-commerce Website with Custom Product Pages")
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-base font-medium">
          Project Category
        </Label>
        <Select
          value={data.category}
          onValueChange={(value) => {
            handleChange("category", value)
            handleBlur("category", value)
          }}
        >
          <SelectTrigger id="category" className={`h-12 ${errors.category ? "border-red-500" : ""}`}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-medium">
          Project Description
        </Label>
        <Textarea
          id="description"
          placeholder="Describe your project in detail. What are your goals? What specific features do you need?"
          value={data.description}
          onChange={(e) => handleChange("description", e.target.value)}
          onBlur={(e) => handleBlur("description", e.target.value)}
          className={`min-h-[150px] resize-y ${errors.description ? "border-red-500" : ""}`}
        />
        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
        <p className="text-sm text-muted-foreground">
          Be specific about what you want to achieve. The more details you provide, the better.
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-medium">Project Visibility</Label>
        <RadioGroup
          value={data.visibility}
          onValueChange={(value) => handleChange("visibility", value)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Label
              htmlFor="public"
              className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                data.visibility === "public"
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value="public" id="public" className="sr-only" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Public Project</p>
                  <p className="text-sm text-muted-foreground">Visible to all team members and clients</p>
                </div>
              </div>
            </Label>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Label
              htmlFor="private"
              className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                data.visibility === "private"
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value="private" id="private" className="sr-only" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Private Project</p>
                  <p className="text-sm text-muted-foreground">Only visible to selected team members</p>
                </div>
              </div>
            </Label>
          </motion.div>
        </RadioGroup>
      </div>
    </div>
  )
}
