"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  id: number
  title: string
  duration: string
}

interface StepsListProps {
  steps: Step[]
  currentStep: number
  onStepClick: (step: number) => void
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  const progress = (currentStep / steps.length) * 100

  return (
    <div className="flex flex-col h-full">
      {/* Editorial header */}
      <div className="mb-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary mb-2">
          Method
        </p>
        <h2 className="font-serif text-2xl text-foreground leading-tight">
          Recipe Steps
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          {currentStep + 1} of {steps.length}
        </p>
      </div>

      {/* Minimal progress bar */}
      <div className="mb-8">
        <div className="h-0.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 tracking-wide">
          {Math.round(progress)}% complete
        </p>
      </div>

      {/* Steps list with editorial styling */}
      <div className="flex-1 overflow-y-auto -mx-1 px-1">
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-5 top-6 bottom-6 w-px bg-border" />

          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isUpcoming = index > currentStep

            return (
              <button
                key={step.id}
                onClick={() => onStepClick(index)}
                className={cn(
                  "relative w-full flex items-start gap-4 py-3.5 px-1 text-left transition-all duration-300 group",
                  isUpcoming && "opacity-40 hover:opacity-60"
                )}
              >
                {/* Step number - editorial large serif */}
                <div
                  className={cn(
                    "relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                    isCurrent && "bg-primary",
                    isCompleted && "bg-primary/15",
                    isUpcoming && "bg-secondary"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <span
                      className={cn(
                        "font-serif text-base",
                        isCurrent && "text-primary-foreground",
                        isUpcoming && "text-muted-foreground"
                      )}
                    >
                      {step.id}
                    </span>
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0 pt-2">
                  <p
                    className={cn(
                      "text-sm leading-snug transition-colors",
                      isCurrent && "font-medium text-foreground",
                      isCompleted && "text-muted-foreground line-through decoration-primary/30",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                    {step.duration}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
