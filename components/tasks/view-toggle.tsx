"use client"
import { ListIcon, LayoutGrid } from "lucide-react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ViewToggleProps {
  view: string
  updateFilters: (key: string, value: string) => void
}

export function ViewToggle({ view, updateFilters }: ViewToggleProps) {
  return (
    <>
      <Tabs value={view} onValueChange={(value) => updateFilters("view", value)} className="hidden md:block">
        <TabsList className="h-9 bg-background/80 border border-border/50 p-0.5">
          <TabsTrigger
            value="list"
            className="flex items-center gap-1.5 px-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <ListIcon className="h-4 w-4" />
            <span>List</span>
          </TabsTrigger>
          <TabsTrigger
            value="board"
            className="flex items-center gap-1.5 px-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Board</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs value={view} onValueChange={(value) => updateFilters("view", value)} className="md:hidden">
        <TabsList className="grid w-[100px] grid-cols-2 h-9 bg-background/80 border border-border/50 p-0.5">
          <TabsTrigger
            value="list"
            className="flex items-center justify-center data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <ListIcon className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger
            value="board"
            className="flex items-center justify-center data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <LayoutGrid className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  )
}
