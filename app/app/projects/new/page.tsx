"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useProjectsStore } from "@/lib/stores/projects-store"
import { useProjectForm } from "@/lib/hooks/use-project-form"

import { ProjectFormContainer } from "@/components/projects/project-form-container"
import { ProjectFormTabs } from "@/components/projects/project-form-tabs"
import ProjectDetailsForm from "./project-details-form"
import ProjectRequirementsForm from "./project-requirements-form"
import ProjectBudgetForm from "./project-budget-form"
import ProjectTimelineForm from "./project-timeline-form"
import ProjectReviewForm from "./project-review-form"

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { createProject } = useProjectsStore()

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
    validateForm,
  } = useProjectForm()

  const handleBack = () => {
    router.push("/app/projects")
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
        start_date: formData.timeline.startDate.toISOString(),
        duration_days: formData.timeline.duration,
        priority: formData.timeline.priority,
        visibility: formData.details.visibility,
      }

      // Submit to Supabase via the store
      const { data, error } = await createProject(projectData)

      if (error) {
        toast({
          title: "Error creating project",
          description: error || "There was an error creating your project. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
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
        description: "There was an error creating your project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProjectFormContainer
      title="Create New Project"
      subtitle="Fill out the form to create a new project"
      onBack={handleBack}
    >
      <ProjectFormTabs
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        handleNextTab={handleNextTab}
        handlePrevTab={handlePrevTab}
        formErrors={formErrors}
      >
        <TabsContent value="details" className="space-y-6">
          <Card className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectDetailsForm data={formData.details} updateData={(data) => updateData("details", data)} />
          </Card>
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
          <Card className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectRequirementsForm
              data={formData.requirements}
              updateData={(data) => updateData("requirements", data)}
            />
          </Card>
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
          <Card className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectBudgetForm data={formData.budget} updateData={(data) => updateData("budget", data)} />
          </Card>
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
          <Card className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectTimelineForm data={formData.timeline} updateData={(data) => updateData("timeline", data)} />
          </Card>
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
          <Card className="bg-card rounded-lg border shadow-sm p-6">
            <ProjectReviewForm data={formData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </Card>
          <div className="flex justify-start">
            <Button onClick={handlePrevTab} variant="outline">
              Back to Timeline
            </Button>
          </div>
        </TabsContent>
      </ProjectFormTabs>
    </ProjectFormContainer>
  )
}
