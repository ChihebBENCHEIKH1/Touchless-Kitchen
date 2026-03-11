"use client"

import { useState, useCallback } from "react"
import { Menu, ChefHat } from "lucide-react"
import { WebcamPreview } from "./webcam-preview"
import { GestureHints } from "./gesture-hints"
import { StepsList } from "./steps-list"
import { InstructionCard } from "./instruction-card"
import { SavedRecipesSidebar } from "./saved-recipes-sidebar"
import { HeartBurst } from "./heart-burst"
import { useGestureControl, type GestureEvent } from "@/hooks/use-gesture-control"
import { saveRecipe } from "@/app/actions/recipes"

const savedRecipes = [
  {
    id: "1",
    title: "Classic Margherita Pizza",
    duration: "45 min",
    servings: 4,
  },
  {
    id: "2",
    title: "Creamy Mushroom Risotto",
    duration: "35 min",
    servings: 2,
  },
  {
    id: "3",
    title: "Pan-Seared Salmon with Beurre Blanc",
    duration: "25 min",
    servings: 2,
  },
  {
    id: "4",
    title: "Thai Green Curry with Jasmine Rice",
    duration: "40 min",
    servings: 4,
  },
  {
    id: "5",
    title: "Handmade Pasta Carbonara",
    duration: "30 min",
    servings: 2,
  },
]

const recipeSteps = [
  {
    id: 1,
    title: "Prepare the dough",
    instruction:
      "In a large mixing bowl, combine 500g of tipo 00 flour with 7g of active dry yeast, creating a well in the center. Pour in 325ml of warm water and 2 tablespoons of extra-virgin olive oil. Bring the mixture together with your hands until a shaggy, rustic dough begins to form.",
    duration: "10 min",
    tip: "The water should be warm to the touch, around 110\u00B0F. If it feels hot on your wrist, let it cool \u2014 too much heat will kill the yeast before it has a chance to work.",
  },
  {
    id: 2,
    title: "Knead until silky",
    instruction:
      "Turn the dough out onto a lightly floured marble or wooden surface. Knead with the heel of your palm for 8 to 10 minutes, folding and turning rhythmically, until the dough transforms into something smooth, elastic, and alive beneath your hands.",
    duration: "10 min",
    tip: "Resist the urge to add too much flour. A slightly tacky dough yields a lighter, airier crust. If it sticks, dust your hands rather than the surface.",
  },
  {
    id: 3,
    title: "First rise",
    instruction:
      "Place the dough in a lightly oiled ceramic bowl, turning it once to coat. Cover with a clean linen towel and set in the warmest corner of your kitchen. Let it rise undisturbed for 1 to 2 hours until it has doubled in volume and feels pillowy.",
    duration: "90 min",
    tip: "An oven with just the light on creates the perfect proofing environment \u2014 warm and draft-free. Patience here is what separates good pizza from extraordinary pizza.",
  },
  {
    id: 4,
    title: "Make the sauce",
    instruction:
      "While the dough dreams of becoming pizza, crush 400g of San Marzano tomatoes by hand over a bowl, letting the juices run through your fingers. Season with flaky sea salt, two cloves of finely minced garlic, and a generous handful of torn fresh basil. No cooking required.",
    duration: "5 min",
  },
  {
    id: 5,
    title: "Shape by hand",
    instruction:
      "Punch down the risen dough with a satisfying deflation, then divide into two equal portions. On a well-floured surface, press each ball flat with your fingertips, then stretch gently from the center outward, rotating as you go, until you have a beautiful 12-inch round.",
    duration: "5 min",
    tip: "Never use a rolling pin \u2014 it crushes the delicate air bubbles you spent hours building. Your hands are the only tools you need. Gravity helps too: drape the dough over your fists and let it stretch itself.",
  },
  {
    id: 6,
    title: "Top with intention",
    instruction:
      "Spoon a thin, even layer of raw tomato sauce onto each round, leaving a generous 1-inch border for the cornicione. Tear fresh fior di latte mozzarella into rough pieces and scatter them with artful imprecision. Finish with a thread of your finest olive oil.",
    duration: "5 min",
  },
  {
    id: 7,
    title: "Into the fire",
    instruction:
      "Slide each pizza onto a preheated pizza stone \u2014 or an inverted sheet pan if that is what you have \u2014 in a 500\u00B0F oven. Watch through the glass as the crust puffs and browns, the cheese melts into golden pools, and the edges char in the most beautiful way. 10 to 12 minutes is all it takes.",
    duration: "12 min",
    tip: "If you have a pizza stone, preheat it for at least 30 minutes. The thermal shock is what gives you that crackly, blistered crust that shatters when you bite into it.",
  },
  {
    id: 8,
    title: "Rest, garnish, and serve",
    instruction:
      "Remove from the oven and resist cutting for two full minutes \u2014 this lets the cheese set just enough. Scatter whole basil leaves across the surface, crack black pepper if the mood strikes, and slice into imperfect wedges. Serve immediately. This pizza waits for no one.",
    duration: "3 min",
  },
]

