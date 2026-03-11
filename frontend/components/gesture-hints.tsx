"use client"

import { Hand, ArrowLeft, ArrowRight, ThumbsUp } from "lucide-react"

const gestures = [
  { icon: ArrowLeft,  label: "Swipe Left",  action: "Previous step" },
  { icon: ArrowRight, label: "Swipe Right", action: "Next step" },
  { icon: ThumbsUp,   label: "Hold Thumb",  action: "Save recipe" },
]

export function GestureHints() {
  return (
    <div className="flex items-center gap-4 lg:gap-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Hand className="w-3.5 h-3.5" />
        <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
          Gestures
        </span>
      </div>

      <div className="h-3 w-px bg-border" />

      <div className="flex items-center gap-3 lg:gap-5 overflow-x-auto">
        {gestures.map((gesture) => (
          <div key={gesture.label} className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-full bg-primary/8 flex items-center justify-center">
              <gesture.icon className="w-3 h-3 text-primary" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] font-medium text-foreground/80 leading-none">
                {gesture.label}
              </p>
              <p className="text-[9px] text-muted-foreground leading-none mt-0.5">
                {gesture.action}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
