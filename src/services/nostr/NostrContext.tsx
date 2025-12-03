import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { NostrService } from './NostrService'

interface NostrContextType {
  nostr: NostrService
  isConnected: boolean
  pubkey: string | null
  loginWithNIP07: () => Promise<void>
  generateEphemeralIdentity: () => void
  error: string | null
}

const NostrContext = createContext<NostrContextType | null>(null)

interface NostrProviderProps {
  children: ReactNode
}

export const NostrProvider = ({ children }: NostrProviderProps) => {
  const [nostr] = useState(() => new NostrService())
  const [isConnected, setIsConnected] = useState(false)
  const [pubkey, setPubkey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loginWithNIP07 = async () => {
    try {
      setError(null)
      const pk = await nostr.loginWithNIP07()
      setPubkey(pk)
      setIsConnected(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('NIP-07 login error:', err)
    }
  }

  const generateEphemeralIdentity = () => {
    try {
      setError(null)
      const pk = nostr.generateEphemeralIdentity()
      setPubkey(pk)
      setIsConnected(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Ephemeral identity error:', err)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      nostr.destroy()
    }
  }, [nostr])

  const value: NostrContextType = {
    nostr,
    isConnected,
    pubkey,
    loginWithNIP07,
    generateEphemeralIdentity,
    error
  }

  return (
    <NostrContext.Provider value={value}>
      {children}
    </NostrContext.Provider>
  )
}

export const useNostr = (): NostrContextType => {
  const context = useContext(NostrContext)
  if (!context) {
    throw new Error('useNostr must be used within a NostrProvider')
  }
  return context
}