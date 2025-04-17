import { Badge } from "@/components/ui/badge"
import type { Task } from "@/lib/stores/tasks-store"

interface TaskActivityTabProps {
  task: Task
  formatDate: (dateString: string | null | undefined) => string
}

export function TaskActivityTab({ task, formatDate }: TaskActivityTabProps) {
  return (
    <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border p-4 shadow-sm">
      <div className="space-y-4">
        {/* Activity timeline with connecting line */}
        <div className="relative pl-6 border-l-2 border-muted pb-1">
          <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
          <div className="mb-1">
            <p className="text-sm">
              <span className="font-medium">Sarah Miller</span> changed the status to{" "}
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800"
              >
                In Progress
              </Badge>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Yesterday at 2:30 PM</p>
          </div>
        </div>

        <div className="relative pl-6 border-l-2 border-muted pb-1">
          <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-1"></div>
          <div className="mb-1">
            <p className="text-sm">
              <span className="font-medium">Alex Johnson</span> assigned this task to{" "}
              <span className="font-medium">Sarah Miller</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
          </div>
        </div>

        <div className="relative pl-6 border-l-2 border-muted">
          <div className="absolute w-3 h-3 bg-purple-500 rounded-full -left-[7px] top-1"></div>
          <div>
            <p className="text-sm">
              <span className="font-medium">Alex Johnson</span> created this task
            </p>
            <p className="text-xs text-muted-foreground mt-1">{formatDate(task.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
