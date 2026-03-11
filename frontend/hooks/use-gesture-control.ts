"use client"

import { useEffect, useRef, useState } from "react"
import type { GestureRecognizer } from "@mediapipe/tasks-vision"

export type GestureEvent = "swipe-left" | "swipe-right" | "thumbs-up-hold"
export type GestureStatus = "idle" | "loading" | "ready" | "error"

interface UseGestureControlOptions {
  onGesture: (gesture: GestureEvent) => void
  cooldownMs?: number
  enabled?: boolean
}

// ─── Tuning constants ─────────────────────────────────────────────────────────

const FRAME_INTERVAL = 50 // ~20 fps

// Swipe — velocity-based with a 3-frame smoothing window.
// Compute the average per-frame delta over the last 3 frames.
// When the smoothed velocity exceeds the threshold, fire immediately.
// This reacts to actual swipe motion, not accumulated drift.
const SWIPE_BUF_SIZE  = 3    // frames to average velocity over
const SWIPE_VEL_THRESH = 0.018 // avg per-frame speed to trigger (normalized)

const THUMBS_HOLD_MS = 2000

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useGestureControl
 *
 * Uses MediaPipe GestureRecognizer which provides:
 *   - Built-in gesture classification (Thumb_Up, Open_Palm, etc.)
 *   - 21-point hand landmarks for swipe tracking
 *
 * SWIPE DETECTION — smoothed velocity:
 *   Keep the last 3 finger-tip x-positions.  Each frame, compute the
 *   average per-frame delta (prev - current, mirror-corrected).
 *   When |avgDelta| > SWIPE_VEL_THRESH, fire immediately and clear
 *   the buffer to prevent re-firing on the same motion.
 *
 * MIRROR CORRECTION:
 *   delta = prev - current (not current - prev) because the video is
 *   CSS-mirrored. Positive delta = user moved visually right.
 *
 * THUMBS-UP:
 *   Uses the model's built-in Thumb_Up classifier (no manual landmark math).
 *   Must be held for THUMBS_HOLD_MS continuously before firing.
 */
export function useGestureControl({
  onGesture,
  cooldownMs = 1500,
  enabled = true,
}: UseGestureControlOptions) {
  const videoRef    = useRef<HTMLVideoElement>(null)
  const streamRef   = useRef<MediaStream | null>(null)
  const detectorRef = useRef<GestureRecognizer | null>(null)
  const lastFireRef = useRef<number>(0)

  const onGestureRef = useRef(onGesture)
  useEffect(() => { onGestureRef.current = onGesture }, [onGesture])

  const [status, setStatus] = useState<GestureStatus>("idle")

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return

    setStatus("loading")

    let timerId: ReturnType<typeof setTimeout>
    let lastDetectTime = 0
    let cancelled      = false
    let reiniting      = false
    let consecErrors   = 0
    const MAX_ERRORS     = 5
    const DETECT_TIMEOUT = 4000

    // ── Thumbs state ──────────────────────────────────────────────────────
    let thumbsStart: number | null = null

    // ── Swipe state ──────────────────────────────────────────────────────
    const xBuf: number[] = [] // last N finger x-positions

    function emit(gesture: GestureEvent) {
      const now = performance.now()
      if (now - lastFireRef.current < cooldownMs) return
      lastFireRef.current = now
      onGestureRef.current(gesture)
    }

    function scheduleReinit() {
      if (reiniting || cancelled) return
      reiniting = true
      consecErrors = 0
      detectorRef.current?.close()
      detectorRef.current = null
      reinitDetector().finally(() => { reiniting = false })
    }

    // ── Detection loop ────────────────────────────────────────────────────
    function detectionLoop() {
      if (cancelled) return

      const now      = performance.now()
      const video    = videoRef.current
      const detector = detectorRef.current

      if (!video || !detector || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        timerId = setTimeout(detectionLoop, FRAME_INTERVAL)
        return
      }

      if (!reiniting && lastDetectTime > 0 && now - lastDetectTime > DETECT_TIMEOUT) {
        scheduleReinit()
        timerId = setTimeout(detectionLoop, FRAME_INTERVAL)
        return
      }

      let results
      try {
        results = detector.recognizeForVideo(video, now)
        consecErrors   = 0
        lastDetectTime = now
      } catch {
        consecErrors++
        if (consecErrors >= MAX_ERRORS) scheduleReinit()
        timerId = setTimeout(detectionLoop, FRAME_INTERVAL)
        return
      }

      if (!results.landmarks?.length) {
        xBuf.length = 0
        thumbsStart = null
        timerId = setTimeout(detectionLoop, FRAME_INTERVAL)
        return
      }

      const lm = results.landmarks[0]
      const fingerX = lm[8].x // index finger tip

      // ── Swipe detection — smoothed velocity ────────────────────────────
      xBuf.push(fingerX)
      if (xBuf.length > SWIPE_BUF_SIZE) xBuf.shift()

      if (xBuf.length === SWIPE_BUF_SIZE) {
        // Average per-frame delta across the buffer (mirror-corrected)
        let totalDelta = 0
        for (let i = 1; i < xBuf.length; i++) {
          totalDelta += xBuf[i - 1] - xBuf[i] // positive = visual right
        }
        const avgVel = totalDelta / (xBuf.length - 1)

        if (Math.abs(avgVel) > SWIPE_VEL_THRESH) {
          emit(avgVel > 0 ? "swipe-right" : "swipe-left")
          xBuf.length = 0 // clear to prevent re-firing on same motion
        }
      }

      // ── Thumbs-up (from model classifier) ──────────────────────────────
      const gesture = results.gestures?.[0]?.[0]
      const isThumbUp = gesture?.categoryName === "Thumb_Up" && gesture.score > 0.6

      if (isThumbUp) {
        thumbsStart ??= now
        if (now - thumbsStart >= THUMBS_HOLD_MS) {
          emit("thumbs-up-hold")
          thumbsStart = now
        }
      } else {
        thumbsStart = null
      }

      timerId = setTimeout(detectionLoop, FRAME_INTERVAL)
    }

    // ── Init MediaPipe ────────────────────────────────────────────────────
    type VisionModule = typeof import("@mediapipe/tasks-vision")
    let visionInstance: Awaited<ReturnType<VisionModule["FilesetResolver"]["forVisionTasks"]>> | null = null
    let GestureRecognizerClass: VisionModule["GestureRecognizer"] | null = null

    async function reinitDetector() {
      if (cancelled || !GestureRecognizerClass || !visionInstance) return
      try {
        detectorRef.current = await GestureRecognizerClass.createFromOptions(visionInstance, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        })
        lastDetectTime = performance.now()
        xBuf.length = 0
      } catch {
        if (!cancelled) setStatus("error")
      }
    }

    async function init() {
      try {
        const { GestureRecognizer, FilesetResolver } = await import("@mediapipe/tasks-vision")
        if (cancelled) return

        GestureRecognizerClass = GestureRecognizer

        visionInstance = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        )
        if (cancelled) return

        detectorRef.current = await GestureRecognizer.createFromOptions(visionInstance, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        })
        if (cancelled) return

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }

        streamRef.current = stream
        const video = videoRef.current
        if (video) { video.srcObject = stream; await video.play() }

        lastDetectTime = performance.now()
        setStatus("ready")
        timerId = setTimeout(detectionLoop, FRAME_INTERVAL)
      } catch {
        if (!cancelled) setStatus("error")
      }
    }

    init()

    return () => {
      cancelled = true
      clearTimeout(timerId)
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      detectorRef.current?.close()
      detectorRef.current = null
    }
  }, [enabled, cooldownMs])

  return { videoRef, status }
}
