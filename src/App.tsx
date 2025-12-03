import { Routes, Route, Navigate } from 'react-router-dom'
import { NostrProvider } from './services/nostr'
import HostPage from './components/host/HostPage'
import PlayerPage from './components/player/PlayerPage'

function App() {
  return (
    <NostrProvider>
      <div className="min-h-screen">
        <Routes>
          <Route path="/host" element={<HostPage />} />
          <Route path="/join" element={<PlayerPage />} />
          <Route path="/" element={<Navigate to="/host" replace />} />
        </Routes>
      </div>
    </NostrProvider>
  )
}

export default App