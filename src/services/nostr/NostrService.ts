import { 
  SimplePool, 
  Event, 
  finalizeEvent,
  generateSecretKey, 
  getPublicKey
} from 'nostr-tools'

interface Filter {
  ids?: string[]
  authors?: string[]
  kinds?: number[]
  since?: number
  until?: number
  limit?: number
  [key: `#${string}`]: string[] | undefined
}
import { EVENT_KINDS } from '../../types/nostr'

// NIP-07 interface - extending the one from @formstr/sdk
declare global {
  interface Window {
    nostr: {
      getPublicKey(): Promise<string>
      signEvent(event: any): Promise<Event>
      getRelays?(): Promise<Record<string, { read: boolean; write: boolean }>>
      nip04: {
        encrypt(pubkey: string, plaintext: string): Promise<string>
        decrypt(pubkey: string, ciphertext: string): Promise<string>
      }
    }
  }
}

export interface NostrConfig {
  relays: string[]
  defaultRelays: string[]
}

export class NostrService {
  private pool: SimplePool
  private config: NostrConfig
  private pubkey: string | null = null
  private privateKey: Uint8Array | null = null
  private subscriptions: Map<string, any> = new Map()

  constructor(config?: Partial<NostrConfig>) {
    this.config = {
      relays: config?.relays || [],
      defaultRelays: [
        'wss://relay.damus.io',
        'wss://nos.lol',
        'wss://relay.nostr.band',
        'wss://nostr-pub.wellorder.net'
      ]
    }
    
    this.pool = new SimplePool()
  }

  // Get active relays
  getRelays(): string[] {
    return this.config.relays.length > 0 ? this.config.relays : this.config.defaultRelays
  }

  // NIP-07 Login
  async loginWithNIP07(): Promise<string> {
    if (!window.nostr) {
      throw new Error('NIP-07 extension not found. Please install a Nostr browser extension like Alby or nos2x.')
    }

    try {
      this.pubkey = await window.nostr.getPublicKey()
      console.log('Logged in with pubkey:', this.pubkey)
      return this.pubkey
    } catch (error) {
      console.error('NIP-07 login failed:', error)
      throw new Error('Failed to connect with Nostr extension')
    }
  }

  // Generate ephemeral identity for players without Nostr
  generateEphemeralIdentity(): string {
    this.privateKey = generateSecretKey()
    this.pubkey = getPublicKey(this.privateKey)
    console.log('Generated ephemeral identity:', this.pubkey)
    return this.pubkey
  }

  // Get current pubkey
  getPubkey(): string | null {
    return this.pubkey
  }

  // Sign event (NIP-07 or private key)
  private async signEvent(event: any): Promise<Event> {
    if (window.nostr && !this.privateKey) {
      // Use NIP-07
      return await window.nostr.signEvent(event)
    } else if (this.privateKey) {
      // Use private key for ephemeral identity
      return finalizeEvent(event, this.privateKey)
    } else {
      throw new Error('No signing method available')
    }
  }

  // Publish event
  async publishEvent(kind: number, content: string, tags: string[][] = []): Promise<Event> {
    if (!this.pubkey) {
      throw new Error('Not logged in')
    }

    const event = {
      kind,
      pubkey: this.pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content,
    }

    const signedEvent = await this.signEvent(event)
    const relays = this.getRelays()
    
    console.log('Publishing event:', signedEvent)
    
    const pubs = this.pool.publish(relays, signedEvent)
    
    // Wait for at least one relay to confirm
    await Promise.race(pubs)
    
    return signedEvent
  }

  // Subscribe to events
  subscribe(
    filters: Filter, 
    onEvent: (event: Event) => void,
    subscriptionId?: string
  ): string {
    const relays = this.getRelays()
    const subId = subscriptionId || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log('Subscribing to events:', filters)
    
    const sub = this.pool.subscribe(relays, filters, {
      onevent: (event: Event) => {
        console.log('Received event:', event)
        onEvent(event)
      },
      oneose: () => {
        console.log('End of stored events for subscription:', subId)
      }
    })
    
    this.subscriptions.set(subId, sub)
    return subId
  }

  // Unsubscribe
  unsubscribe(subscriptionId: string): void {
    const sub = this.subscriptions.get(subscriptionId)
    if (sub) {
      sub.close()
      this.subscriptions.delete(subscriptionId)
      console.log('Unsubscribed:', subscriptionId)
    }
  }

  // Close all subscriptions
  closeAllSubscriptions(): void {
    for (const [, sub] of this.subscriptions) {
      sub.close()
    }
    this.subscriptions.clear()
    console.log('Closed all subscriptions')
  }

  // Quiz-specific methods

