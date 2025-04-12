"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserStats } from "@/lib/auth"
import { StatsChart } from "@/components/stats-chart"
import { FlashcardDeck } from "@/components/flashcard-deck"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { Award, BarChart2, BookOpen, Calendar, Clock, PenTool, Percent, Zap } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const userStats = await getUserStats()
        setStats(userStats)
      } catch (error) {
        console.error("Failed to load stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <AuthenticatedLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Zap className="mr-2 h-8 w-8" /> Dashboard
        </h1>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4 w-full justify-start overflow-auto">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart2 className="mr-1 h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center">
              <PenTool className="mr-1 h-4 w-4" /> Practice
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <Award className="mr-1 h-4 w-4" /> Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-blue-500" /> Total Flashcards
                  </CardTitle>
                  <CardDescription>Your vocabulary collection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoading ? "..." : stats?.totalCards || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5 text-green-500" /> Mastered Words
                  </CardTitle>
                  <CardDescription>Words you know well</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoading ? "..." : stats?.masteredCards || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-red-500" /> Study Streak
                  </CardTitle>
                  <CardDescription>Days in a row</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold flex items-center">
                    {isLoading ? "..." : stats?.streak || 0}
                    {stats?.streak > 0 && <span className="ml-2">🔥</span>}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5 text-purple-500" /> Weekly Progress
                  </CardTitle>
                  <CardDescription>Your learning activity for the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">Loading... ⏳</div>
                  ) : (
                    <StatsChart data={stats?.weeklyData || []} />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="practice">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PenTool className="mr-2 h-5 w-5 text-blue-500" /> Quick Practice
                </CardTitle>
                <CardDescription>Review words due for practice today</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">Loading... ⏳</div>
                ) : (
                  <FlashcardDeck cards={stats?.dueCards || []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-amber-500" /> Learning Statistics
                </CardTitle>
                <CardDescription>Detailed view of your learning progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Percent className="mr-2 h-4 w-4 text-green-500" /> Accuracy Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{isLoading ? "..." : `${stats?.accuracyRate || 0}%`}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-blue-500" /> Average Response Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{isLoading ? "..." : `${stats?.avgResponseTime || 0}s`}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <PenTool className="mr-2 h-4 w-4 text-purple-500" /> Cards Reviewed This Week
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{isLoading ? "..." : stats?.weeklyReviewed || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <BookOpen className="mr-2 h-4 w-4 text-amber-500" /> New Cards This Week
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{isLoading ? "..." : stats?.weeklyNewCards || 0}</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  )
}
