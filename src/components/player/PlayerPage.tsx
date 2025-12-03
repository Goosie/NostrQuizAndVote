import { useState } from 'react'
import { useNostr } from '../../services/nostr'

const PlayerPage = () => {
  const [pin, setPin] = useState('')
  const [nickname, setNickname] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const { generateEphemeralIdentity, isConnected, pubkey } = useNostr()

  const handleJoin = async () => {
    if (pin && nickname) {
      setIsJoining(true)
      try {
        // Generate ephemeral identity for player
        if (!isConnected) {
          generateEphemeralIdentity()
        }
        
        console.log('Joining game with PIN:', pin, 'as', nickname)
        console.log('Player pubkey:', pubkey)
        
        // TODO: Implement actual join logic with Nostr
        // This would involve:
        // 1. Finding the game session by PIN
        // 2. Publishing a Player Join event
        // 3. Subscribing to game events
        
        alert(`Joining game ${pin} as ${nickname}!\nPlayer ID: ${pubkey?.slice(0, 8)}...`)
      } catch (error) {
        console.error('Failed to join game:', error)
        alert('Failed to join game. Please try again.')
      } finally {
        setIsJoining(false)
      }
    }
  }

  return (
    <div className="container-mobile">
      <div className="text-center">
        <h1>Join Quiz</h1>
        <p className="text-secondary">Enter the game PIN to join</p>
        
        <div className="card">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Game PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full"
              style={{
                padding: '12px',
                borderRadius: 'var(--rounded)',
                border: '2px solid var(--color-surface-light)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '1.2rem',
                textAlign: 'center'
              }}
            />
          </div>
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full"
              style={{
                padding: '12px',
                borderRadius: 'var(--rounded)',
                border: '2px solid var(--color-surface-light)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <button 
            className="btn w-full"
            onClick={handleJoin}
            disabled={!pin || !nickname || isJoining}
          >
            {isJoining ? 'Joining...' : 'Join Game'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlayerPage