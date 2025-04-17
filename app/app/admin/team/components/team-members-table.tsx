"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Search, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AddTeamMemberForm } from "../add-team-member-form"
import { TeamMemberRow } from "./team-member-row"

interface TeamMembersTableProps {
  loading: boolean
  filteredMembers: any[]
  searchTerm: string
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function TeamMembersTable({ loading, filteredMembers, searchTerm, handleSearch }: TeamMembersTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Team Members</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search members..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <AddTeamMemberForm />
        </div>
      </div>

      <Card className="overflow-hidden border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30">
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Name</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Role</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Department</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-sm text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Loading team members...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="py-12 text-center">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No team members found</h3>
                        <p className="text-muted-foreground mt-2">
                          Try adjusting your search or add a new team member.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member, index) => (
                    <TeamMemberRow key={member.id || index} member={member} index={index} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
