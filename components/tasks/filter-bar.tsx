"use client"
import { motion } from "framer-motion"
import { Search, Filter } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface FilterBarProps {
  filters: {
    searchQuery: string
    projectFilter: string
    statusFilter: string
    groupFilter: string
  }
  isFilterBarVisible: boolean
  setIsFilterBarVisible: (value: boolean) => void
  updateFilters: (key: string, value: string) => void
  taskGroups: string[]
}

export function FilterBar({
  filters,
  isFilterBarVisible,
  setIsFilterBarVisible,
  updateFilters,
  taskGroups,
}: FilterBarProps) {
  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-lg border border-border/40 shadow-sm p-4 mb-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="search"
              placeholder="Search tasks..."
              className="pl-9 pr-4 py-2 h-9 bg-background/80 border-border/50 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
              value={filters.searchQuery}
              onChange={(e) => updateFilters("q", e.target.value || "")}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 rounded-full"
            onClick={() => setIsFilterBarVisible(!isFilterBarVisible)}
            aria-label={isFilterBarVisible ? "Hide filters" : "Show filters"}
            title={isFilterBarVisible ? "Hide filters" : "Show filters"}
          >
            <Filter className={`h-4 w-4 ${isFilterBarVisible ? "text-primary" : ""}`} />
          </Button>
        </div>
      </div>

      {isFilterBarVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 flex flex-wrap gap-2 items-center"
        >
          <div className="flex items-center bg-background/80 rounded-md border border-border/50 divide-x divide-border/50 w-full md:w-auto">
            <Select value={filters.projectFilter || "all"} onValueChange={(value) => updateFilters("project", value)}>
              <SelectTrigger className="min-w-[140px] h-9 border-0 rounded-none rounded-l-md bg-transparent focus:ring-0 focus:ring-offset-0 text-sm font-medium">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent className="min-w-[180px]">
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="project-1">E-commerce Website</SelectItem>
                <SelectItem value="project-2">Mobile App</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.statusFilter || "all"} onValueChange={(value) => updateFilters("status", value)}>
              <SelectTrigger className="min-w-[120px] h-9 border-0 rounded-none bg-transparent focus:ring-0 focus:ring-offset-0 text-sm font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="min-w-[160px]">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="QA">QA</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.groupFilter || "all"} onValueChange={(value) => updateFilters("group", value)}>
              <SelectTrigger className="min-w-[120px] h-9 border-0 rounded-none rounded-r-md bg-transparent focus:ring-0 focus:ring-offset-0 text-sm font-medium">
                <SelectValue placeholder="Group" />
              </SelectTrigger>
              <SelectContent className="min-w-[160px]">
                <SelectItem value="all">All Groups</SelectItem>
                {taskGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}
    </div>
  )
}
