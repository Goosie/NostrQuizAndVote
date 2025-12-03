import { useState } from 'react'

const PlayerPage = () => {
  const [pin, setPin] = useState('')
  const [nickname, setNickname] = useState('')

  const handleJoin = () => {
    if (pin && nickname) {
      console.log('Joining game with PIN:', pin, 'as', nickname)
      // TODO: Implement join logic
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
            disabled={!pin || !nickname}
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlayerPage