import React, { useState } from 'react'
import { Quiz, Question, QuizSettings } from '../../types'

interface QuizBuilderProps {
  onSave: (quiz: Quiz) => void
  onCancel: () => void
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({ onSave, onCancel }) => {
  const [quiz, setQuiz] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    questions: [],
    settings: {
      timePerQuestion: 30,
      showCorrectAnswer: true,
      allowMultipleAttempts: false,
      requireDeposit: false,
      depositAmount: 0
    }
  })

  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    timeLimit: 30,
    points: 100
  })

  const [isAddingQuestion, setIsAddingQuestion] = useState(false)

  const handleQuizChange = (field: keyof Quiz, value: any) => {
    setQuiz(prev => ({ ...prev, [field]: value }))
  }

  const handleSettingsChange = (field: keyof QuizSettings, value: any) => {
    setQuiz(prev => ({
      ...prev,
      settings: { ...prev.settings!, [field]: value }
    }))
  }

  const handleQuestionChange = (field: keyof Question, value: any) => {
    setCurrentQuestion(prev => ({ ...prev, [field]: value }))
  }

  const handleOptionChange = (index: number, value: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => i === index ? value : opt) || []
    }))
  }

  const addQuestion = () => {
    if (currentQuestion.text && currentQuestion.options?.every(opt => opt.trim())) {
      const newQuestion: Question = {
        id: `q_${Date.now()}`,
        text: currentQuestion.text,
        options: currentQuestion.options,
        correctAnswer: currentQuestion.correctAnswer || 0,
        timeLimit: currentQuestion.timeLimit || 30,
        points: currentQuestion.points || 100
      }

      setQuiz(prev => ({
        ...prev,
        questions: [...(prev.questions || []), newQuestion]
      }))

      // Reset current question
      setCurrentQuestion({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        timeLimit: 30,
        points: 100
      })
      setIsAddingQuestion(false)
    }
  }

  const removeQuestion = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions?.filter((_, i) => i !== index) || []
    }))
  }

  const handleSave = () => {
    if (quiz.title && quiz.questions && quiz.questions.length > 0) {
      const completeQuiz: Quiz = {
        id: `quiz_${Date.now()}`,
        title: quiz.title,
        description: quiz.description || '',
        questions: quiz.questions,
        settings: quiz.settings!,
        createdAt: new Date(),
        createdBy: '' // Will be set by the parent component
      }
      onSave(completeQuiz)
    }
  }

  const canSave = quiz.title && quiz.questions && quiz.questions.length > 0

  return (
    <div className="quiz-builder">
      <div className="quiz-builder-header">
        <h2>Create Quiz</h2>
        <div className="quiz-builder-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={!canSave}
          >
            Save Quiz
          </button>
        </div>
      </div>

      <div className="quiz-builder-content">
        {/* Quiz Basic Info */}
        <div className="quiz-section">
          <h3>Quiz Information</h3>
          <div className="form-group">
            <label htmlFor="quiz-title">Title *</label>
            <input
              id="quiz-title"
              type="text"
              className="form-input"
              value={quiz.title || ''}
              onChange={(e) => handleQuizChange('title', e.target.value)}
              placeholder="Enter quiz title..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="quiz-description">Description</label>
            <textarea
              id="quiz-description"
              className="form-input"
              rows={3}
              value={quiz.description || ''}
              onChange={(e) => handleQuizChange('description', e.target.value)}
              placeholder="Enter quiz description..."
            />
          </div>
        </div>

        {/* Quiz Settings */}
        <div className="quiz-section">
          <h3>Quiz Settings</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="time-per-question">Time per Question (seconds)</label>
              <input
                id="time-per-question"
                type="number"
                className="form-input"
                min="10"
                max="300"
                value={quiz.settings?.timePerQuestion || 30}
                onChange={(e) => handleSettingsChange('timePerQuestion', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={quiz.settings?.showCorrectAnswer || false}
                  onChange={(e) => handleSettingsChange('showCorrectAnswer', e.target.checked)}
                />
                Show correct answers after each question
              </label>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={quiz.settings?.requireDeposit || false}
                  onChange={(e) => handleSettingsChange('requireDeposit', e.target.checked)}
                />
                Require deposit to join
              </label>
            </div>
            {quiz.settings?.requireDeposit && (
              <div className="form-group">
                <label htmlFor="deposit-amount">Deposit Amount (sats)</label>
                <input
                  id="deposit-amount"
                  type="number"
                  className="form-input"
                  min="1"
                  value={quiz.settings?.depositAmount || 0}
                  onChange={(e) => handleSettingsChange('depositAmount', parseInt(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>

        {/* Questions List */}
        <div className="quiz-section">
          <div className="section-header">
            <h3>Questions ({quiz.questions?.length || 0})</h3>
            <button 
              className="btn btn-primary"
              onClick={() => setIsAddingQuestion(true)}
            >
              Add Question
            </button>
          </div>

          {quiz.questions?.map((question, index) => (
            <div key={question.id} className="question-item">
              <div className="question-header">
                <span className="question-number">Q{index + 1}</span>
                <span className="question-text">{question.text}</span>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => removeQuestion(index)}
                >
                  Remove
                </button>
              </div>
              <div className="question-options">
                {question.options.map((option, optIndex) => (
                  <div 
                    key={optIndex} 
                    className={`option ${optIndex === question.correctAnswer ? 'correct' : ''}`}
                  >
                    {String.fromCharCode(65 + optIndex)}. {option}
                  </div>
                ))}
              </div>
              <div className="question-meta">
                <span>Time: {question.timeLimit}s</span>
                <span>Points: {question.points}</span>
              </div>
            </div>
          ))}

          {quiz.questions?.length === 0 && !isAddingQuestion && (
            <div className="empty-state">
              <p>No questions added yet. Click "Add Question" to get started.</p>
            </div>
          )}
        </div>

        {/* Add Question Form */}
        {isAddingQuestion && (
          <div className="quiz-section add-question-form">
            <h3>Add New Question</h3>
            <div className="form-group">
              <label htmlFor="question-text">Question Text *</label>
              <textarea
                id="question-text"
                className="form-input"
                rows={2}
                value={currentQuestion.text || ''}
                onChange={(e) => handleQuestionChange('text', e.target.value)}
                placeholder="Enter your question..."
              />
            </div>

            <div className="form-group">
              <label>Answer Options *</label>
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="option-input">
                  <span className="option-label">{String.fromCharCode(65 + index)}.</span>
                  <input
                    type="text"
                    className="form-input"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                  <label className="correct-answer-radio">
                    <input
                      type="radio"
                      name="correct-answer"
                      checked={currentQuestion.correctAnswer === index}
                      onChange={() => handleQuestionChange('correctAnswer', index)}
                    />
                    Correct
                  </label>
                </div>
              ))}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="question-time">Time Limit (seconds)</label>
                <input
                  id="question-time"
                  type="number"
                  className="form-input"
                  min="10"
                  max="300"
                  value={currentQuestion.timeLimit || 30}
                  onChange={(e) => handleQuestionChange('timeLimit', parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="question-points">Points</label>
                <input
                  id="question-points"
                  type="number"
                  className="form-input"
                  min="10"
                  max="1000"
                  step="10"
                  value={currentQuestion.points || 100}
                  onChange={(e) => handleQuestionChange('points', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setIsAddingQuestion(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={addQuestion}
                disabled={!currentQuestion.text || !currentQuestion.options?.every(opt => opt.trim())}
              >
                Add Question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}