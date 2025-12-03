import { Quiz, Question, Player, PlayerAnswer } from '../../types'

export interface GameEngineConfig {
  basePoints: number
  timeBonus: boolean
  maxTimeBonus: number
}

export interface QuestionResult {
  questionIndex: number
  question: Question
  playerResults: PlayerQuestionResult[]
  correctAnswer: number
  totalAnswers: number
}

export interface PlayerQuestionResult {
  playerId: string
  answerIndex: number
  timeMs: number
  isCorrect: boolean
  points: number
  totalScore: number
}

export interface GameResults {
  finalScores: PlayerScore[]
  questionResults: QuestionResult[]
  totalQuestions: number
  totalPlayers: number
}

export interface PlayerScore {
  playerId: string
  nickname: string
  totalScore: number
  correctAnswers: number
  averageTime: number
  rank: number
}

export class GameEngine {
  private config: GameEngineConfig
  private quiz: Quiz
  private players: Map<string, Player>
  private answers: Map<string, PlayerAnswer[]> // playerId -> answers
  private questionResults: QuestionResult[]

  constructor(quiz: Quiz, config?: Partial<GameEngineConfig>) {
    this.quiz = quiz
    this.players = new Map()
    this.answers = new Map()
    this.questionResults = []
    
    this.config = {
      basePoints: 100,
      timeBonus: true,
      maxTimeBonus: 50,
      ...config
    }
  }

  // Add player to the game
  addPlayer(player: Player): void {
    console.log('GameEngine: Adding player:', player.id, player.nickname)
    this.players.set(player.id, player)
    this.answers.set(player.id, [])
  }

  // Remove player from the game
  removePlayer(playerId: string): void {
    this.players.delete(playerId)
    this.answers.delete(playerId)
  }

  // Get all players
  getPlayers(): Player[] {
    return Array.from(this.players.values())
  }

  // Submit an answer for a player
  submitAnswer(
    playerId: string, 
    questionIndex: number, 
    answerIndex: number, 
    timeMs: number
  ): PlayerQuestionResult | null {
    console.log('GameEngine: Submitting answer for player:', playerId, 'Available players:', Array.from(this.players.keys()))
    const player = this.players.get(playerId)
    if (!player) {
      console.error('Player not found:', playerId, 'Available players:', Array.from(this.players.keys()))
      return null
    }

    const question = this.quiz.questions[questionIndex]
    if (!question) {
      console.error('Question not found:', questionIndex)
      return null
    }

    // Check if player already answered this question
    const playerAnswers = this.answers.get(playerId) || []
    const existingAnswer = playerAnswers.find(a => a.questionIndex === questionIndex)
    if (existingAnswer) {
      console.warn('Player already answered this question:', playerId, questionIndex)
      return null
    }

    // Calculate if answer is correct
    const isCorrect = answerIndex === question.correctAnswer

    // Calculate points
    const points = this.calculatePoints(question, timeMs, isCorrect)

    // Create player answer
    const playerAnswer: PlayerAnswer = {
      questionIndex,
      answerIndex,
      timeMs,
      isCorrect,
      points
    }

    // Add to player's answers
    playerAnswers.push(playerAnswer)
    this.answers.set(playerId, playerAnswers)

    // Update player's total score
    const totalScore = playerAnswers.reduce((sum, answer) => sum + answer.points, 0)
    player.score = totalScore
    player.answers = playerAnswers
    
    console.log('GameEngine: Updated score for player:', player.nickname, 'Points earned:', points, 'Total score:', totalScore)

    // Create result
    const result: PlayerQuestionResult = {
      playerId,
      answerIndex,
      timeMs,
      isCorrect,
      points,
      totalScore
    }

    console.log('Answer submitted:', {
      player: player.nickname,
      question: questionIndex + 1,
      answer: question.options[answerIndex] || 'No answer',
      correct: isCorrect,
      points,
      totalScore
    })

    return result
  }

