import { useNostr } from '../../services/nostr'

const HostPage = () => {
  const { isConnected, pubkey, loginWithNIP07, error } = useNostr()

  const handleLogin = async () => {
    await loginWithNIP07()
  }

  const formatPubkey = (pk: string) => {
    return `${pk.slice(0, 8)}...${pk.slice(-8)}`
  }

  return (
    <div className="container">
      <div className="text-center">
        <h1>NostrQuizAndVote - Host</h1>
        <p className="text-secondary">Kahoot-style live quizzes & votes on Nostr</p>
        
        <div className="card">
          {!isConnected ? (
            <>
              <h2>Welcome, Host!</h2>
              <p>Connect with Nostr to get started</p>
              {error && (
                <div style={{ 
                  color: 'var(--color-wrong)', 
                  margin: '10px 0',
                  padding: '10px',
                  background: 'var(--color-surface-light)',
                  borderRadius: 'var(--rounded)'
                }}>
                  {error}
                </div>
              )}
              <button className="btn" onClick={handleLogin}>
                Connect with Nostr (NIP-07)
              </button>
            </>
          ) : (
            <>
              <h2>Connected!</h2>
              <p className="text-secondary">
                Pubkey: {formatPubkey(pubkey!)}
              </p>
              <div style={{ marginTop: '20px' }}>
                <h3>Next Steps:</h3>
                <p>Create a quiz or start a game session</p>
                <button className="btn" style={{ marginRight: '10px' }}>
                  Create Quiz
                </button>
                <button className="btn-secondary">
                  Start Game Session
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default HostPage