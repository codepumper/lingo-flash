'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { saveFlashcardResult, getRandomFlashcards } from '@/lib/flashcards'
import { AlertCircle, CheckCircle2, ChevronRight, Lightbulb, RefreshCw } from 'lucide-react'
import { Flashcard } from '@/lib/flashcards'
import confetti from 'canvas-confetti'

type Feedback = {
	correct: boolean
	message: string
} | null

export function FlashcardDeck({ cards = [] }) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [answer, setAnswer] = useState('')
	const [feedback, setFeedback] = useState<Feedback>(null)
	const [attempts, setAttempts] = useState(0)
	const [isComplete, setIsComplete] = useState(cards.length === 0)
	const [results, setResults] = useState({ correct: 0, incorrect: 0, totalAttempts: 0 })
	const [practiceCards, setPracticeCards] = useState<Flashcard[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const inputRef = useRef<HTMLInputElement | null>(null)
	

	useEffect(() => {
		// If no cards are provided, get random cards
		const loadRandomCards = async () => {
			if (cards.length === 0) {
				setIsLoading(true)
				try {
					const randomCards = await getRandomFlashcards(10)
					setPracticeCards(randomCards)
					setIsComplete(randomCards.length === 0)
				} catch (error) {
					console.error('Failed to load random flashcards:', error)
				} finally {
					setIsLoading(false)
				}
			} else {
				setPracticeCards(cards)
			}
		}

		loadRandomCards()
	}, [cards])

	useEffect(() => {
		// Focus the input when the card changes
		if (inputRef.current && !feedback) {
			inputRef.current.focus()
		}
	}, [currentIndex, feedback])

	const checkAnswer = () => {
		if (!answer.trim()) return

		const currentCard = practiceCards[currentIndex]

		if (!currentCard || !currentCard.back) {
			console.error("Current card or its 'back' property is undefined.")
			return
		}

		const correctAnswer = currentCard?.back.toLowerCase().trim()
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
		if (e.key === "Enter") {
		  	if (feedback && (feedback.correct || attempts >= 2)) {
				handleNextCard()
		  	}
		}
	}

	const handleNextCard = async () => {
		if (currentIndex < practiceCards.length) {
			const card = practiceCards[currentIndex]
			const isCorrect = feedback?.correct || false

			try {
				await saveFlashcardResult(card.id, isCorrect)

				setResults({
					correct: isCorrect ? results.correct + 1 : results.correct,
					incorrect: !isCorrect ? results.incorrect + 1 : results.incorrect,
					totalAttempts: results.totalAttempts + attempts
				})

				if (currentIndex === practiceCards.length - 1) {
					setIsComplete(true)
				} else {
					setCurrentIndex(currentIndex + 1)
					setAnswer('')
					setFeedback(null)
					setAttempts(0)
				}
			} catch (error) {
				console.error('Failed to save result:', error)
			}
		}
	}

	const handleRestart = async () => {
		setIsLoading(true)
		try {
			const randomCards = await getRandomFlashcards(10)
			setPracticeCards(randomCards)
			setCurrentIndex(0)
			setAnswer('')
			setFeedback(null)
			setAttempts(0)
			setIsComplete(false)
			setResults({ correct: 0, incorrect: 0, totalAttempts: 0 })
		} catch (error) {
			console.error('Failed to load random flashcards:', error)
		} finally {
			setIsLoading(false)
		}
	}

	if (isLoading) {
		return (
			<div className="text-center py-8">
				<p>Loading flashcards... ⏳</p>
			</div>
		)
	}

	if (practiceCards.length === 0) {
		return (
			<div className="text-center py-8">
				<div className="text-6xl mb-4">🎉</div>
				<p className="text-muted-foreground">No flashcards available. Add some to start practicing.</p>
			</div>
		)
	}

	const currentCard = practiceCards[currentIndex]

	if (isComplete) {
		return (
			<div className="text-center py-8">
				<h3 className="text-xl font-bold mb-4 flex items-center justify-center">
					<CheckCircle2 className="mr-2 h-6 w-6 text-green-500" /> Practice Complete!
				</h3>
				<div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
					<div className="bg-green-50 p-4 rounded-lg">
						<p className="text-sm text-green-600 mb-1">Correct</p>
						<p className="text-2xl font-bold text-green-600">{results.correct}</p>
					</div>
					<div className="bg-red-50 p-4 rounded-lg">
						<p className="text-sm text-red-600 mb-1">Incorrect</p>
						<p className="text-2xl font-bold text-red-600">{results.incorrect}</p>
					</div>
				</div>
				<div className="mb-6 p-4 bg-blue-50 rounded-lg max-w-xs mx-auto">
					<p className="text-sm text-blue-600 mb-1">Average Attempts</p>
					<p className="text-2xl font-bold text-blue-600">{results.totalAttempts > 0 ? (results.totalAttempts / (results.correct + results.incorrect)).toFixed(1) : '0'}</p>
				</div>
				<Button onClick={handleRestart} className="flex items-center">
					<RefreshCw className="mr-2 h-4 w-4" /> Practice Again
				</Button>
			</div>
		)
	}

	return (
		<div>
			<div className="flex justify-between text-sm text-muted-foreground mb-4">
				<span>
					Card {currentIndex + 1} of {practiceCards.length}
				</span>
				<span>Attempts: {attempts}</span>
			</div>

			<Card className="mb-6">
				<CardContent className="p-6">
					<div className="min-h-[200px] flex items-center justify-center">
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
									<Button onClick={handleNextCard} className="flex items-center">
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
		</div>
	)
}
