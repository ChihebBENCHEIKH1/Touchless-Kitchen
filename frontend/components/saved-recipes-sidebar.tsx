"use client"

import { Search, BookmarkIcon, Clock, Users, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface Recipe {
  id: string
  title: string
  duration: string
  servings: number
  image?: string
}

interface SavedRecipesSidebarProps {
  recipes: Recipe[]
  selectedRecipeId: string
  onSelectRecipe: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

export function SavedRecipesSidebar({
  recipes,
  selectedRecipeId,
  onSelectRecipe,
  isOpen,
  onClose,
}: SavedRecipesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 pb-4">
            <div className="flex items-center gap-2.5">
              <BookmarkIcon className="w-4 h-4 text-sidebar-primary" />
              <h2 className="font-serif text-lg text-sidebar-foreground">
                Saved Recipes
              </h2>
            </div>
            <button
              className="lg:hidden w-7 h-7 rounded-full flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="px-5 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sidebar-foreground/40" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-sidebar-accent/60 border-0 rounded-xl text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-1 focus:ring-sidebar-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="px-5">
            <div className="h-px bg-sidebar-border" />
          </div>

          {/* Recipe list */}
          <ScrollArea className="flex-1 px-5 pt-4">
            <div className="space-y-1 pb-4">
              {filteredRecipes.map((recipe) => {
                const isSelected = selectedRecipeId === recipe.id
                return (
                  <button
                    key={recipe.id}
                    onClick={() => {
                      onSelectRecipe(recipe.id)
                      onClose()
                    }}
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-all duration-200",
                      isSelected
                        ? "bg-sidebar-primary/20"
                        : "hover:bg-sidebar-accent/60"
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm leading-snug mb-1.5",
                        isSelected
                          ? "font-medium text-sidebar-primary"
                          : "text-sidebar-foreground/90"
                      )}
                    >
                      {recipe.title}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-sidebar-foreground/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {recipe.servings}
                      </span>
                    </div>
                  </button>
                )
              })}

              {filteredRecipes.length === 0 && (
                <div className="text-center py-8 text-sidebar-foreground/40">
                  <p className="text-sm italic">No recipes found</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer branding */}
          <div className="p-5 pt-3">
            <div className="h-px bg-sidebar-border mb-4" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/30 text-center">
              Touchless Kitchen
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
