"use server"

/**
 * Server Actions — Recipe persistence
 *
 * To wire up the real database:
 *   1. pnpm add @prisma/client prisma
 *   2. npx prisma init  (creates prisma/schema.prisma + .env)
 *   3. Add the models below to prisma/schema.prisma
 *   4. npx prisma db push  (or migrate dev)
 *   5. Uncomment the Prisma lines below and remove the stub return
 *
 * ─── Prisma schema fragment ───────────────────────────────────────────────────
 *
 * model User {
 *   id           String        @id @default(cuid())
 *   savedRecipes SavedRecipe[]
 * }
 *
 * model Recipe {
 *   id           String        @id @default(cuid())
 *   title        String
 *   duration     String
 *   servings     Int
 *   savedBy      SavedRecipe[]
 * }
 *
 * model SavedRecipe {
 *   userId    String
 *   recipeId  String
 *   savedAt   DateTime @default(now())
 *
 *   user   User   @relation(fields: [userId],   references: [id], onDelete: Cascade)
 *   recipe Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
 *
 *   @@id([userId, recipeId])  // composite PK prevents duplicate saves
 * }
 * ─────────────────────────────────────────────────────────────────────────────
 */

// import { PrismaClient } from "@prisma/client"
// const prisma = new PrismaClient()

export async function saveRecipe(
  recipeId: string,
  userId: string
): Promise<{ success: boolean; recipeId: string }> {
  // Upsert so a second thumbs-up on the same recipe is idempotent.
  // const saved = await prisma.savedRecipe.upsert({
  //   where:  { userId_recipeId: { userId, recipeId } },
  //   create: { userId, recipeId },
  //   update: { savedAt: new Date() },
  // })

  // ── Stub (remove once Prisma is connected) ────────────────────────────────
  console.log(`[saveRecipe] userId=${userId}  recipeId=${recipeId}`)
  return { success: true, recipeId }
}

export async function getSavedRecipes(userId: string): Promise<string[]> {
  // const rows = await prisma.savedRecipe.findMany({
  //   where:  { userId },
  //   select: { recipeId: true },
  //   orderBy: { savedAt: "desc" },
  // })
  // return rows.map((r) => r.recipeId)

  console.log(`[getSavedRecipes] userId=${userId}`)
  return []
}
