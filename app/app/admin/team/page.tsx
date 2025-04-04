"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, Search, MoreHorizontal, Mail, Phone, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddTeamMemberForm } from "./add-team-member-form"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Sample team members data - static data without store connection
const initialTeamMembers = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    role: "Senior Developer",
    department: "Engineering",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    phone: "+1 (555) 234-5678",
    role: "UI/UX Designer",
    department: "Design",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "+1 (555) 345-6789",
    role: "Project Manager",
    department: "Management",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "+1 (555) 456-7890",
    role: "Frontend Developer",
    department: "Engineering",
    status: "On Leave",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.wilson@example.com",
    phone: "+1 (555) 567-8901",
    role: "Backend Developer",
    department: "Engineering",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "Jessica Taylor",
    email: "jessica.taylor@example.com",
    phone: "+1 (555) 678-9012",
    role: "Content Strategist",
    department: "Marketing",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMembers, setFilteredMembers] = useState(teamMembers)

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.trim() === "") {
      setFilteredMembers(teamMembers)
    } else {
      const filtered = teamMembers.filter(
        (member) =>
          member.name.toLowerCase().includes(term.toLowerCase()) ||
          member.email.toLowerCase().includes(term.toLowerCase()) ||
          member.role.toLowerCase().includes(term.toLowerCase()) ||
          member.department.toLowerCase().includes(term.toLowerCase()),
      )
      setFilteredMembers(filtered)
    }
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2"
        >
          <Users className="h-6 w-6 md:h-7 md:w-7" /> Team Management
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground"
        >
          Manage your team members and their access permissions
        </motion.p>
      </div>

      {/* Team Overview */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
      >
        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                  <h3 className="text-2xl md:text-3xl font-bold mt-1">{teamMembers.length}</h3>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                  <h3 className="text-2xl md:text-3xl font-bold mt-1">
                    {teamMembers.filter((m) => m.status === "Active").length}
                  </h3>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Departments</p>
                  <h3 className="text-2xl md:text-3xl font-bold mt-1">
                    {new Set(teamMembers.map((m) => m.department)).size}
                  </h3>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Team Members List */}
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
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground hidden md:table-cell">
                      Role
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground hidden lg:table-cell">
                      Department
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground hidden md:table-cell">
                      Status
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member, index) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="border-2 border-primary/10">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="font-medium">{member.role}</div>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {member.department}
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className={`
                            px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${
                              member.status === "Active"
                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                            }
                          `}
                        >
                          <span
                            className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
                              member.status === "Active" ? "bg-green-500" : "bg-amber-500"
                            }`}
                          ></span>
                          {member.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-center cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" /> Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center cursor-pointer">
                              <Mail className="mr-2 h-4 w-4" /> Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center cursor-pointer">
                              <Phone className="mr-2 h-4 w-4" /> Call Member
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-center text-red-600 focus:text-red-600 cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" /> Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {filteredMembers.length === 0 && (
                <div className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No team members found</h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your search or add a new team member.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

