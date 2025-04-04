"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useProjectsStore } from "@/lib/stores/projects-store"

import ProjectDetailsForm from "./project-details-form"
import ProjectRequirementsForm from "./project-requirements-form"
import ProjectBudgetForm from "./project-budget-form"
import ProjectTimelineForm from "./project-timeline-form"
import ProjectReviewForm from "./project-review-form"

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createProject } = useProjectsStore()
  const [formErrors, setFormErrors] = useState({
    details: false,
    requirements: false,
    budget: false,
    timeline: false,
  })

  // Initialize form data with default values
  const [formData, setFormData] = useState({
    details: {
      title: "",
      category: "",
      description: "",
      visibility: "public",
    },
    requirements: {
      technicalRequirements: "",
      skills: [],
      deliverables: [],
    },
    budget: {
      tier: "standard",
      amount: 2500,
      paymentType: "fixed",
    },
    timeline: {
      duration: 30,
      startDate: new Date(),
      priority: "medium",
    },
  })

  const updateData = (section, data) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
      },
    }))
  }

  const handleBack = () => {
    router.push("/app/projects")
  }

  // Define tab order for navigation
  const tabOrder = ["details", "requirements", "budget", "timeline", "review"]

  const handleTabChange = (value) => {
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

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Prepare project data for submission
      const projectData = {
        title: formData.details.title,
        description: formData.details.description,
        status: "planning",
        pricing_tier: formData.budget.tier,
        // Convert other form data as needed
        technical_requirements: formData.requirements.technicalRequirements,
        required_skills: formData.requirements.skills.join(", "),
        deliverables: formData.requirements.deliverables.join(", "),
        budget: formData.budget.amount,
        payment_type: formData.budget.paymentType,
        start_date: format(formData.timeline.startDate, "yyyy-MM-dd"),
        duration_days: formData.timeline.duration,
        priority: formData.timeline.priority,
        visibility: formData.details.visibility,
      }

      // Submit to Supabase via the store
      const { data, error } = await createProject(projectData)

      if (error) {
        throw new Error(error.message || "Failed to create project")
      }

      toast({
        title: "Project created successfully!",
        description: "Your new project has been created and is ready to go.",
      })

      // Redirect to the project page or projects list
      router.push("/app/projects")
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Error creating project",
        description: error.message || "There was an error creating your project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Create New Project</h1>
          <p className="text-muted-foreground">Fill out the form to create a new project</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-5 h-auto p-1">
          <TabsTrigger value="details" className={`py-2.5 ${formErrors.details ? "text-red-500" : ""}`}>
            Details
          </TabsTrigger>
          <TabsTrigger value="requirements" className={`py-2.5 ${formErrors.requirements ? "text-red-500" : ""}`}>
            Requirements
          </TabsTrigger>
          <TabsTrigger value="budget" className={`py-2.5 ${formErrors.budget ? "text-red-500" : ""}`}>
            Budget
          </TabsTrigger>
          <TabsTrigger value="timeline" className={`py-2.5 ${formErrors.timeline ? "text-red-500" : ""}`}>
            Timeline
          </TabsTrigger>
          <TabsTrigger value="review" className="py-2.5">
            Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectDetailsForm data={formData.details} updateData={(data) => updateData("details", data)} />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleNextTab}
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity shadow-md"
            >
              Next: Requirements
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectRequirementsForm
              data={formData.requirements}
              updateData={(data) => updateData("requirements", data)}
            />
          </div>
          <div className="flex justify-between">
            <Button onClick={handlePrevTab} variant="outline">
              Back to Details
            </Button>
            <Button
              onClick={handleNextTab}
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity shadow-md"
            >
              Next: Budget
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectBudgetForm data={formData.budget} updateData={(data) => updateData("budget", data)} />
          </div>
          <div className="flex justify-between">
            <Button onClick={handlePrevTab} variant="outline">
              Back to Requirements
            </Button>
            <Button
              onClick={handleNextTab}
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity shadow-md"
            >
              Next: Timeline
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectTimelineForm data={formData.timeline} updateData={(data) => updateData("timeline", data)} />
          </div>
          <div className="flex justify-between">
            <Button onClick={handlePrevTab} variant="outline">
              Back to Budget
            </Button>
            <Button
              onClick={handleNextTab}
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity shadow-md"
            >
              Next: Review
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectReviewForm data={formData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
          <div className="flex justify-start">
            <Button onClick={handlePrevTab} variant="outline">
              Back to Timeline
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

