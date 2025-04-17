"use client"

import { Button } from "@/components/ui/button"
import { SheetFooter } from "@/components/ui/sheet"
import { Loader2 } from "lucide-react"

interface FormActionsProps {
  isSubmitting: boolean
  onCancel: () => void
}

export function FormActions({ isSubmitting, onCancel }: FormActionsProps) {
  return (
    <SheetFooter className="pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          "Add Team Member"
        )}
      </Button>
    </SheetFooter>
  )
}
