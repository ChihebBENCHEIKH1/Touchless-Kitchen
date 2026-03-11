"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Heart } from "lucide-react"

interface HeartBurstProps {
  show: boolean
}

// Pre-computed particle trajectories — deterministic so no hydration mismatch.
// Each heart flies outward at a unique angle, scale, and stagger delay.
const PARTICLES = [
  { id: 0, x:   0, y: -90, rotate:   0, scale: 1.2, delay: 0.00 },
  { id: 1, x:  64, y: -64, rotate:  20, scale: 0.8, delay: 0.05 },
  { id: 2, x:  90, y:   0, rotate:  40, scale: 1.0, delay: 0.03 },
  { id: 3, x:  64, y:  64, rotate:  60, scale: 0.7, delay: 0.08 },
  { id: 4, x:   0, y:  90, rotate:   0, scale: 0.9, delay: 0.01 },
  { id: 5, x: -64, y:  64, rotate: -60, scale: 0.8, delay: 0.06 },
  { id: 6, x: -90, y:   0, rotate: -40, scale: 1.0, delay: 0.04 },
  { id: 7, x: -64, y: -64, rotate: -20, scale: 0.7, delay: 0.07 },
]

export function HeartBurst({ show }: HeartBurstProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.8 } }}
          aria-hidden
        >
          {/* Central pulse */}
          <motion.div
            className="absolute"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.4, 1], opacity: [1, 1, 0] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Heart className="w-14 h-14 fill-rose-400 text-rose-400" />
          </motion.div>

          {/* Burst particles */}
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute"
              initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: p.x,
                y: p.y,
                scale: p.scale,
                opacity: [0, 1, 1, 0],
                rotate: p.rotate,
              }}
              transition={{
                duration: 1.1,
                delay: p.delay,
                ease: "easeOut",
              }}
            >
              <Heart className="w-7 h-7 fill-rose-400 text-rose-400" />
            </motion.div>
          ))}

          {/* "Recipe saved!" label */}
          <motion.p
            className="absolute top-1/2 mt-16 text-sm font-serif italic text-rose-500"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, -4] }}
            transition={{ duration: 1.8, ease: "easeOut" }}
          >
            Recipe saved!
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
