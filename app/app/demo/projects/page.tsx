"use client"

import { useState } from "react"
import Link from "next/link"
import { Layers, Plus, Search, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { demoProjects } from "@/lib/data-utils"

export default function DemoProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter projects based on search query
  const filteredProjects = demoProjects.filter((project) => {
    if (searchQuery && !project.project_title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/app/projects">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">Demo Projects</h1>
          </div>
          <p className="text-muted-foreground">Sample project data for demonstration purposes</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-8 bg-white dark:bg-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.project_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={`/app/demo/projects/${project.project_id}`}>
                <Card className="h-full hover:shadow-md transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-md">
                        <Layers className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{project.project_title}</CardTitle>
                        <CardDescription>
                          {project.total_tasks} tasks • {project.completed_tasks} completed
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{project.progress_percentage}%</span>
                      </div>
                      <Progress value={project.progress_percentage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery ? `No projects matching "${searchQuery}"` : "There are no projects to display"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

