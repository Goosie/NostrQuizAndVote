import { useState } from 'react'
import { PlayerJoin } from './PlayerJoin'
import { PlayerGame } from './PlayerGame'
import { GameSession, Player } from '../../types'

type PlayerState = 'join' | 'game'

const PlayerPage = () => {
  const [playerState, setPlayerState] = useState<PlayerState>('join')
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)

  const handleJoinSuccess = (session: GameSession, player: Player) => {
    setCurrentSession(session)
    setCurrentPlayer(player)
    setPlayerState('game')
  }

  const handleLeaveGame = () => {
    setCurrentSession(null)
    setCurrentPlayer(null)
    setPlayerState('join')
  }

  return (
    <div className="player-page">
      {playerState === 'join' && (
        <PlayerJoin onJoinSuccess={handleJoinSuccess} />
      )}
      
      {playerState === 'game' && currentSession && currentPlayer && (
        <PlayerGame
          session={currentSession}
          player={currentPlayer}
          onLeaveGame={handleLeaveGame}
        />
      )}
    </div>
  )
}

export default PlayerPage