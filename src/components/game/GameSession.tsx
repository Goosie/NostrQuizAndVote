import React, { useState } from 'react'
import { useNostr } from '../../services/nostr'
import { GameController } from './GameController'
import { Quiz, GameSession as GameSessionType, Player } from '../../types'

interface GameSessionProps {
  quiz: Quiz
  onBack: () => void
}

type SessionState = 'setup' | 'lobby' | 'playing' | 'finished'

export const GameSession: React.FC<GameSessionProps> = ({ quiz, onBack }) => {
  const { nostr, pubkey } = useNostr()
  const [sessionState, setSessionState] = useState<SessionState>('setup')
  const [session, setSession] = useState<GameSessionType | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [pin, setPin] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)

  // Generate a random 6-digit PIN
  const generatePin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Create game session
  const createSession = async () => {
    if (!nostr || !pubkey) return

    setIsCreating(true)
    try {
      const newPin = generatePin()
      const sessionId = `session_${Date.now()}`
      
      const sessionData = {
        quiz_id: quiz.id,
        pin: newPin,
        session_id: sessionId,
        settings: {
          time_per_question: quiz.settings?.timePerQuestion || 30,
          quiz_type: quiz.settings?.requireDeposit ? 'deposit' as const : 'free' as const,
          deposit_sats: quiz.settings?.requireDeposit ? quiz.settings.depositAmount : undefined,
          payout_per_correct: quiz.settings?.requireDeposit ? Math.floor((quiz.settings.depositAmount || 0) * 0.8 / quiz.questions.length) : undefined
        }
      }

      // Publish game session to Nostr
      await nostr.publishGameSession(sessionData)

      const newSession: GameSessionType = {
        id: sessionId,
        quizId: quiz.id,
        hostPubkey: pubkey,
        pin: newPin,
        status: 'waiting',
        players: [],
        currentQuestionIndex: 0,
        createdAt: new Date()
      }

      setSession(newSession)
      setPin(newPin)
      setSessionState('lobby')

      // Subscribe to player joins
      subscribeToPlayerJoins(sessionId)

    } catch (err) {
      console.error('Failed to create session:', err)
      alert('Failed to create game session. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  // Subscribe to player join events
  const subscribeToPlayerJoins = (sessionId: string) => {
    if (!nostr) return

    nostr.subscribeToPlayerJoins(sessionId, (event) => {
      try {
        const playerData = JSON.parse(event.content)
        const newPlayer: Player = {
          id: event.pubkey, // Use the event pubkey as player ID
          pubkey: event.pubkey,
          nickname: playerData.nickname,
          score: 0,
          answers: [],
          joinedAt: new Date(event.created_at * 1000)
        }

        setPlayers(prev => {
          // Check if player already exists
          const exists = prev.find(p => p.id === newPlayer.id)
          if (exists) return prev
          
          console.log('New player joined:', newPlayer.nickname)
          return [...prev, newPlayer]
        })
      } catch (err) {
        console.error('Failed to parse player join event:', err)
      }
    })
  }

  // Start the game
  const startGame = async () => {
    if (!session || !nostr) return

    try {
      // Update session status
      const updatedSession = { ...session, status: 'active' as const }
      setSession(updatedSession)
      setSessionState('playing')

      // TODO: Implement game flow
      console.log('Game started with', players.length, 'players')
      
    } catch (err) {
      console.error('Failed to start game:', err)
      alert('Failed to start game. Please try again.')
    }
  }

  // Generate QR code URL (for now just the join URL)
  const getJoinUrl = () => {
    return `${window.location.origin}/NostrQuizAndVote/join?pin=${pin}`
  }

  if (sessionState === 'setup') {
    return (
      <div className="game-session">
        <div className="session-header">
          <h2>Create Game Session</h2>
          <button className="btn btn-secondary" onClick={onBack}>
            Back to Quizzes
          </button>
        </div>

        <div className="session-setup">
          <div className="quiz-info card">
            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>
            <div className="quiz-stats">
              <div className="stat">
                <span className="stat-value">{quiz.questions.length}</span>
                <span className="stat-label">Questions</span>
              </div>
              <div className="stat">
                <span className="stat-value">{quiz.settings?.timePerQuestion || 30}s</span>
                <span className="stat-label">Per Question</span>
              </div>
              {quiz.settings?.requireDeposit && (
                <div className="stat">
                  <span className="stat-value">{quiz.settings.depositAmount}</span>
                  <span className="stat-label">Sats Deposit</span>
                </div>
              )}
            </div>
          </div>

          <div className="session-actions">
            <button 
              className="btn btn-primary btn-large"
              onClick={createSession}
              disabled={isCreating}
            >
              {isCreating ? 'Creating Session...' : 'Create Game Session'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (sessionState === 'lobby') {
    return (
      <div className="game-session">
        <div className="session-header">
          <h2>Game Lobby</h2>
          <button className="btn btn-secondary" onClick={onBack}>
            End Session
          </button>
        </div>

        <div className="lobby">
          <div className="lobby-info">
            <div className="pin-display">
              <h3>Game PIN</h3>
              <div className="pin-code">{pin}</div>
              <p>Players can join at: <strong>{window.location.origin}/NostrQuizAndVote/join</strong></p>
            </div>

            <div className="qr-section">
              <h4>QR Code</h4>
              <div className="qr-placeholder">
                <p>QR Code for: {getJoinUrl()}</p>
                <p>(QR generation coming soon)</p>
              </div>
            </div>
          </div>

          <div className="players-section">
            <div className="players-header">
              <h3>Players ({players.length})</h3>
              {players.length > 0 && (
                <button 
                  className="btn btn-primary"
                  onClick={startGame}
                >
                  Start Game
                </button>
              )}
            </div>

            <div className="players-list">
              {players.length === 0 ? (
                <div className="empty-state">
                  <p>Waiting for players to join...</p>
                  <p>Share the PIN <strong>{pin}</strong> with your players!</p>
                </div>
              ) : (
                <div className="players-grid">
                  {players.map((player) => (
                    <div key={player.id} className="player-card">
                      <div className="player-avatar">
                        {player.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div className="player-info">
                        <div className="player-name">{player.nickname}</div>
                        <div className="player-status">Ready</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (sessionState === 'playing' && session) {
    return (
      <div className="game-session">
        <GameController
          quiz={quiz}
          session={session}
          players={players}
          onGameEnd={onBack}
        />
      </div>
    )
  }

  return null
}