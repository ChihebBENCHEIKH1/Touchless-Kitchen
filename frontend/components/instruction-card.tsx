"use client"

import { ChevronLeft, ChevronRight, Clock, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface InstructionCardProps {
  stepNumber: number
  totalSteps: number
  title: string
  instruction: string
  duration: string
  tip?: string
  heroImage?: string
  /** Direction of the last navigation — drives the slide-in/out animation */
  direction: "left" | "right" | null
  onPrevious: () => void
  onNext: () => void
  hasPrevious: boolean
  hasNext: boolean
}

// direction=right (Next): new card enters from right, old exits left.
// direction=left  (Prev): new card enters from left,  old exits right.
const slideVariants = {
  enter: (dir: "left" | "right" | null) => ({
    x: dir === "right" ? 60 : dir === "left" ? -60 : 0,
    opacity: dir ? 0 : 1,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: (dir: "left" | "right" | null) => ({
    x: dir === "right" ? -60 : dir === "left" ? 60 : 0,
    opacity: dir ? 0 : 1,
    transition: { duration: 0.28, ease: [0.55, 0, 1, 0.45] as const },
  }),
}

export function InstructionCard({
  stepNumber,
  totalSteps,
  title,
  instruction,
  duration,
  tip,
  heroImage,
  direction,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: InstructionCardProps) {
  return (
    // Outer shell stays mounted; only the step content animates.
    // overflow-hidden clips the slide so content doesn't spill outside the card.
    <div className="flex flex-col h-full overflow-hidden">
      {/* Animated step content — keyed on stepNumber so AnimatePresence
          detects the change and runs enter/exit animations */}
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={stepNumber}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="flex-1 flex flex-col min-h-0"
        >
          {/* Hero image */}
          {heroImage && (
            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]">
              <Image
                src={heroImage}
                alt="Recipe in progress"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                <span className="text-primary-foreground/90 text-[10px] font-medium uppercase tracking-[0.2em]">
                  Classic Margherita Pizza
                </span>
              </div>
            </div>
          )}

          {/* Step meta */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
              Step {stepNumber} of {totalSteps}
            </span>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">{duration}</span>
            </div>
          </div>

          {/* Big editorial step number + title */}
          <div className="mb-6 lg:mb-8">
            <span className="font-serif text-6xl lg:text-8xl text-primary/15 leading-none select-none block -mb-3 lg:-mb-5">
              {String(stepNumber).padStart(2, "0")}
            </span>
            <h2 className="font-serif text-3xl lg:text-4xl xl:text-5xl text-foreground leading-tight text-balance">
              {title}
            </h2>
          </div>

          {/* Pull-quote instruction text */}
          <div className="flex-1 overflow-y-auto">
            <p className="text-lg lg:text-xl xl:text-2xl text-foreground/80 leading-relaxed lg:leading-relaxed text-pretty max-w-prose">
              {instruction}
            </p>

            {/* Chef's Tip - editorial aside */}
            {tip && (
              <div className="mt-8 lg:mt-10 pl-5 border-l-2 border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <p className="text-xs font-serif italic text-primary">
                    {"Chef's Tip"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  {tip}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation — lives outside AnimatePresence so it never animates away */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-border">
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Previous</span>
        </Button>

        {/* Dot progress indicator */}
        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-500 ${
                i === stepNumber - 1
                  ? "w-5 h-1.5 bg-primary"
                  : i < stepNumber - 1
                    ? "w-1.5 h-1.5 bg-primary/40"
                    : "w-1.5 h-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={onNext}
          disabled={!hasNext}
          className="gap-2 text-foreground hover:text-primary transition-colors"
        >
          <span className="text-sm font-medium">
            {hasNext ? "Next Step" : "Finish"}
          </span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
