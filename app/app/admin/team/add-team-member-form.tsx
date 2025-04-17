"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "@/components/ui/use-toast"
import { useTeamMemberStore } from "@/lib/stores/team-member-store"
import FormError from "./components/form-error"
import { FormFields } from "./components/form-fields"
import { FormActions } from "./components/form-actions"

type FormData = {
  fullName: string
  email: string
  team_role: string
  department: string
  status: string
}

export function AddTeamMemberForm() {
  const { createTeamMember, getAllTeamMember, teamMemberList } = useTeamMemberStore()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      fullName: "",
      email: "",
      team_role: "",
      department: "",
      status: "Active",
    },
  })

  console.log("teamMemberList", teamMemberList)
  const onSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true)
      setApiError(null)

      const { data, error } = await createTeamMember(formData)

      if (error) {
        setApiError(typeof error === "string" ? error : "Failed to add team member. Please try again.")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add team member. Please try again.",
        })
        return
      }

      // Refresh the team members list after successful addition
      await getAllTeamMember()

      // Show success toast
      toast({
        title: "Team member added",
        description: `${formData.fullName} has been added to the team.`,
      })

      // Reset form
      reset({
        fullName: "",
        email: "",
        team_role: "",
        department: "",
        status: "Active",
      })

      // Close the sheet
      setOpen(false)
    } catch (err) {
      console.error("Error adding team member:", err)
      setApiError("An unexpected error occurred. Please try again.")
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => setOpen(false)

  return (
    <Sheet
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
          // Reset error state and form data when closing the form
          setApiError(null)
          reset({
            fullName: "",
            email: "",
            team_role: "",
            department: "",
            status: "Active",
          })
        }
      }}
    >
      <SheetTrigger asChild>
        <Button className="flex items-center gap-1" onClick={() => setOpen(true)}>
          <UserPlus className="h-4 w-4 mr-1" /> Add Team Member
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add New Team Member</SheetTitle>
          <SheetDescription>Fill in the details to add a new team member to your organization.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormError error={apiError} />
          <FormFields
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            isSubmitting={isSubmitting}
          />
          <FormActions isSubmitting={isSubmitting} onCancel={handleCancel} />
        </form>
      </SheetContent>
    </Sheet>
  )
}
