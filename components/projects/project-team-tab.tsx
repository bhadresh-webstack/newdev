"use client"

import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ProjectTeamTabProps {
  projectTeamMembers: any[]
  allTeamMembers: any[]
  isAssigningMember: boolean
  assignTeamMember: (userId: string) => Promise<boolean>
  removeTeamMember: (userId: string) => Promise<boolean>
}

export function ProjectTeamTab({
  projectTeamMembers,
  allTeamMembers,
  isAssigningMember,
  assignTeamMember,
  removeTeamMember,
}: ProjectTeamTabProps) {
  const [isAddingMember, setIsAddingMember] = useState(false)

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Team Members</h2>

        <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Assign Team Member</DialogTitle>
              <DialogDescription>
                Select team members to assign to this project. They will have access to project resources.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="max-h-[300px] overflow-y-auto">
                {allTeamMembers.length > 0 ? (
                  <div className="space-y-2">
                    {allTeamMembers.map((member) => {
                      // Check if member is already assigned to this project
                      const isAssigned = projectTeamMembers.some((pm) => pm.id === member.id)

                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.profile_image || undefined} alt={member.user_name} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs">
                                {getInitials(member.user_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{member.user_name}</p>
                              <p className="text-xs text-muted-foreground">{member.team_role || "Team Member"}</p>
                            </div>
                          </div>
                          {isAssigned ? (
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            >
                              Assigned
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => assignTeamMember(member.id)}
                              disabled={isAssigningMember}
                            >
                              {isAssigningMember ? "Assigning..." : "Assign"}
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No team members available</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingMember(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projectTeamMembers.length > 0 ? (
              projectTeamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.profile_image || undefined} alt={member.user_name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs">
                            {getInitials(member.user_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{member.user_name}</p>
                          <p className="text-xs text-muted-foreground">{member.role || "Team Member"}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeTeamMember(member.id)
                        }}
                        title="Remove from project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-6">
                <p className="text-muted-foreground text-sm">No team members assigned to this project yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