export function RecipeDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedRecipeId, setSelectedRecipeId] = useState("1")
  const [currentStep, setCurrentStep] = useState(0)
  /** Drives the slide direction in InstructionCard's AnimatePresence */
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const [showHearts, setShowHearts] = useState(false)

  const currentStepData = recipeSteps[currentStep]

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setDirection("left")
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNextStep = () => {
    if (currentStep < recipeSteps.length - 1) {
      setDirection("right")
      setCurrentStep(currentStep + 1)
    }
  }

  /**
   * Gesture state machine.
   * Uses functional setState for currentStep so it never captures a stale
   * closure even if gestures fire in quick succession near the cooldown edge.
   */
  const handleGesture = useCallback(
    async (gesture: GestureEvent) => {
      if (gesture === "swipe-right") {
        setDirection("right")
        setCurrentStep((prev) => Math.min(prev + 1, recipeSteps.length - 1))
      } else if (gesture === "swipe-left") {
        setDirection("left")
        setCurrentStep((prev) => Math.max(prev - 1, 0))
      } else if (gesture === "thumbs-up-hold") {
        setShowHearts(true)
        setTimeout(() => setShowHearts(false), 2200)
        // Persist the currently viewed recipe via Server Action
        await saveRecipe(selectedRecipeId, "demo-user")
      }
    },
    [selectedRecipeId]
  )

  const { videoRef, status } = useGestureControl({
    onGesture: handleGesture,
    cooldownMs: 1500,
  })

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Heart burst overlay — portal-style fixed layer, pointer-events-none */}
      <HeartBurst show={showHearts} />
      {/* Saved Recipes Sidebar */}
      <SavedRecipesSidebar
        recipes={savedRecipes}
        selectedRecipeId={selectedRecipeId}
        onSelectRecipe={(id) => {
          setSelectedRecipeId(id)
          setDirection(null)
          setCurrentStep(0)
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Top bar - minimal, editorial */}
        <header className="flex items-center justify-between px-5 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-serif text-lg text-foreground leading-none">
                  Touchless Kitchen
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                  Hands-free cooking
                </p>
              </div>
            </div>
          </div>

          {/* Webcam preview — centered in header */}
          <WebcamPreview ref={videoRef} status={status} />

          {/* Spacer to balance the layout */}
          <div className="w-9 h-9 lg:hidden" />
        </header>

        {/* Gesture hints - subtle divider */}
        <div className="px-5 lg:px-8 py-2.5 border-b border-border/60">
          <GestureHints />
        </div>

        {/* Main dashboard area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Steps list (left side) */}
          <aside className="hidden md:flex w-72 lg:w-80 border-r border-border/50 p-5 lg:p-7">
            <StepsList
              steps={recipeSteps}
              currentStep={currentStep}
              onStepClick={(index) => {
                setDirection(index > currentStep ? "right" : "left")
                setCurrentStep(index)
              }}
            />
          </aside>

          {/* Instruction card (right side) */}
          <main className="flex-1 p-5 lg:p-8 xl:p-10 overflow-y-auto">
            <InstructionCard
              stepNumber={currentStepData.id}
              totalSteps={recipeSteps.length}
              title={currentStepData.title}
              instruction={currentStepData.instruction}
              duration={currentStepData.duration}
              tip={currentStepData.tip}
              heroImage={currentStep === 0 ? "/images/pizza-hero.jpg" : undefined}
              direction={direction}
              onPrevious={handlePreviousStep}
              onNext={handleNextStep}
              hasPrevious={currentStep > 0}
              hasNext={currentStep < recipeSteps.length - 1}
            />

            {/* Mobile step dots */}
            <div className="mt-6 flex items-center justify-center gap-1.5 md:hidden">
              {recipeSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentStep ? "right" : "left")
                    setCurrentStep(index)
                  }}
                  className={`rounded-full transition-all duration-500 ${
                    index === currentStep
                      ? "w-5 h-1.5 bg-primary"
                      : index < currentStep
                        ? "w-1.5 h-1.5 bg-primary/40"
                        : "w-1.5 h-1.5 bg-border"
                  }`}
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
