"use client"

import { useEffect, useState } from "react"

export function ParallaxBackground() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/german-background.jpg')",
          transform: `translateY(${offset * 0.5}px)`,
          opacity: 0.15,
        }}
      />
    </div>
  )
}
