"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useProjectsStore } from "@/lib/stores/projects-store"
import { demoProjects } from "@/lib/data-utils"

import ProjectDetailsForm from "../../new/project-details-form"
import ProjectRequirementsForm from "../../new/project-requirements-form"
import ProjectBudgetForm from "../../new/project-budget-form"
import ProjectTimelineForm from "../../new/project-timeline-form"

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const { updateProject } = useProjectsStore()
  const projectId = params.id as string

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

  // Load project data
  useEffect(() => {
    // In a real app, you would fetch the project data from your API or store
    // For demo purposes, we'll use the demo data
    const project = demoProjects.find((p) => p.project_id === projectId)

    if (project) {
      // Transform project data to form data structure
      setFormData({
        details: {
          title: project.project_title || "",
          category: project.category || "",
          description: project.description || "",
          visibility: project.visibility || "public",
        },
        requirements: {
          technicalRequirements: project.technical_requirements || "",
          skills: project.required_skills ? project.required_skills.split(", ") : [],
          deliverables: project.deliverables ? project.deliverables.split(", ") : [],
        },
        budget: {
          tier: project.pricing_tier || "standard",
          amount: project.budget || 2500,
          paymentType: project.payment_type || "fixed",
        },
        timeline: {
          duration: project.duration_days || 30,
          startDate: project.start_date ? new Date(project.start_date) : new Date(),
          priority: project.priority || "medium",
        },
      })
    }

    setLoading(false)
  }, [projectId])

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
    router.push(`/app/projects/${projectId}`)
  }

  const handleTabChange = (value) => {
    setActiveTab(value)
    // Scroll to top when changing tabs
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSave = async () => {
    setIsSubmitting(true)

    try {
      // Prepare project data for submission
      const projectData = {
        project_id: projectId,
        project_title: formData.details.title,
        description: formData.details.description,
        category: formData.details.category,
        technical_requirements: formData.requirements.technicalRequirements,
        required_skills: formData.requirements.skills.join(", "),
        deliverables: formData.requirements.deliverables.join(", "),
        budget: formData.budget.amount,
        pricing_tier: formData.budget.tier,
        payment_type: formData.budget.paymentType,
        duration_days: formData.timeline.duration,
        priority: formData.timeline.priority,
        visibility: formData.details.visibility,
      }

      // In a real app, you would update the project in your database
      // For demo purposes, we'll just show a success message
      // const { data, error } = await updateProject(projectData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Project updated successfully!",
        description: "Your project has been updated.",
      })

      // Redirect back to the project page
      router.push(`/app/projects/${projectId}`)
    } catch (error) {
      console.error("Error updating project:", error)
      toast({
        title: "Error updating project",
        description: "There was an error updating your project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted rounded-md w-1/3"></div>
          <div className="h-10 bg-muted rounded-md w-32"></div>
        </div>
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Edit Project</h1>
            <p className="text-muted-foreground">Update your project details</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
        >
          {isSubmitting ? (
            "Saving..."
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-4 h-auto p-1">
          <TabsTrigger value="details" className="py-2.5">
            Details
          </TabsTrigger>
          <TabsTrigger value="requirements" className="py-2.5">
            Requirements
          </TabsTrigger>
          <TabsTrigger value="budget" className="py-2.5">
            Budget
          </TabsTrigger>
          <TabsTrigger value="timeline" className="py-2.5">
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectDetailsForm data={formData.details} updateData={(data) => updateData("details", data)} />
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectRequirementsForm
              data={formData.requirements}
              updateData={(data) => updateData("requirements", data)}
            />
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectBudgetForm data={formData.budget} updateData={(data) => updateData("budget", data)} />
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectTimelineForm data={formData.timeline} updateData={(data) => updateData("timeline", data)} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

