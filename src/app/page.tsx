import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ParallaxBackground } from "@/components/parallax-background"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <ParallaxBackground />
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">
              <span className="mr-2">🇩🇪</span>GermanFlash
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl lg:text-5xl">
              Master German Vocabulary <br className="hidden sm:inline" />
              with Spaced Repetition 🚀
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              Improve your German vocabulary efficiently with our flashcard system. Track your progress and see your
              improvement over time.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/register">
              <Button size="lg" className="flex items-center gap-2">
                Get Started <span className="text-lg">🎯</span>
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </section>
        <section className="container py-12">
          <h2 className="mb-8 text-center text-2xl font-bold">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Create Flashcards <span className="text-2xl">📝</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Add German words and their English translations to your personal collection.</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Practice Daily <span className="text-2xl">🔄</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Review your flashcards using our spaced repetition system for optimal learning.</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Track Progress <span className="text-2xl">📈</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Monitor your learning with detailed weekly statistics and performance metrics.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 bg-background/95">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GermanFlash. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
