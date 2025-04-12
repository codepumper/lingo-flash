'use client'

import type React from 'react'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { getRandomFlashcards, saveFlashcardResult } from '@/lib/flashcards'
import AuthenticatedLayout from '@/components/authenticated-layout'
import { AlertCircle, CheckCircle2, ChevronRight, Lightbulb, RefreshCw, PenTool, BookOpen, Home } from 'lucide-react'
import { Flashcard } from '@/lib/flashcards'
import confetti from 'canvas-confetti'

export default function PracticePage() {
	const [cards, setCards] = useState<Flashcard[]>([])
	const [currentCardIndex, setCurrentCardIndex] = useState(0)
	const [answer, setAnswer] = useState('')
	const [feedback, setFeedback] = useState<null | { correct: boolean; message: string }>(null)
	const [attempts, setAttempts] = useState(0)
	const [isLoading, setIsLoading] = useState(true)
	const [isComplete, setIsComplete] = useState(false)
	const [results, setResults] = useState({ correct: 0, incorrect: 0, totalAttempts: 0 })
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		const loadCards = async () => {
			try {
				// Get 10 random flashcards instead of due cards
				const practiceCards = await getRandomFlashcards(10)
				setCards(practiceCards)
				setIsComplete(practiceCards.length === 0)
			} catch (error) {
				console.error('Failed to load flashcards:', error)
			} finally {
				setIsLoading(false)
			}
		}

		loadCards()
	}, [])

	useEffect(() => {
		// Focus the input when the card changes
		if (inputRef.current && !feedback) {
			inputRef.current.focus()
		}
	}, [currentCardIndex, feedback])

	const checkAnswer = () => {
		if (!answer.trim()) return

		const currentCard = cards[currentCardIndex]

		if (!currentCard || !currentCard.back) {
		console.error("Current card or its 'back' property is undefined.")
		return
		}
		
		const correctAnswer = currentCard.back.toLowerCase().trim()
		const userAnswer = answer.toLowerCase().trim()

		// Check if the answer is correct (allowing for some flexibility)
		const isCorrect = userAnswer === correctAnswer || correctAnswer.includes(userAnswer) || userAnswer.includes(correctAnswer)

		setAttempts(attempts + 1)

		if (isCorrect) {
			setFeedback({
				correct: true,
				message: 'Correct! 🎉'
			})

			// Trigger confetti for correct answers
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 }
			})
		} else {
			if (attempts >= 2) {
				// After 3 attempts, show the correct answer
				setFeedback({
					correct: false,
					message: `The correct answer is: ${currentCard.back}`
				})
			} else {
				setFeedback({
					correct: false,
					message: 'Try again! 🤔'
				})
			}
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			if (feedback && (feedback.correct || attempts >= 2)) {
				moveToNextCard()
			} else {
				checkAnswer()
			}
		}
	}

	const moveToNextCard = async () => {
		const currentCard = cards[currentCardIndex]
		const isCorrect = feedback?.correct || false

		try {
			await saveFlashcardResult(currentCard.id, isCorrect)

			setResults({
				correct: isCorrect ? results.correct + 1 : results.correct,
				incorrect: !isCorrect ? results.incorrect + 1 : results.incorrect,
				totalAttempts: results.totalAttempts + attempts
			})

			if (currentCardIndex === cards.length - 1) {
				setIsComplete(true)
			} else {
				setCurrentCardIndex(currentCardIndex + 1)
				setAnswer('')
				setFeedback(null)
				setAttempts(0)
			}
		} catch (error) {
			console.error('Failed to save result:', error)
		}
	}

	const handleRestart = () => {
		// Reload random cards when restarting
		setIsLoading(true)
		getRandomFlashcards(10)
			.then(newCards => {
				setCards(newCards)
				setCurrentCardIndex(0)
				setAnswer('')
				setFeedback(null)
				setAttempts(0)
				setIsComplete(false)
				setResults({ correct: 0, incorrect: 0, totalAttempts: 0 })
			})
			.catch(error => {
				console.error('Failed to load new flashcards:', error)
			})
			.finally(() => {
				setIsLoading(false)
			})
	}

	const currentCard = cards[currentCardIndex]
	const progress = cards.length > 0 ? (currentCardIndex / cards.length) * 100 : 0

	return (
		<AuthenticatedLayout>
			<div className="container py-8">
				<div className="max-w-2xl mx-auto">
					<h1 className="text-3xl font-bold mb-6 flex items-center">
						<PenTool className="mr-2 h-8 w-8" /> Practice Session
					</h1>

					{isLoading ? (
						<div className="flex items-center justify-center h-64">
							<p>Loading flashcards... ⏳</p>
						</div>
					) : cards.length === 0 ? (
						<Card className="bg-white/80 backdrop-blur-sm">
							<CardContent className="p-6 text-center">
								<div className="text-6xl mb-4">🎉</div>
								<p className="mb-4">You don&apos;t have any flashcards yet. Add some to start practicing.</p>
								<Button onClick={() => (window.location.href = '/flashcards')} className="flex items-center">
									<BookOpen className="mr-2 h-4 w-4" /> Add New Flashcards
								</Button>
							</CardContent>
						</Card>
					) : isComplete ? (
						<Card className="bg-white/80 backdrop-blur-sm">
							<CardContent className="p-6">
								<h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center">
									<CheckCircle2 className="mr-2 h-6 w-6 text-green-500" /> Practice Complete!
								</h2>
								<div className="grid grid-cols-2 gap-4 mb-6">
									<div className="bg-green-50 p-4 rounded-lg text-center">
										<p className="text-sm text-green-600 mb-1">Correct</p>
										<p className="text-3xl font-bold text-green-600">{results.correct}</p>
									</div>
									<div className="bg-red-50 p-4 rounded-lg text-center">
										<p className="text-sm text-red-600 mb-1">Incorrect</p>
										<p className="text-3xl font-bold text-red-600">{results.incorrect}</p>
									</div>
								</div>
								<div className="mb-6 p-4 bg-blue-50 rounded-lg text-center">
									<p className="text-sm text-blue-600 mb-1">Average Attempts</p>
									<p className="text-3xl font-bold text-blue-600">{results.totalAttempts > 0 ? (results.totalAttempts / (results.correct + results.incorrect)).toFixed(1) : '0'}</p>
								</div>
								<div className="flex justify-center gap-4">
									<Button onClick={handleRestart} className="flex items-center">
										<RefreshCw className="mr-2 h-4 w-4" /> Practice Again
									</Button>
									<Button variant="outline" onClick={() => (window.location.href = '/dashboard')} className="flex items-center">
										<Home className="mr-2 h-4 w-4" /> Back to Dashboard
									</Button>
								</div>
							</CardContent>
						</Card>
					) : (
						<>
							<div className="mb-6">
								<Progress value={progress} className="h-2" />
								<div className="flex justify-between text-sm text-muted-foreground mt-2">
									<p>
										Card {currentCardIndex + 1} of {cards.length}
									</p>
									<p>Attempts: {attempts}</p>
								</div>
							</div>

							<Card className="mb-6 bg-white/80 backdrop-blur-sm">
								<CardContent className="p-6">
									<div className="min-h-[250px] flex flex-col items-center justify-center">
										<div className="text-center w-full">
											<div className="mb-2 flex items-center justify-center">
												<span className="text-sm text-muted-foreground px-2 py-1 rounded-full bg-muted inline-flex items-center">🇬🇧 English</span>
											</div>
											<h2 className="text-3xl font-bold mb-8">{currentCard?.front}</h2>

											<div className="mb-2 flex items-center justify-center">
												<span className="text-sm text-muted-foreground px-2 py-1 rounded-full bg-muted inline-flex items-center">🇩🇪 German</span>
											</div>

											<div className="max-w-sm mx-auto mb-4">
												<Input ref={inputRef} value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type the German translation..." className="text-center" disabled={!!feedback && (feedback.correct || attempts >= 2)} />
											</div>

											{feedback && (
												<div className={`mb-4 p-3 rounded-md ${feedback.correct ? 'bg-green-50' : 'bg-amber-50'}`}>
													<p className={`flex items-center justify-center ${feedback.correct ? 'text-green-600' : 'text-amber-600'}`}>
														{feedback.correct ? <CheckCircle2 className="mr-2 h-5 w-5" /> : <AlertCircle className="mr-2 h-5 w-5" />}
														{feedback.message}
													</p>
												</div>
											)}

											<div className="flex justify-center gap-4">
												{!feedback ? (
													<Button onClick={checkAnswer} className="flex items-center">
														<CheckCircle2 className="mr-2 h-4 w-4" /> Check Answer
													</Button>
												) : attempts < 2 && !feedback.correct ? (
													<Button onClick={checkAnswer} className="flex items-center">
														<RefreshCw className="mr-2 h-4 w-4" /> Try Again
													</Button>
												) : (
													<Button onClick={moveToNextCard} className="flex items-center">
														<ChevronRight className="mr-2 h-4 w-4" /> Next Card
													</Button>
												)}

												{!feedback?.correct && attempts < 2 && (
													<Button
														variant="outline"
														onClick={() => {
															setAttempts(3)
															setFeedback({
																correct: false,
																message: `The correct answer is: ${currentCard.back}`
															})
														}}
														className="flex items-center"
													>
														<Lightbulb className="mr-2 h-4 w-4" /> Show Answer
													</Button>
												)}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</>
					)}
				</div>
			</div>
		</AuthenticatedLayout>
	)
}
