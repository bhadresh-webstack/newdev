"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeSettings } from "./theme-settings"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance" className="space-y-4">
          <ThemeSettings />
        </TabsContent>
        <TabsContent value="account">
          <div className="text-sm text-muted-foreground">Account settings will be implemented here.</div>
        </TabsContent>
        <TabsContent value="notifications">
          <div className="text-sm text-muted-foreground">Notification settings will be implemented here.</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

