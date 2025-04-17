"use client"

import { motion } from "framer-motion"
import { Mail, MoreHorizontal, Edit, Phone, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TeamMemberRowProps {
  member: any
  index: number
}

export function TeamMemberRow({ member, index }: TeamMemberRowProps) {
  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <motion.tr
      key={member.id || index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="border-b hover:bg-muted/30 transition-colors"
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="border-2 border-primary/10">
            <AvatarImage src={member.profile_image || "/placeholder.svg?height=40&width=40"} alt={member.user_name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(member.user_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{member.user_name}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {member.email}
            </div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="font-medium">{member.team_role}</div>
      </td>
      <td className="p-4">
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {member.department}
        </div>
      </td>
      <td className="p-4">
        <Badge
          variant="outline"
          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
        >
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green-500"></span>
          Active
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
  )
}
