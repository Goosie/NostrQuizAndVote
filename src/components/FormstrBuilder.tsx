import React, { useState, useEffect } from 'react'
import { V1FormSpec, V1Field, AnswerTypes, V1Choice } from '@formstr/sdk/dist/interfaces'
import { Quiz } from '../types'
import { formstrService } from '../services/formstr'

interface FormstrBuilderProps {
  onSave: (quiz: Quiz) => void
  onCancel: () => void
  initialQuiz?: Quiz
}

export const FormstrBuilder: React.FC<FormstrBuilderProps> = ({
  onSave,
  onCancel,
  initialQuiz
}) => {
  console.log('FormstrBuilder component rendered with props:', { onSave, onCancel, initialQuiz })
  
  const [formSpec, setFormSpec] = useState<V1FormSpec>({
    schemaVersion: '1.0',
    name: initialQuiz?.title || '',
    fields: [],
    settings: {
      description: initialQuiz?.description || '',
      publicForm: true,
      disallowAnonymous: false
    }
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialQuiz) {
      // Convert existing quiz to FormSpec
      const spec = formstrService.quizToFormSpec(initialQuiz)
      setFormSpec(spec)
    }
  }, [initialQuiz])

  const addField = (answerType: AnswerTypes) => {
    const newField: V1Field = {
      questionId: `q_${Date.now()}`,
      question: '',
      answerType,
      answerSettings: {
        required: true,
        choices: answerType === AnswerTypes.radioButton || 
                answerType === AnswerTypes.checkboxes || 
                answerType === AnswerTypes.dropdown
          ? [
              { choiceId: 'choice_1', label: 'Option 1' },
              { choiceId: 'choice_2', label: 'Option 2' }
            ]
          : undefined
      }
    }

    setFormSpec((prev: V1FormSpec) => ({
      ...prev,
      fields: [...(prev.fields || []), newField]
    }))
  }

  const updateField = (index: number, updates: Partial<V1Field>) => {
    setFormSpec(prev => ({
      ...prev,
      fields: prev.fields?.map((field, i) => 
        i === index ? { ...field, ...updates } : field
      ) || []
    }))
  }

  const removeField = (index: number) => {
    setFormSpec(prev => ({
      ...prev,
      fields: prev.fields?.filter((_, i) => i !== index) || []
    }))
  }

  const updateChoice = (fieldIndex: number, choiceIndex: number, label: string) => {
    setFormSpec(prev => ({
      ...prev,
      fields: prev.fields?.map((field, i) => {
        if (i === fieldIndex && field.answerSettings?.choices) {
          const updatedChoices = field.answerSettings.choices.map((choice, j) =>
            j === choiceIndex ? { ...choice, label } : choice
          )
          return {
            ...field,
            answerSettings: {
              ...field.answerSettings,
              choices: updatedChoices
            }
          }
        }
        return field
      }) || []
    }))
  }

  const addChoice = (fieldIndex: number) => {
    setFormSpec(prev => ({
      ...prev,
      fields: prev.fields?.map((field, i) => {
        if (i === fieldIndex && field.answerSettings?.choices) {
          const newChoice: V1Choice = {
            choiceId: `choice_${field.answerSettings.choices.length + 1}`,
            label: `Option ${field.answerSettings.choices.length + 1}`
          }
          return {
            ...field,
            answerSettings: {
              ...field.answerSettings,
              choices: [...field.answerSettings.choices, newChoice]
            }
          }
        }
        return field
      }) || []
    }))
  }

  const removeChoice = (fieldIndex: number, choiceIndex: number) => {
    setFormSpec(prev => ({
      ...prev,
      fields: prev.fields?.map((field, i) => {
        if (i === fieldIndex && field.answerSettings?.choices) {
          return {
            ...field,
            answerSettings: {
              ...field.answerSettings,
              choices: field.answerSettings.choices.filter((_, j) => j !== choiceIndex)
            }
          }
        }
        return field
      }) || []
    }))
  }

  const handleSave = async () => {
    alert('handleSave function called!')
    console.log('handleSave called')
    
    if (!formSpec.name.trim()) {
      alert('Please enter a form name')
      return
    }

    if (!formSpec.fields || formSpec.fields.length === 0) {
      alert('Please add at least one question')
      return
    }

    console.log('Validation passed, setting loading state')
    setIsLoading(true)

    try {
      console.log('Converting FormSpec to Quiz:', formSpec)
      // Convert FormSpec to Quiz
      const quiz = formstrService.formSpecToQuiz(formSpec)
      console.log('Converted quiz:', quiz)
      
      // In test mode, skip actual Formstr creation
      const isDev = import.meta.env.DEV
      if (isDev) {
        console.log('Test mode: Skipping Formstr SDK creation')
        quiz.formstr_event_id = ['test_form_' + Date.now()]
      } else {
        // Create form using Formstr SDK (this will publish to Nostr)
        const formCredentials = await formstrService.createForm(quiz)
        
        if (formCredentials && formCredentials.length > 0) {
          // Add formstr reference to quiz
          quiz.formstr_event_id = formCredentials
        }
      }

      console.log('Calling onSave with quiz:', quiz)
      onSave(quiz)
    } catch (error) {
      console.error('Failed to save form:', error)
      alert('Failed to save form. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getFieldTypeName = (type: AnswerTypes): string => {
    switch (type) {
      case AnswerTypes.radioButton: return 'Multiple Choice'
      case AnswerTypes.checkboxes: return 'Checkboxes'
      case AnswerTypes.dropdown: return 'Dropdown'
      case AnswerTypes.shortText: return 'Short Text'
      case AnswerTypes.paragraph: return 'Paragraph'
      case AnswerTypes.number: return 'Number'
      case AnswerTypes.date: return 'Date'
      case AnswerTypes.time: return 'Time'
      default: return 'Unknown'
    }
  }

  const hasChoices = (type: AnswerTypes): boolean => {
    return [AnswerTypes.radioButton, AnswerTypes.checkboxes, AnswerTypes.dropdown].includes(type)
  }

  return (
    <div className="formstr-builder">
      <div className="formstr-builder__header">
        <h2>Create Quiz with Formstr</h2>
        <p>Build your quiz using the Formstr protocol - it will be published to Nostr</p>
      </div>

      <div className="formstr-builder__form">
        {/* Form Details */}
        <div className="form-section">
          <h3>Form Details</h3>
          <div className="form-group">
            <label>Form Name *</label>
            <input
              type="text"
              value={formSpec.name}
              onChange={(e) => setFormSpec(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter quiz title"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formSpec.settings?.description || ''}
              onChange={(e) => setFormSpec(prev => ({ 
                ...prev, 
                settings: { ...prev.settings, description: e.target.value }
              }))}
              placeholder="Enter quiz description"
              className="form-textarea"
              rows={3}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="form-section">
          <h3>Questions</h3>
          
          {formSpec.fields?.map((field, fieldIndex) => (
            <div key={field.questionId} className="question-card">
              <div className="question-header">
                <span className="question-number">Question {fieldIndex + 1}</span>
                <span className="question-type">{getFieldTypeName(field.answerType)}</span>
                <button
                  type="button"
                  onClick={() => removeField(fieldIndex)}
                  className="btn-remove"
                >
                  Remove
                </button>
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <input
                  type="text"
                  value={field.question}
                  onChange={(e) => updateField(fieldIndex, { question: e.target.value })}
                  placeholder="Enter your question"
                  className="form-input"
                />
              </div>

              {hasChoices(field.answerType) && field.answerSettings?.choices && (
                <div className="choices-section">
                  <label>Answer Options</label>
                  {field.answerSettings.choices.map((choice, choiceIndex) => (
                    <div key={choice.choiceId} className="choice-item">
                      <input
                        type="text"
                        value={choice.label}
                        onChange={(e) => updateChoice(fieldIndex, choiceIndex, e.target.value)}
                        placeholder={`Option ${choiceIndex + 1}`}
                        className="form-input"
                      />
                      {field.answerSettings!.choices!.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeChoice(fieldIndex, choiceIndex)}
                          className="btn-remove-choice"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addChoice(fieldIndex)}
                    className="btn-add-choice"
                  >
                    + Add Option
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add Question Buttons */}
          <div className="add-question-section">
            <h4>Add Question</h4>
            <div className="question-types">
              <button
                type="button"
                onClick={() => addField(AnswerTypes.radioButton)}
                className="btn-add-question"
              >
                + Multiple Choice
              </button>
              <button
                type="button"
                onClick={() => addField(AnswerTypes.checkboxes)}
                className="btn-add-question"
              >
                + Checkboxes
              </button>
              <button
                type="button"
                onClick={() => addField(AnswerTypes.dropdown)}
                className="btn-add-question"
              >
                + Dropdown
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="formstr-builder__actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      </div>
    </div>
  )
}