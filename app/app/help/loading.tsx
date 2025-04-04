export default function HelpLoading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="mt-4 text-lg font-medium">Loading Help Center...</p>
    </div>
  )
}

