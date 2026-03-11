/**
 * Gesture Worker — runs MediaPipe Hand Landmarker off the main thread.
 *
 * COORDINATE NORMALIZATION (distance-independence):
 * MediaPipe always returns landmarks in the range [0, 1] for both x and y,
 * relative to the video frame dimensions. This means a user 2 ft away and a
 * user 5 ft away produce the same x=0.3 when their wrist is at the left third
 * of the frame. The absolute pixel size of their hand changes, but the
 * *normalized ratio* does not. Swipe thresholds operate on this normalized
 * space, so they behave identically regardless of distance.
 */

// ESM module worker — instantiate with: new Worker('/gesture-worker.js', { type: 'module' })
import {
  HandLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/+esm";

// ─── Config ───────────────────────────────────────────────────────────────────
const SWIPE_THRESHOLD = 0.20;    // normalized x delta to trigger a swipe
const THUMBS_UP_HOLD_MS = 2000;  // ms the thumbs-up must be held

// ─── State ────────────────────────────────────────────────────────────────────
let handLandmarker = null;
let gestureStartX = null;
let thumbsUpStartTime = null;

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 1,
  });

  self.postMessage({ type: "ready" });
}

// ─── Gesture classifiers ──────────────────────────────────────────────────────

/**
 * Thumbs-up: thumb tip is above (lower y) the thumb IP joint, and all four
 * fingers are curled (their tips are below their PIP joints in y).
 * Works because y=0 is the top of frame; a raised thumb has smaller y than
 * its knuckles, while curled fingers have larger y at the tip than at PIP.
 */
function isThumbsUp(lm) {
  const thumbRising = lm[4].y < lm[3].y && lm[3].y < lm[2].y;
  const indexCurled  = lm[8].y  > lm[6].y;
  const middleCurled = lm[12].y > lm[10].y;
  const ringCurled   = lm[16].y > lm[14].y;
  const pinkyCurled  = lm[20].y > lm[18].y;
  return thumbRising && indexCurled && middleCurled && ringCurled && pinkyCurled;
}

// ─── Message handler ──────────────────────────────────────────────────────────
self.onmessage = async (e) => {
  if (e.data.type === "init") {
    await init();
    return;
  }

  if (e.data.type === "frame" && handLandmarker) {
    const { bitmap, timestamp } = e.data;
    const results = handLandmarker.detectForVideo(bitmap, timestamp);
    bitmap.close(); // free GPU/CPU memory immediately

    if (!results.landmarks?.length) {
      // Hand left frame — reset both trackers
      gestureStartX = null;
      thumbsUpStartTime = null;
      return;
    }

    const lm = results.landmarks[0];

    // ── Swipe detection (wrist = landmark 0) ──────────────────────────────
    // We anchor gestureStartX when the hand first appears (or after a swipe).
    // The delta is purely in normalized space, so it's distance-independent.
    const wristX = lm[0].x; // [0, 1]: 0 = left edge, 1 = right edge

    if (gestureStartX === null) {
      gestureStartX = wristX;
    } else {
      const delta = wristX - gestureStartX;

      if (delta > SWIPE_THRESHOLD) {
        // Hand moved right in the (mirrored) frame → user swiped right
        self.postMessage({ type: "gesture", gesture: "swipe-right" });
        gestureStartX = wristX; // re-anchor to prevent re-firing
      } else if (delta < -SWIPE_THRESHOLD) {
        // Hand moved left → user swiped left
        self.postMessage({ type: "gesture", gesture: "swipe-left" });
        gestureStartX = wristX;
      }
    }

    // ── Thumbs-up hold detection ──────────────────────────────────────────
    if (isThumbsUp(lm)) {
      if (thumbsUpStartTime === null) {
        thumbsUpStartTime = timestamp;
      } else if (timestamp - thumbsUpStartTime >= THUMBS_UP_HOLD_MS) {
        self.postMessage({ type: "gesture", gesture: "thumbs-up-hold" });
        // Advance the start time by the hold duration so the event fires
        // again only after another full THUMBS_UP_HOLD_MS, not immediately.
        thumbsUpStartTime = timestamp;
      }
    } else {
      thumbsUpStartTime = null;
    }
  }
};
