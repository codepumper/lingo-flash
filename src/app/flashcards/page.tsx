"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getFlashcards, createFlashcard, deleteFlashcard } from "@/lib/flashcards"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { BookOpen, Plus, Search, Trash2 } from "lucide-react"

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newCard, setNewCard] = useState({
    german: "",
    english: "",
    direction: "de-en",
  })

  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        const cards = await getFlashcards()
        setFlashcards(cards)
      } catch (error) {
        console.error("Failed to load flashcards:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFlashcards()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCard({ ...newCard, [name]: value })
  }

  const handleDirectionChange = (value) => {
    setNewCard({ ...newCard, direction: value })
  }

  const handleAddCard = async (e) => {
    e.preventDefault()

    try {
      const card = await createFlashcard(newCard.german, newCard.english, newCard.direction)
      if (card) {
        setFlashcards([card, ...flashcards])
        setNewCard({ german: "", english: "", direction: "de-en" })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("Failed to add flashcard:", error)
    }
  }

  const handleDeleteCard = async (id) => {
    try {
      const success = await deleteFlashcard(id)
      if (success) {
        setFlashcards(flashcards.filter((card) => card.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete flashcard:", error)
    }
  }

  const filteredFlashcards = flashcards.filter(
    (card) =>
      card.german.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.english.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <AuthenticatedLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <BookOpen className="mr-2 h-8 w-8" /> My Flashcards
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flashcards..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" /> Add New Flashcard
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddCard}>
                <DialogHeader>
                  <DialogTitle>Add New Flashcard</DialogTitle>
                  <DialogDescription>Create a new flashcard to add to your collection.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="german">German Word 🇩🇪</Label>
                    <Input id="german" name="german" value={newCard.german} onChange={handleInputChange} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="english">English Translation 🇬🇧</Label>
                    <Input id="english" name="english" value={newCard.english} onChange={handleInputChange} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="direction">Practice Direction</Label>
                    <Select value={newCard.direction} onValueChange={handleDirectionChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="de-en">German → English</SelectItem>
                        <SelectItem value="en-de">English → German</SelectItem>
                        <SelectItem value="both">Both Directions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" /> Add Flashcard
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Flashcard Collection</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p>Loading flashcards... ⏳</p>
              </div>
            ) : flashcards.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-muted-foreground mb-4">You don&apos;t have any flashcards yet.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Flashcard
                </Button>
              </div>
            ) : filteredFlashcards.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-muted-foreground mb-4">No flashcards match your search.</p>
                <Button variant="outline" onClick={() => setSearchTerm("")} className="flex items-center">
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>German 🇩🇪</TableHead>
                      <TableHead>English 🇬🇧</TableHead>
                      <TableHead className="hidden md:table-cell">Direction</TableHead>
                      <TableHead className="hidden md:table-cell">Last Practiced</TableHead>
                      <TableHead>Mastery</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlashcards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-medium">{card.german}</TableCell>
                        <TableCell>{card.english}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {card.direction === "de-en"
                            ? "German → English"
                            : card.direction === "en-de"
                              ? "English → German"
                              : "Both Directions"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{card.lastPracticed || "Never"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  card.masteryLevel >= 80
                                    ? "bg-green-500"
                                    : card.masteryLevel >= 40
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${card.masteryLevel || 0}%` }}
                              />
                            </div>
                            <span className="text-xs">{card.masteryLevel || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(card.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
