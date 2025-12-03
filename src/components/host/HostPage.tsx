import { useState } from 'react'
import { useNostr } from '../../services/nostr'
import { QuizBuilder, QuizList } from '../quiz'
import { Quiz } from '../../types'

type HostView = 'list' | 'create' | 'session'

const HostPage = () => {
  const { nostr, isConnected, pubkey, error, loginWithNIP07 } = useNostr()
  const [isConnecting, setIsConnecting] = useState(false)
  const [currentView, setCurrentView] = useState<HostView>('list')
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await loginWithNIP07()
    } catch (err) {
      console.error('Connection failed:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSaveQuiz = async (quiz: Quiz) => {
    try {
      // Set the creator
      const completeQuiz = { ...quiz, createdBy: pubkey || '' }
      
      // Publish quiz to Nostr
      if (nostr) {
        const quizData = {
          quiz_id: completeQuiz.id,
          title: completeQuiz.title,
          description: completeQuiz.description,
          language: completeQuiz.language || 'en',
          question_count: completeQuiz.questions.length
        }
        await nostr.publishQuizDefinition(quizData)
        console.log('Quiz published to Nostr:', completeQuiz.id)
      }
      
      // Add to local list
      setQuizzes(prev => [...prev, completeQuiz])
      setCurrentView('list')
    } catch (err) {
      console.error('Failed to save quiz:', err)
      alert('Failed to save quiz. Please try again.')
    }
  }

  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setCurrentView('session')
    // TODO: Create game session
  }

  const handleDeleteQuiz = (quizId: string) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      setQuizzes(prev => prev.filter(q => q.id !== quizId))
    }
  }

  if (!isConnected) {
    return (
      <div className="host-page">
        <div className="card">
          <h1>Host a Quiz</h1>
          <p>Connect your Nostr account to create and host live quiz sessions.</p>
          
          {error && (
            <div className="error-message">
              <p>Connection failed: {error}</p>
            </div>
          )}
          
          <button 
            className="btn btn-primary w-full"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect with Nostr (NIP-07)'}
          </button>
          
          <div className="help-text">
            <p>You'll need a Nostr browser extension like:</p>
            <ul>
              <li>Alby</li>
              <li>nos2x</li>
              <li>Flamingo</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="host-page">
      {currentView === 'list' && (
        <QuizList
          quizzes={quizzes}
          onSelectQuiz={handleSelectQuiz}
          onCreateNew={() => setCurrentView('create')}
          onDeleteQuiz={handleDeleteQuiz}
        />
      )}
      
      {currentView === 'create' && (
        <QuizBuilder
          onSave={handleSaveQuiz}
          onCancel={() => setCurrentView('list')}
        />
      )}
      
      {currentView === 'session' && selectedQuiz && (
        <div className="game-session">
          <div className="session-header">
            <h2>Game Session: {selectedQuiz.title}</h2>
            <button 
              className="btn btn-secondary"
              onClick={() => setCurrentView('list')}
            >
              Back to Quizzes
            </button>
          </div>
          <div className="card">
            <p>Game session management coming soon...</p>
            <p>Selected quiz: <strong>{selectedQuiz.title}</strong></p>
            <p>Questions: {selectedQuiz.questions.length}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default HostPage