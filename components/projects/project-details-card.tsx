"use client"

import { motion } from "framer-motion"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/project-utils"
import type { Project } from "@/lib/stores/projects-store"

interface ProjectDetailsCardProps {
  project: Project
}

export function ProjectDetailsCard({ project }: ProjectDetailsCardProps) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl -m-1 blur-xl"></div>
      <Card className="h-full border-none shadow-lg backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 relative z-10">
        <CardHeader className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-3 px-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Additional Details
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="pr-2">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { label: "Created", value: formatDate(project.created_at || "2025-04-06T09:55:43.919Z") },
                { label: "Last Updated", value: formatDate(project.updated_at || "2025-04-06T09:55:44.296Z") },
                { label: "Pricing Tier", value: project.pricing_tier || "Standard", isCapitalize: true },
                { label: "Visibility", value: project.visibility || "Public", isCapitalize: true },
                {
                  label: "Required Skills",
                  value: project.required_skills || "React, Next.js, TypeScript, Node.js",
                },
                { label: "Deliverables", value: project.deliverables || "Homepage design is urgent" },
              ].map((item, index) => (
                <div key={index} className="py-2 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">{item.label}</p>
                  <p className={`font-medium text-sm ${item.isCapitalize ? "capitalize" : ""}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
