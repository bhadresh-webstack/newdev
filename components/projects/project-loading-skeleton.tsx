export function ProjectLoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-muted rounded-md w-1/3"></div>
        <div className="h-10 bg-muted rounded-md w-32"></div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="h-10 bg-muted rounded-md w-64"></div>
        <div className="h-10 bg-muted rounded-md w-32"></div>
        <div className="h-10 bg-muted rounded-md w-32"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-muted rounded-lg"></div>
        ))}
      </div>
    </div>
  )
}
