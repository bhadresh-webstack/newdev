"use client"

import { Plus, Search } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

interface EmptyProjectsProps {
  searchQuery?: string
  userRole: string | undefined | null
}

export function EmptyProjects({ searchQuery, userRole }: EmptyProjectsProps) {
  const router = useRouter()

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {searchQuery ? `No projects matching "${searchQuery}"` : "Get started by creating your first project"}
          </p>
          {(userRole === "admin" || userRole === "customer") && (
            <Button onClick={() => router.push("/app/projects/new")} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
