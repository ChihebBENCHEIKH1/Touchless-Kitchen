"use client"

import { forwardRef } from "react"
import { Camera, WifiOff, Loader2 } from "lucide-react"
import type { GestureStatus } from "@/hooks/use-gesture-control"

interface WebcamPreviewProps {
  status: GestureStatus
}

/**
 * Renders the live webcam feed fed by useGestureControl.
 * The ref is forwarded to the <video> element so the hook can set srcObject
 * and call play() directly. The video is mirrored (scale-x-[-1]) so the
 * user's left/right matches the screen — natural for selfie-style interaction.
 */
export const WebcamPreview = forwardRef<HTMLVideoElement, WebcamPreviewProps>(
  ({ status }, ref) => {
    return (
      <div className="relative w-28 h-20 lg:w-36 lg:h-26 rounded-2xl overflow-hidden animate-[glow-pulse_3s_ease-in-out_infinite]">
        {/* Warm background — visible before camera feed arrives */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted rounded-2xl" />

        {/* Live feed — mirrored for natural feel */}
        <video
          ref={ref}
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          style={{ opacity: status === "ready" ? 0.92 : 0 }}
          muted
          playsInline
          aria-hidden
        />

        {/* Placeholder icon when feed is not yet active */}
        {status !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center">
            {status === "error" ? (
              <WifiOff className="w-6 h-6 text-destructive/60" />
            ) : status === "loading" ? (
              <Loader2 className="w-5 h-5 text-muted-foreground/50 animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-muted-foreground/60" />
            )}
          </div>
        )}

        {/* Status pill */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-foreground/5 backdrop-blur-sm rounded-full px-2.5 py-0.5">
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              status === "ready"
                ? "bg-primary animate-pulse"
                : status === "error"
                  ? "bg-destructive"
                  : "bg-muted-foreground/40 animate-pulse"
            }`}
          />
          <span className="text-[9px] font-medium text-muted-foreground tracking-widest uppercase">
            {status === "ready"
              ? "Scanning"
              : status === "error"
                ? "No Camera"
                : "Starting"}
          </span>
        </div>
      </div>
    )
  }
)

WebcamPreview.displayName = "WebcamPreview"