  // Publish Quiz Definition (kind 35000)
  async publishQuizDefinition(quizData: {
    quiz_id: string
    title: string
    description: string
    language: string
    question_count: number
    formstr_event_id?: string
  }): Promise<Event> {
    const tags: string[][] = [
      ['d', quizData.quiz_id]
    ]
    
    if (quizData.formstr_event_id) {
      tags.push(['formstr', quizData.formstr_event_id])
    }

    return this.publishEvent(
      EVENT_KINDS.QUIZ_DEFINITION,
      JSON.stringify({
        quiz_id: quizData.quiz_id,
        title: quizData.title,
        description: quizData.description,
        language: quizData.language,
        question_count: quizData.question_count
      }),
      tags
    )
  }

  // Publish Game Session (kind 35001)
  async publishGameSession(sessionData: {
    quiz_id: string
    pin: string
    session_id: string
    settings: {
      time_per_question: number
      quiz_type: "free" | "deposit"
      deposit_sats?: number
      payout_per_correct?: number
      host_fee_percent?: number
    }
  }): Promise<Event> {
    const tags: string[][] = [
      ['h', this.pubkey!], // host
      ['d', sessionData.session_id]
    ]

    return this.publishEvent(
      EVENT_KINDS.GAME_SESSION,
      JSON.stringify({
        quiz_id: sessionData.quiz_id,
        pin: sessionData.pin,
        settings: sessionData.settings
      }),
      tags
    )
  }

  // Publish Player Join (kind 35002)
  async publishPlayerJoin(joinData: {
    session_id: string
    session_event_id: string
    nickname: string
  }): Promise<Event> {
    const tags: string[][] = [
      ['p', this.pubkey!], // player
      ['e', joinData.session_event_id]
    ]

    return this.publishEvent(
      EVENT_KINDS.PLAYER_JOIN,
      JSON.stringify({
        session_id: joinData.session_id,
        nickname: joinData.nickname
      }),
      tags
    )
  }

  // Publish Answer (kind 35003)
  async publishAnswer(answerData: {
    session_id: string
    session_event_id: string
    question_index: number
    answer_index: number
    time_ms: number
  }): Promise<Event> {
    const tags: string[][] = [
      ['p', this.pubkey!], // player
      ['e', answerData.session_event_id]
    ]

    return this.publishEvent(
      EVENT_KINDS.ANSWER,
      JSON.stringify({
        session_id: answerData.session_id,
        question_index: answerData.question_index,
        answer_index: answerData.answer_index,
        time_ms: answerData.time_ms
      }),
      tags
    )
  }

  // Publish Score Update (kind 35004)
  async publishScoreUpdate(scoreData: {
    session_id: string
    session_event_id: string
    question_index: number
    scores: Array<{
      player_id: string
      nickname: string
      total_score: number
    }>
  }): Promise<Event> {
    const tags: string[][] = [
      ['e', scoreData.session_event_id]
    ]

    return this.publishEvent(
      EVENT_KINDS.SCORE_UPDATE,
      JSON.stringify({
        session_id: scoreData.session_id,
        question_index: scoreData.question_index,
        scores: scoreData.scores
      }),
      tags
    )
  }

  // Subscribe to game session by PIN
  subscribeToGameSessionByPin(pin: string, onSession: (event: Event) => void): string {
    return this.subscribe({
      kinds: [EVENT_KINDS.GAME_SESSION],
      '#d': [pin] // This might need adjustment based on how we store PINs
    }, onSession, `session_pin_${pin}`)
  }

  // Subscribe to player joins for a session
  subscribeToPlayerJoins(sessionEventId: string, onJoin: (event: Event) => void): string {
    return this.subscribe({
      kinds: [EVENT_KINDS.PLAYER_JOIN],
      '#e': [sessionEventId]
    }, onJoin, `joins_${sessionEventId}`)
  }

  // Subscribe to answers for a session
  subscribeToAnswers(sessionEventId: string, onAnswer: (event: Event) => void): string {
    return this.subscribe({
      kinds: [EVENT_KINDS.ANSWER],
      '#e': [sessionEventId]
    }, onAnswer, `answers_${sessionEventId}`)
  }

  // Subscribe to score updates for a session
  subscribeToScoreUpdates(sessionEventId: string, onScoreUpdate: (event: Event) => void): string {
    return this.subscribe({
      kinds: [EVENT_KINDS.SCORE_UPDATE],
      '#e': [sessionEventId]
    }, onScoreUpdate, `scores_${sessionEventId}`)
  }

  // Cleanup
  destroy(): void {
    this.closeAllSubscriptions()
    this.pool.destroy()
  }
}