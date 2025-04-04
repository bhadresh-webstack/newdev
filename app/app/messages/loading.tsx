export default function MessagesLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center rounded-lg border bg-background">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    </div>
  )
}

