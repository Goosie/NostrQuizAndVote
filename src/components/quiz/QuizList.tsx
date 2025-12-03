import React from 'react'
import { Quiz } from '../../types'

interface QuizListProps {
  quizzes: Quiz[]
  onSelectQuiz: (quiz: Quiz) => void
  onCreateNew: () => void
  onDeleteQuiz?: (quizId: string) => void
}

export const QuizList: React.FC<QuizListProps> = ({ 
  quizzes, 
  onSelectQuiz, 
  onCreateNew, 
  onDeleteQuiz 
}) => {
  return (
    <div className="quiz-list">
      <div className="quiz-list-header">
        <h2>Your Quizzes</h2>
        <button className="btn btn-primary" onClick={onCreateNew}>
          Create New Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <h3>No quizzes yet</h3>
          <p>Create your first quiz to get started with hosting live quiz sessions!</p>
          <button className="btn btn-primary" onClick={onCreateNew}>
            Create Your First Quiz
          </button>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <div className="quiz-card-header">
                <h3 className="quiz-title">{quiz.title}</h3>
                {onDeleteQuiz && (
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteQuiz(quiz.id)
                    }}
                    title="Delete quiz"
                  >
                    ×
                  </button>
                )}
              </div>
              
              {quiz.description && (
                <p className="quiz-description">{quiz.description}</p>
              )}
              
              <div className="quiz-stats">
                <div className="stat">
                  <span className="stat-value">{quiz.questions.length}</span>
                  <span className="stat-label">Questions</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{quiz.settings.timePerQuestion}s</span>
                  <span className="stat-label">Per Question</span>
                </div>
                {quiz.settings.requireDeposit && (
                  <div className="stat">
                    <span className="stat-value">{quiz.settings.depositAmount}</span>
                    <span className="stat-label">Sats Deposit</span>
                  </div>
                )}
              </div>
              
              <div className="quiz-meta">
                <span className="created-date">
                  Created {new Date(quiz.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <button 
                className="btn btn-primary w-full"
                onClick={() => onSelectQuiz(quiz)}
              >
                Start Game Session
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}