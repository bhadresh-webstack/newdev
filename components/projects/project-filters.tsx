"use client"

import { ArrowUpDown, Filter, Search, Users } from "lucide-react"
import type React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface ProjectFiltersProps {
  searchQuery: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  setStatusFilter: (status: string) => void
  setRelationshipFilter: (relationship: string) => void
  setSortOrder: (order: string) => void
  userRole: string | undefined | null
}

export function ProjectFilters({
  searchQuery,
  onSearchChange,
  onSubmit,
  setStatusFilter,
  setRelationshipFilter,
  setSortOrder,
  userRole,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <form onSubmit={onSubmit} className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search projects..."
          className="pl-7 h-8 text-sm bg-background"
          value={searchQuery}
          onChange={onSearchChange}
          onClick={(e) => e.stopPropagation()}
        />
      </form>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("Planning")}>Planning</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("In Progress")}>In Progress</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("Completed")}>Completed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {userRole === "team_member" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Relationship
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setRelationshipFilter("all")}>All Projects</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRelationshipFilter("team")}>Team Member</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRelationshipFilter("tasks")}>Assigned Tasks</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortOrder("newest")}>Newest First</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder("oldest")}>Oldest First</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortOrder("progress-high")}>Progress (High to Low)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder("progress-low")}>Progress (Low to High)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
