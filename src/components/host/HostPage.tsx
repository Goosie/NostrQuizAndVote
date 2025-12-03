import { useState, useEffect } from 'react'
import { useNostr } from '../../services/nostr'
import { QuizBuilder, QuizList } from '../quiz'
import { FormstrBuilder } from '../FormstrBuilder'
import { GameSession } from '../game/GameSession'
import { Quiz } from '../../types'
import { formstrService } from '../../services/formstr'

type HostView = 'list' | 'create' | 'formstr' | 'session'

const HostPage = () => {
  const { nostr, isConnected, pubkey, error, loginWithNIP07 } = useNostr()
  const [isConnecting, setIsConnecting] = useState(false)
  const [currentView, setCurrentView] = useState<HostView>('list')
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)

  // Load Formstr forms when connected
  useEffect(() => {
    const loadFormstrForms = async () => {
      if (isConnected && pubkey) {
        try {
          const forms = await formstrService.loadUserForms(pubkey)
          const formQuizzes = forms.map(form => formstrService.formSpecToQuiz(form))
          setQuizzes(prev => {
            // Merge with existing quizzes, avoiding duplicates
            const existingIds = prev.map(q => q.id)
            const newQuizzes = formQuizzes.filter(q => !existingIds.includes(q.id))
            return [...prev, ...newQuizzes]
          })
        } catch (error) {
          console.error('Failed to load Formstr forms:', error)
        }
      }
    }

    loadFormstrForms()
  }, [isConnected, pubkey])

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
          onCreateWithFormstr={() => setCurrentView('formstr')}
          onDeleteQuiz={handleDeleteQuiz}
        />
      )}
      
      {currentView === 'create' && (
        <QuizBuilder
          onSave={handleSaveQuiz}
          onCancel={() => setCurrentView('list')}
        />
      )}
      
      {currentView === 'formstr' && (
        <FormstrBuilder
          onSave={handleSaveQuiz}
          onCancel={() => setCurrentView('list')}
        />
      )}
      
      {currentView === 'session' && selectedQuiz && (
        <GameSession
          quiz={selectedQuiz}
          onBack={() => setCurrentView('list')}
        />
      )}
    </div>
  )
}

export default HostPage