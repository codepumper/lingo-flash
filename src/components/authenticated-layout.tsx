"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getSession, logout } from "@/lib/auth"
import { ParallaxBackground } from "./parallax-background"
import { BookOpen, Home, LogOut, PenTool } from "lucide-react"

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (!session) {
        router.push("/login")
      } else {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background/95">
      <ParallaxBackground />
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">
              <span className="mr-2">🇩🇪</span>GermanFlash
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`text-sm font-medium flex items-center gap-1 ${pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"}`}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/flashcards"
              className={`text-sm font-medium flex items-center gap-1 ${pathname === "/flashcards" ? "text-primary" : "text-muted-foreground"}`}
            >
              <BookOpen className="h-4 w-4" />
              My Flashcards
            </Link>
            <Link
              href="/practice"
              className={`text-sm font-medium flex items-center gap-1 ${pathname === "/practice" ? "text-primary" : "text-muted-foreground"}`}
            >
              <PenTool className="h-4 w-4" />
              Practice
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1">
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="md:hidden flex justify-center border-b bg-background/95 py-2">
        <nav className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className={`text-sm font-medium flex flex-col items-center ${pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"}`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link
            href="/flashcards"
            className={`text-sm font-medium flex flex-col items-center ${pathname === "/flashcards" ? "text-primary" : "text-muted-foreground"}`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs">Flashcards</span>
          </Link>
          <Link
            href="/practice"
            className={`text-sm font-medium flex flex-col items-center ${pathname === "/practice" ? "text-primary" : "text-muted-foreground"}`}
          >
            <PenTool className="h-5 w-5" />
            <span className="text-xs">Practice</span>
          </Link>
        </nav>
      </div>
      <main className="flex-1">{children}</main>
    </div>
  )
}
