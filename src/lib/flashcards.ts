'use client'

import { getSupabaseBrowserClient } from './supabase'
import { getCurrentUser } from './auth'

export type Flashcard = {
	id: string
	german: string
	english: string
	direction: string
	lastPracticed: string | null
	masteryLevel: number
	front?: string
	back?: string
}

export async function getFlashcards(): Promise<Flashcard[]> {
	const supabase = getSupabaseBrowserClient()
	const user = await getCurrentUser()

	if (!user) return []

	const { data, error } = await supabase.from('flashcards').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

	if (error || !data) return []

	return data.map(card => ({
		id: card.id,
		german: card.german,
		english: card.english,
		direction: card.direction,
		lastPracticed: card.last_practiced ? new Date(card.last_practiced).toLocaleDateString() : null,
		masteryLevel: card.mastery_level
	}))
}

export async function getFlashcardsForPractice(): Promise<Flashcard[]> {
	const supabase = getSupabaseBrowserClient()
	const user = await getCurrentUser()

	if (!user) return []

	const { data, error } = await supabase.from('flashcards').select('*').eq('user_id', user.id).lte('next_review_date', new Date().toISOString()).order('next_review_date', { ascending: true }).limit(20)

	if (error || !data) return []

	return data.map(card => ({
		id: card.id,
		german: card.german,
		english: card.english,
		direction: card.direction,
		lastPracticed: card.last_practiced ? new Date(card.last_practiced).toLocaleDateString() : null,
		masteryLevel: card.mastery_level,
		front: card.direction === 'de-en' ? card.german : card.english,
		back: card.direction === 'de-en' ? card.english : card.german
	}))
}

export async function getRandomFlashcards(limit = 10): Promise<Flashcard[]> {
	const supabase = getSupabaseBrowserClient()
	const user = await getCurrentUser()

	if (!user) return []

	// Get total count of flashcards
	const { count } = await supabase.from('flashcards').select('*', { count: 'exact', head: true }).eq('user_id', user.id)

	if (!count || count === 0) return []

	// Get all flashcards
	const { data, error } = await supabase.from('flashcards').select('*').eq('user_id', user.id)

	if (error || !data) return []

	// Shuffle the array and take the first 'limit' items
	const shuffled = [...data].sort(() => 0.5 - Math.random())
	const selected = shuffled.slice(0, Math.min(limit, shuffled.length))

	// Always use English to German direction for practice
	return selected.map(card => ({
		id: card.id,
		german: card.german,
		english: card.english,
		direction: 'en-de', // Force English to German direction
		lastPracticed: card.last_practiced ? new Date(card.last_practiced).toLocaleDateString() : null,
		masteryLevel: card.mastery_level,
		front: card.english, // English is the front (question)
		back: card.german // German is the back (answer)
	}))
}

export async function createFlashcard(german: string, english: string, direction: string): Promise<Flashcard | null> {
	const supabase = getSupabaseBrowserClient()
	const user = await getCurrentUser()

	if (!user) return null

	const { data, error } = await supabase
		.from('flashcards')
		.insert([
			{
				user_id: user.id,
				german,
				english,
				direction,
				mastery_level: 0,
				next_review_date: new Date().toISOString()
			}
		])
		.select()
		.single()

	if (error || !data) return null

	return {
		id: data.id,
		german: data.german,
		english: data.english,
		direction: data.direction,
		lastPracticed: null,
		masteryLevel: data.mastery_level
	}
}

export async function deleteFlashcard(id: string): Promise<boolean> {
	const supabase = getSupabaseBrowserClient()
	const user = await getCurrentUser()

	if (!user) return false

	const { error } = await supabase.from('flashcards').delete().eq('id', id).eq('user_id', user.id)

	return !error
}

export async function saveFlashcardResult(id: string, correct: boolean): Promise<boolean> {
	const supabase = getSupabaseBrowserClient()
	const user = await getCurrentUser()

	if (!user) return false

	// Get current flashcard
	const { data: flashcard } = await supabase.from('flashcards').select('*').eq('id', id).eq('user_id', user.id).single()

	if (!flashcard) return false

	// Calculate new mastery level
	const newMasteryLevel = correct ? Math.min(100, flashcard.mastery_level + 5) : Math.max(0, flashcard.mastery_level - 10)

	// Calculate next review date based on spaced repetition algorithm
	// The higher the mastery level, the longer until next review
	const now = new Date()
	let daysUntilNextReview = 1

	if (correct) {
		if (newMasteryLevel < 30) daysUntilNextReview = 1
		else if (newMasteryLevel < 50) daysUntilNextReview = 3
		else if (newMasteryLevel < 70) daysUntilNextReview = 7
		else if (newMasteryLevel < 90) daysUntilNextReview = 14
		else daysUntilNextReview = 30
	} else {
		// If incorrect, review again soon
		daysUntilNextReview = 1
	}

	const nextReviewDate = new Date(now)
	nextReviewDate.setDate(now.getDate() + daysUntilNextReview)

	// Update flashcard
	const { error: updateError } = await supabase
		.from('flashcards')
		.update({
			mastery_level: newMasteryLevel,
			last_practiced: now.toISOString(),
			next_review_date: nextReviewDate.toISOString()
		})
		.eq('id', id)
		.eq('user_id', user.id)

	if (updateError) return false

	// Record practice session
	const { error: sessionError } = await supabase.from('practice_sessions').insert([
		{
			user_id: user.id,
			flashcard_id: id,
			correct,
			response_time_ms: 0 // We're not tracking response time yet
		}
	])

	// Update user streak if needed
	const { data: profile } = await supabase.from('profiles').select('last_practice_date, streak').eq('id', user.id).single()

	if (profile) {
		const today = new Date().toISOString().split('T')[0]
		let newStreak = profile.streak || 0

		if (profile.last_practice_date) {
			const lastPractice = new Date(profile.last_practice_date)
			const yesterday = new Date()
			yesterday.setDate(yesterday.getDate() - 1)

			if (lastPractice.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
				// Practiced yesterday, increment streak
				newStreak += 1
			} else if (lastPractice.toISOString().split('T')[0] !== today) {
				// Didn't practice yesterday or today yet, reset streak
				newStreak = 1
			}
		} else {
			// First time practicing
			newStreak = 1
		}

		await supabase
			.from('profiles')
			.update({
				last_practice_date: today,
				streak: newStreak
			})
			.eq('id', user.id)
	}

	return !sessionError
}
