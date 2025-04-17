// Format date to readable format
export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A"

  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Calculate due date from start date and duration
export const calculateDueDate = (startDate: string | undefined, durationDays: number | undefined) => {
  if (!startDate || !durationDays) return null

  const date = new Date(startDate)
  date.setDate(date.getDate() + durationDays)
  return date
}

// Format currency
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

// Get status text based on progress
export const getStatusText = (progress: number) => {
  if (progress >= 100) return "Completed"
  if (progress > 50) return "In Progress"
  return "Planning"
}

// Get status badge color
export const getStatusColor = (progress: number) => {
  if (progress >= 100) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
  if (progress > 50) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
  return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
}
