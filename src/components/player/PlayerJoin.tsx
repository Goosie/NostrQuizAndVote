import React, { useState, useEffect } from 'react'
import { useNostr } from '../../services/nostr'
import { GameSession, Player } from '../../types'

interface PlayerJoinProps {
  onJoinSuccess: (session: GameSession, player: Player) => void
}

export const PlayerJoin: React.FC<PlayerJoinProps> = ({ onJoinSuccess }) => {
  const { nostr, pubkey } = useNostr()
  const [pin, setPin] = useState('')
  const [nickname, setNickname] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')
  const [useNostrLogin, setUseNostrLogin] = useState(false)

  // Get PIN from URL params if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlPin = urlParams.get('pin')
    if (urlPin) {
      setPin(urlPin)
    }
  }, [])

  const handleNostrLogin = async () => {
    if (!nostr) return
    
    try {
      // Try to connect to NIP-07 extension
      if (window.nostr) {
        const pubkey = await window.nostr.getPublicKey()
        console.log('Connected to Nostr:', pubkey)
        setUseNostrLogin(true)
        setError('')
      } else {
        throw new Error('No Nostr extension found')
      }
    } catch (err) {
      console.error('Nostr login failed:', err)
      setError('Failed to connect to Nostr. You can still join without Nostr.')
    }
  }

  const handleJoinGame = async () => {
    if (!pin.trim() || !nickname.trim()) {
      setError('Please enter both PIN and nickname')
      return
    }

    if (!nostr) {
      setError('Nostr service not available')
      return
    }

    setIsJoining(true)
    setError('')

    try {
      // If not using Nostr login, generate ephemeral identity
      if (!useNostrLogin && !pubkey) {
        nostr.generateEphemeralIdentity()
      }

      // Find the game session by PIN
      const session = await findGameSessionByPin(pin.trim())
      if (!session) {
        setError('Game not found. Please check the PIN.')
        return
      }

      // Create player data
      const playerData = {
        session_id: session.id,
        session_event_id: session.id, // This should be the actual event ID
        nickname: nickname.trim()
      }

      // Publish player join event
      await nostr.publishPlayerJoin(playerData)

      // Create player object
      const player: Player = {
        id: nostr.getPubkey() || '',
        pubkey: nostr.getPubkey(),
        nickname: nickname.trim(),
        score: 0,
        answers: [],
        joinedAt: new Date()
      }

      console.log('Successfully joined game:', session.id)
      onJoinSuccess(session, player)

    } catch (err) {
      console.error('Failed to join game:', err)
      setError('Failed to join game. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  // Find game session by PIN (this would normally query Nostr events)
  const findGameSessionByPin = async (gamePin: string): Promise<GameSession | null> => {
    // TODO: Implement actual Nostr query to find session by PIN
    // For now, return a mock session
    return {
      id: `session_${gamePin}`,
      quizId: 'quiz_1',
      pin: gamePin,
      hostPubkey: 'host_pubkey',
      players: [],
      currentQuestionIndex: 0,
      status: 'waiting',
      createdAt: new Date()
    }
  }

  return (
    <div className="player-join">
      <div className="join-header">
        <h1>Join Quiz Game</h1>
        <p>Enter the game PIN and your nickname to join</p>
      </div>

      <div className="join-form">
        <div className="form-group">
          <label htmlFor="pin">Game PIN</label>
          <input
            id="pin"
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit PIN"
            maxLength={6}
            className="pin-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="nickname">Your Nickname</label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 20))}
            placeholder="Enter your nickname"
            maxLength={20}
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="nostr-section">
          <div className="nostr-option">
            <input
              type="checkbox"
              id="useNostr"
              checked={useNostrLogin}
              onChange={(e) => setUseNostrLogin(e.target.checked)}
            />
            <label htmlFor="useNostr">
              Connect with Nostr (optional)
            </label>
          </div>
          
          {useNostrLogin && !pubkey && (
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={handleNostrLogin}
            >
              Connect Nostr Wallet
            </button>
          )}
          
          {useNostrLogin && pubkey && (
            <div className="nostr-connected">
              ✅ Connected to Nostr
            </div>
          )}
        </div>

        <button
          className="btn btn-primary btn-large"
          onClick={handleJoinGame}
          disabled={isJoining || !pin.trim() || !nickname.trim()}
        >
          {isJoining ? 'Joining Game...' : 'Join Game'}
        </button>

        <div className="join-info">
          <p>
            <strong>Don't have a PIN?</strong><br />
            Ask the quiz host to share the game PIN with you.
          </p>
        </div>
      </div>
    </div>
  )
}