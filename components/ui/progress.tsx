"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    value?: number
  }
>(({ className, value = 0, ...props }, ref) => {
  const [displayValue, setDisplayValue] = React.useState(value)

  React.useEffect(() => {
    setDisplayValue(value)
  }, [value])

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-[#2d2936]/50 border border-[#3a3545]/50",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-gradient-to-r from-[#7b5cfa] to-[#9d5cfa] transition-all"
        style={{ transform: `translateX(-${100 - (displayValue || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
