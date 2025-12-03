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

  // Load quizzes from localStorage on mount
  useEffect(() => {
    const loadLocalQuizzes = () => {
      try {
        const savedQuizzes = localStorage.getItem('nostr-quiz-saved-quizzes')
        if (savedQuizzes) {
          const parsedQuizzes = JSON.parse(savedQuizzes) as Quiz[]
          console.log('Loaded quizzes from localStorage:', parsedQuizzes)
          setQuizzes(parsedQuizzes)
        }
      } catch (error) {
        console.error('Failed to load quizzes from localStorage:', error)
      }
    }

    loadLocalQuizzes()
  }, [])

  // Load Formstr forms and Nostr quizzes when connected
  useEffect(() => {
    const loadRemoteQuizzes = async () => {
      if (isConnected && pubkey) {
        try {
          // Load Formstr forms
          const forms = await formstrService.loadUserForms(pubkey)
          const formQuizzes = forms.map(form => formstrService.formSpecToQuiz(form))
          
          // Load user's published quizzes from Nostr
          let nostrQuizzes: Quiz[] = []
          if (nostr) {
            try {
              nostrQuizzes = await nostr.loadUserQuizzes(pubkey)
              console.log('Loaded quizzes from Nostr:', nostrQuizzes)
            } catch (error) {
              console.error('Failed to load Nostr quizzes:', error)
            }
          }

          // Merge all quizzes, avoiding duplicates
          const allRemoteQuizzes = [...formQuizzes, ...nostrQuizzes]
          setQuizzes(prev => {
            const existingIds = prev.map(q => q.id)
            const newQuizzes = allRemoteQuizzes.filter(q => !existingIds.includes(q.id))
            const updatedQuizzes = [...prev, ...newQuizzes]
            
            // Save to localStorage
            localStorage.setItem('nostr-quiz-saved-quizzes', JSON.stringify(updatedQuizzes))
            
            return updatedQuizzes
          })
        } catch (error) {
          console.error('Failed to load remote quizzes:', error)
        }
      }
    }

    loadRemoteQuizzes()
  }, [isConnected, pubkey, nostr])

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
    console.log('handleSaveQuiz called with quiz:', quiz)
    try {
      // Set the creator
      const completeQuiz = { ...quiz, createdBy: pubkey || '' }
      console.log('Complete quiz:', completeQuiz)
      
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
      
      // Add to local list and save to localStorage
      setQuizzes(prev => {
        const updatedQuizzes = [...prev, completeQuiz]
        // Save to localStorage for persistence
        localStorage.setItem('nostr-quiz-saved-quizzes', JSON.stringify(updatedQuizzes))
        return updatedQuizzes
      })
      
      setCurrentView('list')
      console.log('Quiz saved successfully, returning to list view')
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