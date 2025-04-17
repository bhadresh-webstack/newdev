"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useTeamMemberStore } from "@/lib/stores/team-member-store"
import { TeamHeader } from "./components/team-header"
import { TeamStats } from "./components/team-stats"
import { TeamMembersTable } from "./components/team-members-table"
import {TeamMember} from "@/lib/types"

export default function TeamPage() {
  const { getAllTeamMember, teamMemberList, isLoading: storeLoading } = useTeamMemberStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch team members on component mount
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true)
        await getAllTeamMember()
      } catch (error) {
        console.error("Error fetching team members:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeamMembers()
  }, [getAllTeamMember])

  // Update filtered members whenever teamMemberList changes
  useEffect(() => {
    if (teamMemberList) {
      const formattedMembers = teamMemberList.map((member) => ({
        ...member,
        status: "Active", // Add status field as "Active" for all members
      }))

      // Apply current search filter if there is one
      if (searchTerm.trim() === "") {
        setFilteredMembers(formattedMembers)
      } else {
        const filtered = formattedMembers.filter(
          (member) =>
            member.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.team_role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.department?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        setFilteredMembers(filtered)
      }
    } else {
      setFilteredMembers([])
    }
  }, [teamMemberList, searchTerm])

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
  }

  // Determine if we're actually loading
  const loading = isLoading || storeLoading

  return (
    <div className="space-y-8">
      <TeamHeader />
      <TeamStats loading={loading} teamMemberList={teamMemberList} />
      <TeamMembersTable
        loading={loading}
        filteredMembers={filteredMembers}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
      />
    </div>
  )
}
