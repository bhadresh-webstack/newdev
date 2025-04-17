"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form"

type FormData = {
  fullName: string
  email: string
  team_role: string
  department: string
  status: string
}

interface FormFieldsProps {
  register: UseFormRegister<FormData>
  errors: FieldErrors<FormData>
  watch: UseFormWatch<FormData>
  setValue: UseFormSetValue<FormData>
  isSubmitting: boolean
}

export function FormFields({ register, errors, watch, setValue, isSubmitting }: FormFieldsProps) {
  // Watch values for controlled components
  const teamRoleValue = watch("team_role")
  const departmentValue = watch("department")
  const statusValue = watch("status")

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setValue(name, value, { shouldValidate: true })
  }

  return (
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
        <input type="hidden" {...register("team_role", { required: "Team role is required" })} value={teamRoleValue} />
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
  )
}
