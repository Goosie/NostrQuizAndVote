import React, { useState, useEffect } from 'react'
import { useNostr } from '../../services/nostr'
import { GameSession, Player, Question } from '../../types'

interface PlayerGameProps {
  session: GameSession
  player: Player
  onLeaveGame: () => void
}

type GameState = 'waiting' | 'question' | 'answer-submitted' | 'results' | 'finished'

export const PlayerGame: React.FC<PlayerGameProps> = ({ session, player, onLeaveGame }) => {
  const { nostr } = useNostr()
  const [gameState, setGameState] = useState<GameState>('waiting')
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [playerScore, setPlayerScore] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState<number>(0)

  useEffect(() => {
    if (!nostr) return

    // Subscribe to game events
    const subscriptions: string[] = []

    // Subscribe to score updates
    const scoreSubId = nostr.subscribeToScoreUpdates(session.id, (event) => {
      try {
        const scoreData = JSON.parse(event.content)
        if (scoreData.player_id === player.id) {
          setPlayerScore(scoreData.total_score)
        }
      } catch (err) {
        console.error('Failed to parse score update:', err)
      }
    })
    subscriptions.push(scoreSubId)

    // TODO: Subscribe to question events and game state changes

    return () => {
      subscriptions.forEach(subId => nostr.unsubscribe(subId))
    }
  }, [nostr, session.id, player.id])

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && gameState === 'question') {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameState === 'question' && selectedAnswer === null) {
      // Auto-submit when time runs out
      handleSubmitAnswer()
    }
  }, [timeLeft, gameState, selectedAnswer])

  const handleAnswerSelect = (answerIndex: number) => {
    if (gameState !== 'question' || selectedAnswer !== null) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = async () => {
    if (!nostr || !currentQuestion || gameState !== 'question') return

    setIsSubmitting(true)
    
    try {
      const timeMs = Date.now() - questionStartTime
      const answerData = {
        session_id: session.id,
        session_event_id: session.id, // This should be the actual event ID
        question_index: session.currentQuestionIndex,
        answer_index: selectedAnswer ?? -1, // -1 for no answer
        time_ms: timeMs
      }

      await nostr.publishAnswer(answerData)
      setGameState('answer-submitted')
      
    } catch (err) {
      console.error('Failed to submit answer:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mock function to simulate receiving a question
  const startQuestion = (question: Question, timeLimit: number) => {
    setCurrentQuestion(question)
    setSelectedAnswer(null)
    setTimeLeft(timeLimit)
    setQuestionStartTime(Date.now())
    setGameState('question')
  }

  // Mock function for testing
  useEffect(() => {
    // Simulate receiving a question after 3 seconds
    const timer = setTimeout(() => {
      if (gameState === 'waiting') {
        const mockQuestion: Question = {
          id: 'q1',
          text: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correctAnswer: 2,
          points: 100,
          timeLimit: 30
        }
        startQuestion(mockQuestion, 30)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [gameState])

  if (gameState === 'waiting') {
    return (
      <div className="player-game">
        <div className="game-header">
          <h2>Waiting for Game to Start</h2>
          <button className="btn btn-secondary" onClick={onLeaveGame}>
            Leave Game
          </button>
        </div>

        <div className="waiting-screen">
          <div className="player-info card">
            <h3>Welcome, {player.nickname}!</h3>
            <p>Game PIN: <strong>{session.pin}</strong></p>
            <p>Current Score: <strong>{playerScore}</strong></p>
          </div>

          <div className="waiting-message">
            <div className="spinner"></div>
            <p>Waiting for the host to start the game...</p>
            <p>Get ready to answer some questions!</p>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'question' && currentQuestion) {
    return (
      <div className="player-game">
        <div className="game-header">
          <div className="question-info">
            <span className="question-number">Question {session.currentQuestionIndex + 1}</span>
            <span className="timer">{timeLeft}s</span>
          </div>
          <div className="score">Score: {playerScore}</div>
        </div>

        <div className="question-screen">
          <div className="question-card">
            <h2 className="question-text">{currentQuestion.text}</h2>
            
            <div className="answers-grid">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`answer-option ${selectedAnswer === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>

            {selectedAnswer !== null && (
              <button
                className="btn btn-primary btn-large"
                onClick={handleSubmitAnswer}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'answer-submitted') {
    return (
      <div className="player-game">
        <div className="game-header">
          <h2>Answer Submitted</h2>
          <div className="score">Score: {playerScore}</div>
        </div>

        <div className="submitted-screen">
          <div className="card">
            <h3>✅ Answer Submitted!</h3>
            <p>Waiting for other players to finish...</p>
            {selectedAnswer !== null && currentQuestion && (
              <p>Your answer: <strong>{currentQuestion.options[selectedAnswer]}</strong></p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="player-game">
      <div className="game-header">
        <h2>Game State: {gameState}</h2>
        <button className="btn btn-secondary" onClick={onLeaveGame}>
          Leave Game
        </button>
      </div>
      <div className="card">
        <p>Game state not implemented: {gameState}</p>
      </div>
    </div>
  )
}