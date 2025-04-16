import type { ReactNode } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthCardProps {
  title: string
  description: string
  children: ReactNode
}

export default function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md border-0 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-medium">{title}</CardTitle>
        <CardDescription className="font-light">{description}</CardDescription>
      </CardHeader>
      {children}
    </Card>
  )
}
