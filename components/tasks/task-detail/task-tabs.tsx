"use client"

import { motion } from "framer-motion"
import { User, MessageSquare, Clock, ArrowUpRight } from "lucide-react"

interface TaskTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  commentsCount: number
  relatedTasksCount: number
}

export function TaskTabs({ activeTab, setActiveTab, commentsCount, relatedTasksCount }: TaskTabsProps) {
  return (
    <div className="border-b mb-4">
      <div className="flex space-x-6">
        <button
          onClick={() => setActiveTab("details")}
          className={`relative pb-2 text-sm font-medium transition-colors ${
            activeTab === "details" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span>Details</span>
          </div>
          {activeTab === "details" && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={`relative pb-2 text-sm font-medium transition-colors ${
            activeTab === "comments" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            <span>Comments ({commentsCount})</span>
          </div>
          {activeTab === "comments" && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`relative pb-2 text-sm font-medium transition-colors ${
            activeTab === "activity" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>Activity</span>
          </div>
          {activeTab === "activity" && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("related")}
          className={`relative pb-2 text-sm font-medium transition-colors ${
            activeTab === "related" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ArrowUpRight className="h-4 w-4" />
            <span>Related ({relatedTasksCount})</span>
          </div>
          {activeTab === "related" && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </button>
      </div>
    </div>
  )
}
