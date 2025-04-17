"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useProjectsStore } from "@/lib/stores/projects-store"
import { useProjectForm } from "@/lib/hooks/use-project-form"

import { ProjectFormContainer } from "@/components/projects/project-form-container"
import { ProjectFormTabs } from "@/components/projects/project-form-tabs"
import ProjectDetailsForm from "../../new/project-details-form"
import ProjectRequirementsForm from "../../new/project-requirements-form"
import ProjectBudgetForm from "../../new/project-budget-form"
import ProjectTimelineForm from "../../new/project-timeline-form"

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const { getProjectById, updateProject } = useProjectsStore()
  const projectId = params.id as string

  const {
    formData,
    updateData,
    activeTab,
    setActiveTab,
    isSubmitting,
    setIsSubmitting,
    formErrors,
    handleTabChange,
    handleNextTab,
    handlePrevTab,
  } = useProjectForm()

  // Load project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const { data, error } = await getProjectById(projectId)

        if (error) {
          toast({
            title: "Error loading project",
            description: error,
            variant: "destructive",
          })
          return
        }

        if (data) {
          // Transform project data to form data structure
          updateData("details", {
            title: data.title || "",
            category: data.category || "",
            description: data.description || "",
            visibility: data.visibility || "public",
          })

          updateData("requirements", {
            technicalRequirements: data.technical_requirements || "",
            skills: data.required_skills ? data.required_skills.split(", ") : [],
            deliverables: data.deliverables ? data.deliverables.split(", ") : [],
          })

          updateData("budget", {
            tier: data.pricing_tier || "standard",
            amount: data.budget || 2500,
            paymentType: data.payment_type || "fixed",
          })

          updateData("timeline", {
            duration: data.duration_days || 30,
            startDate: data.start_date ? new Date(data.start_date) : new Date(),
            priority: data.priority || "medium",
          })
        }
      } catch (error) {
        console.error("Error fetching project:", error)
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId, getProjectById, toast, updateData])

  const handleBack = () => {
    router.push(`/app/projects/${projectId}`)
  }

  const handleSave = async () => {
    setIsSubmitting(true)

    try {
      // Prepare project data for submission
      const projectData = {
        title: formData.details.title,
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
        start_date: formData.timeline.startDate.toISOString(),
      }

      // Call the API to update the project
      const { data, error } = await updateProject(projectId, projectData)

      if (error) {
        throw new Error(error)
      }

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
        description:
          error instanceof Error ? error.message : "There was an error updating your project. Please try again.",
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
    <ProjectFormContainer
      title="Edit Project"
      subtitle="Update your project details"
      onBack={handleBack}
      onSave={handleSave}
      isSubmitting={isSubmitting}
      showSaveButton={true}
    >
      <ProjectFormTabs
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        handleNextTab={handleNextTab}
        handlePrevTab={handlePrevTab}
        formErrors={formErrors}
        showReviewTab={false}
      >
        <TabsContent value="details" className="space-y-6">
          <Card className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectDetailsForm data={formData.details} updateData={(data) => updateData("details", data)} />
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <Card className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectRequirementsForm
              data={formData.requirements}
              updateData={(data) => updateData("requirements", data)}
            />
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <Card className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectBudgetForm data={formData.budget} updateData={(data) => updateData("budget", data)} />
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectTimelineForm data={formData.timeline} updateData={(data) => updateData("timeline", data)} />
          </Card>
        </TabsContent>
      </ProjectFormTabs>
    </ProjectFormContainer>
  )
}
