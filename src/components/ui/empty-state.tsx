import React from "react"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  title?: string
  description?: string
  className?: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Nothing here yet",
  description = "Add a new record or adjust your filters.",
  className,
  action,
}) => {
  return (
    <div className={cn("flex h-64 items-center justify-center p-6", className)}>
      <div className="text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gradient-to-tr from-blue-500/20 via-cyan-500/20 to-purple-500/20">
          <div className="relative h-full w-full">
            <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/30" />
            <span className="absolute inset-2 animate-ping rounded-full bg-cyan-500/30 [animation-delay:200ms]" />
            <span className="absolute inset-4 animate-ping rounded-full bg-purple-500/30 [animation-delay:400ms]" />
            <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-cyan-500 to-purple-500 opacity-10" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  )
}


