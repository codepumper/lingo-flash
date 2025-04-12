"use client"

import type { User, Session } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "./supabase"

export type UserProfile = {
  id: string
  email: string
  name: string | null
  streak: number
  last_practice_date: string | null
}

export async function login(email: string, password: string) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function register(name: string, email: string, password: string) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function logout() {
  const supabase = getSupabaseBrowserClient()
  await supabase.auth.signOut()
}

export async function getSession(): Promise<Session | null> {
  const supabase = getSupabaseBrowserClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseBrowserClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient()
  const user = await getCurrentUser()

  if (!user) return null

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error || !data) return null

  return data as UserProfile
}

export async function getUserStats() {
  const supabase = getSupabaseBrowserClient()
  const user = await getCurrentUser()

  if (!user) return null

  // Get user profile for streak info
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak, last_practice_date")
    .eq("id", user.id)
    .single()

  // Get total flashcards count
  const { count: totalCards } = await supabase
    .from("flashcards")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Get mastered cards count (cards with mastery_level >= 80)
  const { count: masteredCards } = await supabase
    .from("flashcards")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("mastery_level", 80)

  // Get weekly stats
  const { data: weeklyStats } = await supabase
    .from("weekly_stats")
    .select("*")
    .eq("user_id", user.id)
    .order("practice_date", { ascending: true })

  // Get cards due for practice
  const { data: dueCards } = await supabase
    .from("flashcards")
    .select("*")
    .eq("user_id", user.id)
    .lte("next_review_date", new Date().toISOString())
    .order("next_review_date", { ascending: true })
    .limit(10)

  // Format weekly data for chart
  const weeklyData = weeklyStats
    ? weeklyStats.map((stat) => {
        const date = new Date(stat.practice_date)
        const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]
        return {
          day,
          value: stat.total_cards_practiced,
        }
      })
    : []

  // Fill in missing days in the last week
  const today = new Date()
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 6)

  const fullWeekData = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(lastWeek)
    date.setDate(date.getDate() + i)
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]

    const existingData = weeklyData.find((d) => d.day === day)
    fullWeekData.push({
      day,
      value: existingData ? existingData.value : 0,
    })
  }

  // Calculate average accuracy from weekly stats
  const accuracyRate =
    weeklyStats && weeklyStats.length > 0
      ? Math.round(weeklyStats.reduce((acc, stat) => acc + Number(stat.accuracy_rate), 0) / weeklyStats.length)
      : 0

  // Calculate average response time from weekly stats
  const avgResponseTime =
    weeklyStats && weeklyStats.length > 0
      ? Math.round(
          (weeklyStats.reduce((acc, stat) => acc + Number(stat.avg_response_time_ms), 0) / weeklyStats.length / 1000) *
            10,
        ) / 10
      : 0

  // Format due cards for practice
  const formattedDueCards = dueCards
    ? dueCards.map((card) => ({
        id: card.id,
        german: card.german,
        english: card.english,
        direction: card.direction,
        front: card.direction === "de-en" ? card.german : card.english,
        back: card.direction === "de-en" ? card.english : card.german,
        masteryLevel: card.mastery_level,
      }))
    : []

  return {
    totalCards: totalCards || 0,
    masteredCards: masteredCards || 0,
    streak: profile?.streak || 0,
    accuracyRate,
    avgResponseTime,
    weeklyReviewed: fullWeekData.reduce((acc, day) => acc + day.value, 0),
    weeklyNewCards: 0, // This would need additional query to calculate
    weeklyData: fullWeekData,
    dueCards: formattedDueCards,
  }
}
