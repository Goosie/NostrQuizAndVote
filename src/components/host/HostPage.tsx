const HostPage = () => {
  return (
    <div className="container">
      <div className="text-center">
        <h1>NostrQuizAndVote - Host</h1>
        <p className="text-secondary">Kahoot-style live quizzes & votes on Nostr</p>
        
        <div className="card">
          <h2>Welcome, Host!</h2>
          <p>Connect with Nostr to get started</p>
          <button className="btn">Connect with Nostr (NIP-07)</button>
        </div>
      </div>
    </div>
  )
}

export default HostPage