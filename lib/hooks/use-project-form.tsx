"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface ProjectFormState {
  details: {
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
  requirements: {
    technicalRequirements: string
    skills: string[]
    deliverables: string[]
    errors?: {
      technicalRequirements?: string
      skills?: string
      deliverables?: string
    }
  }
  budget: {
    tier: string
    amount: number
    paymentType: string
  }
  timeline: {
    duration: number
    startDate: Date
    priority: string
  }
}

interface UseProjectFormProps {
  details?: {
    title?: string
    category?: string
    description?: string
    visibility?: string
  }
  requirements?: {
    technicalRequirements?: string
    skills?: string[]
    deliverables?: string[]
  }
  budget?: {
    tier?: string
    amount?: number
    paymentType?: string
  }
  timeline?: {
    duration?: number
    startDate?: Date
    priority?: string
  }
}

export function useProjectForm(initialData: UseProjectFormProps = {}) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({
    details: false,
    requirements: false,
    budget: false,
    timeline: false,
  })

  // Initialize form data with default values or provided initial data
  const [formData, setFormData] = useState<ProjectFormState>({
    details: {
      title: "",
      category: "",
      description: "",
      visibility: "public",
      ...initialData.details,
    },
    requirements: {
      technicalRequirements: "",
      skills: [],
      deliverables: [],
      ...initialData.requirements,
    },
    budget: {
      tier: "standard",
      amount: 2500,
      paymentType: "fixed",
      ...initialData.budget,
    },
    timeline: {
      duration: 30,
      startDate: new Date(),
      priority: "medium",
      ...initialData.timeline,
    },
  })

  const updateData = (section: keyof ProjectFormState, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
      },
    }))
  }

  // Define tab order for navigation
  const tabOrder = ["details", "requirements", "budget", "timeline", "review"]

  const handleTabChange = (value: string) => {
    const currentTabIndex = tabOrder.indexOf(activeTab)
    const targetTabIndex = tabOrder.indexOf(value)

    // Allow going back to previous tabs without validation
    if (targetTabIndex < currentTabIndex) {
      setActiveTab(value)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    // Validate current tab before moving forward
    if (activeTab === "details") {
      const detailsValid = validateDetailsTab()
      if (!detailsValid) {
        return // Don't change tabs if validation fails
      }
    }

    if (activeTab === "requirements") {
      const requirementsValid = validateRequirementsTab()
      if (!requirementsValid) {
        return // Don't change tabs if validation fails
      }
    }

    setActiveTab(value)
    // Scroll to top when changing tabs
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const validateDetailsTab = () => {
    const { title, category, description } = formData.details
    let hasErrors = false
    const newErrors = { title: "", category: "", description: "" }

    if (!title.trim()) {
      newErrors.title = "Project title is required"
      hasErrors = true
    }

    if (!category) {
      newErrors.category = "Please select a category"
      hasErrors = true
    }

    if (!description.trim()) {
      newErrors.description = "Project description is required"
      hasErrors = true
    } else if (description.trim().length < 20) {
      newErrors.description = "Description should be at least 20 characters"
      hasErrors = true
    }

    // Update the form errors state
    setFormErrors((prev) => ({
      ...prev,
      details: hasErrors,
    }))

    if (hasErrors) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields in the Details tab",
        variant: "destructive",
      })

      // Pass the field-specific errors to the form component
      updateData("details", {
        ...formData.details,
        errors: newErrors,
      })

      return false
    }

    return true
  }

  const validateRequirementsTab = () => {
    const { technicalRequirements, skills, deliverables } = formData.requirements
    let hasErrors = false
    const newErrors = {
      technicalRequirements: "",
      skills: "",
      deliverables: "",
    }

    if (!technicalRequirements.trim()) {
      newErrors.technicalRequirements = "Technical requirements are required"
      hasErrors = true
    } else if (technicalRequirements.trim().length < 30) {
      newErrors.technicalRequirements = "Please provide more detailed technical requirements (at least 30 characters)"
      hasErrors = true
    }

    if (skills.length === 0) {
      newErrors.skills = "Please add at least one required skill"
      hasErrors = true
    }

    if (deliverables.length === 0) {
      newErrors.deliverables = "Please add at least one deliverable"
      hasErrors = true
    }

    setFormErrors((prev) => ({
      ...prev,
      requirements: hasErrors,
    }))

    if (hasErrors) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields in the Requirements tab",
        variant: "destructive",
      })

      // Pass the field-specific errors to the form component
      updateData("requirements", {
        ...formData.requirements,
        errors: newErrors,
      })

      return false
    }

    return true
  }

  const handleNextTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab)

    // Validate current tab before proceeding
    if (activeTab === "details") {
      const detailsValid = validateDetailsTab()
      if (!detailsValid) return
    } else if (activeTab === "requirements") {
      const requirementsValid = validateRequirementsTab()
      if (!requirementsValid) return
    }

    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1])
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab)

    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1])
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const validateForm = () => {
    // Validate details tab
    const detailsValid = validateDetailsTab()
    if (!detailsValid) {
      setActiveTab("details")
      return false
    }

    // Validate requirements tab
    const requirementsValid = validateRequirementsTab()
    if (!requirementsValid) {
      setActiveTab("requirements")
      return false
    }

    return true
  }

  return {
    formData,
    updateData,
    activeTab,
    setActiveTab,
    isSubmitting,
    setIsSubmitting,
    formErrors,
    setFormErrors,
    handleTabChange,
    handleNextTab,
    handlePrevTab,
    validateForm,
  }
}
