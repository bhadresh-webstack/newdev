"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Loader2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useTeamMemberStore } from "@/lib/stores/team-member-store"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type FormData = {
  fullName: string
  email: string
  team_role: string
  department: string
  status: string
}

export function AddTeamMemberForm() {
  const { createTeamMember, getAllTeamMember,teamMemberList } = useTeamMemberStore()
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

  // Watch values for controlled components
  const teamRoleValue = watch("team_role")
  const departmentValue = watch("department")
  const statusValue = watch("status")

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setValue(name, value, { shouldValidate: true })
  }

  console.log("teamMemberList",teamMemberList)
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
          {apiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName" className={errors.fullName ? "text-destructive" : ""}>
                Full Name
              </Label>
              <Input
                id="fullName"
                {...register("fullName", {
                  required: "Full name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                })}
                className={errors.fullName ? "border-destructive" : ""}
                placeholder="John Doe"
                disabled={isSubmitting}
              />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={errors.email ? "border-destructive" : ""}
                placeholder="john.doe@example.com"
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="team_role" className={errors.team_role ? "text-destructive" : ""}>
                Team Role
              </Label>
              <Select
                value={teamRoleValue}
                onValueChange={(value) => handleSelectChange("team_role", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="team_role" className={errors.team_role ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select team role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="project_manager">Project Manager</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
              {errors.team_role && <p className="text-sm text-destructive">{errors.team_role.message}</p>}
              <input
                type="hidden"
                {...register("team_role", { required: "Team role is required" })}
                value={teamRoleValue}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department" className={errors.department ? "text-destructive" : ""}>
                Department
              </Label>
              <Select
                value={departmentValue}
                onValueChange={(value) => handleSelectChange("department", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="department" className={errors.department ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
              {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
              <input
                type="hidden"
                {...register("department", { required: "Department is required" })}
                value={departmentValue}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusValue}
                onValueChange={(value) => handleSelectChange("status", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" {...register("status")} value={statusValue} />
            </div>
          </div>
          <SheetFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Team Member"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
