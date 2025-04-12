declare global {
  interface Window {
    confetti: any
  }
}

export default function confetti(options: any = {}) {
  // Default options
  const defaults = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  }

  // Merge options
  const mergedOptions = { ...defaults, ...options }

  // Check if window is defined (client-side)
  if (typeof window !== "undefined") {
    // Dynamically import the library if needed
    if (!window.confetti) {
      import("canvas-confetti").then((module) => {
        window.confetti = module.default
        window.confetti(mergedOptions)
      })
    } else {
      window.confetti(mergedOptions)
    }
  }
}
