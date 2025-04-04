"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function ThemeSettings() {
  const { resolvedTheme, theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize how the application looks on your device.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-sm font-medium leading-none">Theme</h3>
            <div className="text-sm text-muted-foreground">
              {theme === "system" ? `System (${resolvedTheme})` : theme === "dark" ? "Dark" : "Light"}
            </div>
          </div>
          <RadioGroup value={theme} onValueChange={(value) => setTheme(value)} className="grid grid-cols-3 gap-4">
            <div>
              <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
              <Label
                htmlFor="theme-light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-200 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Sun className="mb-3 h-6 w-6" />
                <span className="text-sm font-medium">Light</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
              <Label
                htmlFor="theme-dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-slate-950 p-4 hover:bg-slate-900 hover:border-slate-800 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Moon className="mb-3 h-6 w-6 text-white" />
                <span className="text-sm font-medium text-white">Dark</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
              <Label
                htmlFor="theme-system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gradient-to-br from-white to-slate-950 p-4 hover:bg-gradient-to-br hover:from-gray-50 hover:to-slate-900 hover:border-gray-200 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Monitor className="mb-3 h-6 w-6" />
                <span className="text-sm font-medium">System</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-dark-mode">Auto dark mode</Label>
            <div className="text-sm text-muted-foreground">
              Automatically switch to dark mode based on your system preferences
            </div>
          </div>
          <Switch
            id="auto-dark-mode"
            checked={theme === "system"}
            onCheckedChange={(checked) => setTheme(checked ? "system" : resolvedTheme || "light")}
          />
        </div>
      </CardContent>
    </Card>
  )
}