  // Calculate points for an answer
  private calculatePoints(question: Question, timeMs: number, isCorrect: boolean): number {
    if (!isCorrect) return 0

    let points = question.points || this.config.basePoints

    // Add time bonus if enabled
    if (this.config.timeBonus && question.timeLimit) {
      const timeLimit = question.timeLimit * 1000 // Convert to ms
      const timeUsed = Math.min(timeMs, timeLimit)
      const timeRatio = 1 - (timeUsed / timeLimit) // 1 = instant, 0 = full time used
      const timeBonus = Math.floor(timeRatio * this.config.maxTimeBonus)
      points += timeBonus
    }

    return points
  }

  // Process results for a question (called when all players have answered or time is up)
  processQuestionResults(questionIndex: number): QuestionResult {
    const question = this.quiz.questions[questionIndex]
    if (!question) {
      throw new Error(`Question not found: ${questionIndex}`)
    }

    const playerResults: PlayerQuestionResult[] = []
    let totalAnswers = 0

    // Collect all player results for this question
    for (const [playerId, playerAnswers] of this.answers.entries()) {
      const player = this.players.get(playerId)
      if (!player) continue

      const answer = playerAnswers.find(a => a.questionIndex === questionIndex)
      if (answer) {
        playerResults.push({
          playerId,
          answerIndex: answer.answerIndex,
          timeMs: answer.timeMs,
          isCorrect: answer.isCorrect,
          points: answer.points,
          totalScore: player.score
        })
        totalAnswers++
      } else {
        // Player didn't answer - add a no-answer result
        playerResults.push({
          playerId,
          answerIndex: -1,
          timeMs: question.timeLimit * 1000,
          isCorrect: false,
          points: 0,
          totalScore: player.score
        })
      }
    }

    const result: QuestionResult = {
      questionIndex,
      question,
      playerResults,
      correctAnswer: question.correctAnswer,
      totalAnswers
    }

    this.questionResults.push(result)
    return result
  }

  // Get current leaderboard
  getLeaderboard(): PlayerScore[] {
    const scores: PlayerScore[] = []

    for (const player of this.players.values()) {
      const playerAnswers = this.answers.get(player.id) || []
      const correctAnswers = playerAnswers.filter(a => a.isCorrect).length
      const totalTime = playerAnswers.reduce((sum, a) => sum + a.timeMs, 0)
      const averageTime = playerAnswers.length > 0 ? totalTime / playerAnswers.length : 0

      scores.push({
        playerId: player.id,
        nickname: player.nickname,
        totalScore: player.score,
        correctAnswers,
        averageTime,
        rank: 0 // Will be set after sorting
      })
    }

    // Sort by score (descending), then by average time (ascending)
    scores.sort((a, b) => {
      if (a.totalScore !== b.totalScore) {
        return b.totalScore - a.totalScore
      }
      return a.averageTime - b.averageTime
    })

    // Assign ranks
    scores.forEach((score, index) => {
      score.rank = index + 1
    })

    return scores
  }

  // Get final game results
  getFinalResults(): GameResults {
    return {
      finalScores: this.getLeaderboard(),
      questionResults: this.questionResults,
      totalQuestions: this.quiz.questions.length,
      totalPlayers: this.players.size
    }
  }

  // Get player's current score
  getPlayerScore(playerId: string): number {
    const player = this.players.get(playerId)
    return player?.score || 0
  }

  // Get question statistics
  getQuestionStats(questionIndex: number): {
    totalAnswers: number
    correctAnswers: number
    averageTime: number
    answerDistribution: number[]
  } | null {
    const result = this.questionResults.find(r => r.questionIndex === questionIndex)
    if (!result) return null

    const correctAnswers = result.playerResults.filter(r => r.isCorrect).length
    const totalTime = result.playerResults.reduce((sum, r) => sum + r.timeMs, 0)
    const averageTime = result.playerResults.length > 0 ? totalTime / result.playerResults.length : 0

    // Count answers for each option
    const answerDistribution = new Array(result.question.options.length).fill(0)
    result.playerResults.forEach(r => {
      if (r.answerIndex >= 0 && r.answerIndex < answerDistribution.length) {
        answerDistribution[r.answerIndex]++
      }
    })

    return {
      totalAnswers: result.totalAnswers,
      correctAnswers,
      averageTime,
      answerDistribution
    }
  }

  // Reset game state
  reset(): void {
    this.players.clear()
    this.answers.clear()
    this.questionResults = []
  }
}