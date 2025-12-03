import React, { useState, useEffect } from 'react'
import { useNostr } from '../../services/nostr'
import { GameEngine, PlayerScore } from '../../services/game'
import { Quiz, GameSession, Player } from '../../types'

interface GameControllerProps {
  quiz: Quiz
  session: GameSession
  players: Player[]
  onGameEnd: () => void
}

type GamePhase = 'starting' | 'question' | 'results' | 'leaderboard' | 'finished'

export const GameController: React.FC<GameControllerProps> = ({ 
  quiz, 
  session, 
  players, 
  onGameEnd 
}) => {
  const { nostr } = useNostr()
  const [gameEngine] = useState(() => new GameEngine(quiz))
  const [gamePhase, setGamePhase] = useState<GamePhase>('starting')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([])
  const [questionStats, setQuestionStats] = useState<any>(null)

  // Initialize game engine with players
  useEffect(() => {
    players.forEach(player => {
      gameEngine.addPlayer(player)
    })
  }, [players, gameEngine])

  // Subscribe to answer events
  useEffect(() => {
    if (!nostr) return

    const subscriptionId = nostr.subscribeToAnswers(session.id, (event) => {
      try {
        const answerData = JSON.parse(event.content)
        const playerId = event.pubkey
        
        // Submit answer to game engine
        const result = gameEngine.submitAnswer(
          playerId,
          answerData.question_index,
          answerData.answer_index,
          answerData.time_ms
        )

        if (result) {
          // Publish score update
          publishScoreUpdate()
        }
      } catch (err) {
        console.error('Failed to process answer:', err)
      }
    })

    return () => {
      nostr.unsubscribe(subscriptionId)
    }
  }, [nostr, session.id, gameEngine])

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && gamePhase === 'question') {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gamePhase === 'question') {
      // Time's up - show results
      showQuestionResults()
    }
  }, [timeLeft, gamePhase])

  // Publish score update to Nostr
  const publishScoreUpdate = async () => {
    if (!nostr) return

    try {
      // Get current leaderboard for score update
      const currentLeaderboard = gameEngine.getLeaderboard()
      
      const scoreData = {
        session_id: session.id,
        session_event_id: session.id, // This should be the actual event ID
        question_index: currentQuestionIndex,
        scores: currentLeaderboard.map(player => ({
          player_id: player.playerId,
          nickname: player.nickname,
          total_score: player.totalScore
        }))
      }

      await nostr.publishScoreUpdate(scoreData)
    } catch (err) {
      console.error('Failed to publish score update:', err)
    }
  }

  // Start the next question
  const startQuestion = () => {
    if (currentQuestionIndex >= quiz.questions.length) {
      endGame()
      return
    }

    const question = quiz.questions[currentQuestionIndex]
    setTimeLeft(question.timeLimit)
    setGamePhase('question')
    setQuestionStats(null)

    console.log(`Starting question ${currentQuestionIndex + 1}:`, question.text)
  }

  // Show results for current question
  const showQuestionResults = () => {
    const results = gameEngine.processQuestionResults(currentQuestionIndex)
    const stats = gameEngine.getQuestionStats(currentQuestionIndex)
    const currentLeaderboard = gameEngine.getLeaderboard()
    
    setQuestionStats(stats)
    setLeaderboard(currentLeaderboard)
    setGamePhase('results')

    console.log('Question results:', results)
    console.log('Current leaderboard:', currentLeaderboard)
  }

  // Move to next question
  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1)
    setGamePhase('leaderboard')
  }

  // End the game
  const endGame = () => {
    const finalResults = gameEngine.getFinalResults()
    setLeaderboard(finalResults.finalScores)
    setGamePhase('finished')
    
    console.log('Game finished:', finalResults)
  }

  // Continue to next question or end game
  const continueGame = () => {
    if (currentQuestionIndex + 1 >= quiz.questions.length) {
      endGame()
    } else {
      nextQuestion()
      setTimeout(() => startQuestion(), 2000) // 2 second delay
    }
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]

  if (gamePhase === 'starting') {
    return (
      <div className="game-controller">
        <div className="game-header">
          <h2>Ready to Start Game</h2>
          <div className="game-info">
            <span>Players: {players.length}</span>
            <span>Questions: {quiz.questions.length}</span>
          </div>
        </div>

        <div className="start-screen">
          <div className="card">
            <h3>Game: {quiz.title}</h3>
            <p>{quiz.description}</p>
            
            <div className="players-ready">
              <h4>Players Ready ({players.length})</h4>
              <div className="players-list">
                {players.map(player => (
                  <div key={player.id} className="player-ready">
                    <span className="player-avatar">
                      {player.nickname.charAt(0).toUpperCase()}
                    </span>
                    <span>{player.nickname}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              className="btn btn-primary btn-large"
              onClick={startQuestion}
            >
              Start First Question
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (gamePhase === 'question' && currentQuestion) {
    return (
      <div className="game-controller">
        <div className="game-header">
          <div className="question-progress">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
          <div className="timer-display">
            {timeLeft}s
          </div>
        </div>

        <div className="question-display">
          <div className="question-card">
            <h2 className="question-text">{currentQuestion.text}</h2>
            
            <div className="answers-display">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="answer-display">
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="option-text">{option}</span>
                </div>
              ))}
            </div>

            <div className="question-info">
              <p>Players are answering...</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${((currentQuestion.timeLimit - timeLeft) / currentQuestion.timeLimit) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (gamePhase === 'results' && currentQuestion && questionStats) {
    return (
      <div className="game-controller">
        <div className="game-header">
          <h2>Question {currentQuestionIndex + 1} Results</h2>
        </div>

        <div className="results-display">
          <div className="question-summary">
            <h3>{currentQuestion.text}</h3>
            
            <div className="correct-answer">
              <h4>Correct Answer:</h4>
              <div className="answer-highlight">
                <span className="option-letter">
                  {String.fromCharCode(65 + currentQuestion.correctAnswer)}
                </span>
                <span className="option-text">
                  {currentQuestion.options[currentQuestion.correctAnswer]}
                </span>
              </div>
            </div>

            <div className="question-stats">
              <div className="stat">
                <span className="stat-value">{questionStats.correctAnswers}</span>
                <span className="stat-label">Correct</span>
              </div>
              <div className="stat">
                <span className="stat-value">{questionStats.totalAnswers}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat">
                <span className="stat-value">{Math.round(questionStats.averageTime / 1000)}s</span>
                <span className="stat-label">Avg Time</span>
              </div>
            </div>
          </div>

          <button 
            className="btn btn-primary btn-large"
            onClick={continueGame}
          >
            {currentQuestionIndex + 1 >= quiz.questions.length ? 'Show Final Results' : 'Next Question'}
          </button>
        </div>
      </div>
    )
  }

  if (gamePhase === 'leaderboard') {
    return (
      <div className="game-controller">
        <div className="game-header">
          <h2>Leaderboard</h2>
          <p>After {currentQuestionIndex + 1} question{currentQuestionIndex !== 0 ? 's' : ''}</p>
        </div>

        <div className="leaderboard-display">
          <div className="leaderboard">
            {leaderboard.slice(0, 10).map((player, index) => (
              <div key={player.playerId} className={`leaderboard-item rank-${index + 1}`}>
                <div className="rank">#{player.rank}</div>
                <div className="player-info">
                  <div className="player-name">{player.nickname}</div>
                  <div className="player-stats">
                    {player.correctAnswers}/{currentQuestionIndex + 1} correct
                  </div>
                </div>
                <div className="score">{player.totalScore}</div>
              </div>
            ))}
          </div>

          <button 
            className="btn btn-primary btn-large"
            onClick={startQuestion}
          >
            Continue Game
          </button>
        </div>
      </div>
    )
  }

  if (gamePhase === 'finished') {
    return (
      <div className="game-controller">
        <div className="game-header">
          <h2>🎉 Game Finished!</h2>
        </div>

        <div className="final-results">
          <div className="winner-section">
            {leaderboard.length > 0 && (
              <div className="winner">
                <h3>🏆 Winner</h3>
                <div className="winner-card">
                  <div className="winner-name">{leaderboard[0].nickname}</div>
                  <div className="winner-score">{leaderboard[0].totalScore} points</div>
                  <div className="winner-stats">
                    {leaderboard[0].correctAnswers}/{quiz.questions.length} correct
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="final-leaderboard">
            <h4>Final Rankings</h4>
            <div className="leaderboard">
              {leaderboard.map((player, index) => (
                <div key={player.playerId} className={`leaderboard-item rank-${index + 1}`}>
                  <div className="rank">#{player.rank}</div>
                  <div className="player-info">
                    <div className="player-name">{player.nickname}</div>
                    <div className="player-stats">
                      {player.correctAnswers}/{quiz.questions.length} correct
                    </div>
                  </div>
                  <div className="score">{player.totalScore}</div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="btn btn-primary btn-large"
            onClick={onGameEnd}
          >
            End Game
          </button>
        </div>
      </div>
    )
  }

  return null
}