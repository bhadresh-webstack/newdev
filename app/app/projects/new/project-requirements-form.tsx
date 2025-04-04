"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Plus, Code, Sparkles, Zap } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Popular skills for suggestions
const popularSkills = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Tailwind CSS",
  "UI/UX Design",
  "Responsive Design",
  "API Integration",
  "Database Design",
  "Authentication",
  "Payment Processing",
  "SEO",
  "Performance Optimization",
]

export default function ProjectRequirementsForm({ data, updateData }) {
  const [newSkill, setNewSkill] = useState("")
  const [newDeliverable, setNewDeliverable] = useState("")
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)
  const [errors, setErrors] = useState({
    technicalRequirements: "",
    skills: "",
    deliverables: "",
  })

  const dropdownRef = useRef(null)

  // Update local errors when they come from parent component
  useEffect(() => {
    if (data.errors) {
      setErrors(data.errors)
    }
  }, [data.errors])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSkillSuggestions(false)
      }
    }

    // Add event listener when dropdown is shown
    if (showSkillSuggestions) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSkillSuggestions])

  const validateField = (field, value) => {
    switch (field) {
      case "technicalRequirements":
        return !value.trim()
          ? "Technical requirements are required"
          : value.trim().length < 30
            ? "Please provide more detailed technical requirements (at least 30 characters)"
            : ""
      case "skills":
        return value.length === 0 ? "Please add at least one required skill" : ""
      case "deliverables":
        return value.length === 0 ? "Please add at least one deliverable" : ""
      default:
        return ""
    }
  }

  const handleAddSkill = (skill) => {
    if (skill && !data.skills.includes(skill)) {
      const newSkills = [...data.skills, skill]
      updateData({ skills: newSkills })

      // Clear error if skills were added
      if (errors.skills && newSkills.length > 0) {
        setErrors((prev) => ({
          ...prev,
          skills: "",
        }))
      }
    }
    setNewSkill("")
    setShowSkillSuggestions(false)
  }

  const handleRemoveSkill = (skillToRemove) => {
    const newSkills = data.skills.filter((skill) => skill !== skillToRemove)
    updateData({ skills: newSkills })

    // Validate skills after removal
    if (newSkills.length === 0) {
      setErrors((prev) => ({
        ...prev,
        skills: "Please add at least one required skill",
      }))
    }
  }

  const handleAddDeliverable = () => {
    if (newDeliverable && !data.deliverables.includes(newDeliverable)) {
      const newDeliverables = [...data.deliverables, newDeliverable]
      updateData({ deliverables: newDeliverables })

      // Clear error if deliverables were added
      if (errors.deliverables && newDeliverables.length > 0) {
        setErrors((prev) => ({
          ...prev,
          deliverables: "",
        }))
      }
    }
    setNewDeliverable("")
  }

  const handleRemoveDeliverable = (deliverableToRemove) => {
    const newDeliverables = data.deliverables.filter((deliverable) => deliverable !== deliverableToRemove)
    updateData({
      deliverables: newDeliverables,
    })

    // Validate deliverables after removal
    if (newDeliverables.length === 0) {
      setErrors((prev) => ({
        ...prev,
        deliverables: "Please add at least one deliverable",
      }))
    }
  }

  const handleTechnicalRequirementsChange = (e) => {
    const value = e.target.value
    updateData({ technicalRequirements: value })

    // Clear error when user types
    if (errors.technicalRequirements) {
      setErrors((prev) => ({
        ...prev,
        technicalRequirements: "",
      }))
    }
  }

  const handleTechnicalRequirementsBlur = (e) => {
    const value = e.target.value
    const errorMessage = validateField("technicalRequirements", value)
    setErrors((prev) => ({
      ...prev,
      technicalRequirements: errorMessage,
    }))
  }

  const filteredSuggestions = popularSkills
    .filter((skill) => skill.toLowerCase().includes(newSkill.toLowerCase()) && !data.skills.includes(skill))
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="technicalRequirements" className="text-base font-medium">
          Technical Requirements
        </Label>
        <Textarea
          id="technicalRequirements"
          placeholder="Describe the technical requirements for your project. Include specific technologies, frameworks, or platforms you want to use."
          value={data.technicalRequirements}
          onChange={handleTechnicalRequirementsChange}
          onBlur={handleTechnicalRequirementsBlur}
          className={`min-h-[150px] resize-y ${errors.technicalRequirements ? "border-red-500" : ""}`}
        />
        {errors.technicalRequirements && <p className="text-sm text-red-500 mt-1">{errors.technicalRequirements}</p>}
        <p className="text-sm text-muted-foreground">
          Be specific about technical constraints, integrations, or preferences.
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Required Skills</Label>

        <div className="relative">
          <div className="flex space-x-2">
            <div className="relative flex-1" ref={dropdownRef}>
              <Input
                placeholder="Add a required skill (e.g., React, UI Design)"
                value={newSkill}
                onChange={(e) => {
                  setNewSkill(e.target.value)
                  setShowSkillSuggestions(true)
                }}
                onFocus={() => setShowSkillSuggestions(true)}
                className={`h-12 ${errors.skills ? "border-red-500" : ""}`}
              />

              {showSkillSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredSuggestions.map((skill) => (
                    <div
                      key={skill}
                      className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center"
                      onClick={() => handleAddSkill(skill)}
                    >
                      <Sparkles className="h-4 w-4 mr-2 text-primary" />
                      {skill}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              onClick={() => handleAddSkill(newSkill)}
              disabled={!newSkill}
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity shadow-md"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {errors.skills && <p className="text-sm text-red-500 mt-1">{errors.skills}</p>}

        <div className="flex flex-wrap gap-2 mt-3">
          {data.skills.map((skill) => (
            <motion.div
              key={skill}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              <Badge
                variant="secondary"
                className="px-3 py-1.5 text-sm bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 flex items-center gap-1"
              >
                <Code className="h-3.5 w-3.5 text-primary" />
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </motion.div>
          ))}
          {data.skills.length === 0 && <p className="text-sm text-muted-foreground italic">No skills added yet</p>}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Project Deliverables</Label>

        <div className="flex space-x-2">
          <Input
            placeholder="Add a deliverable (e.g., Homepage design, User authentication)"
            value={newDeliverable}
            onChange={(e) => setNewDeliverable(e.target.value)}
            className={`h-12 ${errors.deliverables ? "border-red-500" : ""}`}
          />
          <Button
            type="button"
            onClick={handleAddDeliverable}
            disabled={!newDeliverable}
            className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity shadow-md"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {errors.deliverables && <p className="text-sm text-red-500 mt-1">{errors.deliverables}</p>}

        <div className="space-y-2 mt-3">
          {data.deliverables.map((deliverable, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/20 rounded-lg"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm mr-3">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span>{deliverable}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveDeliverable(deliverable)}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
          {data.deliverables.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No deliverables added yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

