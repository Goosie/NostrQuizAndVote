import { 
  createForm, 
  getPastUserForms, 
  getFormTemplate
} from '@formstr/sdk'
import { 
 
  V1FormSpec, 
  V1Field, 
  AnswerTypes,
  V1Choice 
} from '@formstr/sdk/dist/interfaces'
import { Quiz, Question, QuestionType } from '../../types'

export class FormstrService {
  constructor() {
    // No initialization needed - using static functions from SDK
  }

  /**
   * Convert a Formstr FormSpec to our internal Quiz model
   */
  formSpecToQuiz(formSpec: V1FormSpec): Quiz {
    const questions: Question[] = (formSpec.fields || [])
      .filter(field => field.answerType === AnswerTypes.radioButton)
      .map((field, index) => ({
        id: field.questionId || `q${index + 1}`,
        text: field.question,
        type: 'multiple-choice' as QuestionType,
        options: (field.answerSettings.choices || []).map(choice => choice.label),
        correctAnswer: 0, // Default to first option - would need to be set manually
        timeLimit: 30, // Default time limit
        points: 100 // Default points
      }))

    return {
      id: `formstr-${Date.now()}`,
      title: formSpec.name,
      description: formSpec.settings?.description || '',
      questions,
      createdBy: '', // Will be set by the caller
      createdAt: new Date().toISOString(),
      language: 'en',
      settings: {
        timePerQuestion: 30,
        showCorrectAnswer: true,
        allowMultipleAttempts: false,
        requireDeposit: false,
        depositAmount: 0
      }
    }
  }

  /**
   * Convert our internal Quiz model to a Formstr FormSpec
   */
  quizToFormSpec(quiz: Quiz): V1FormSpec {
    const fields: V1Field[] = quiz.questions.map((question) => ({
      questionId: question.id,
      question: question.text,
      answerType: AnswerTypes.radioButton,
      answerSettings: {
        choices: question.options.map((option, optionIndex) => ({
          choiceId: `choice_${optionIndex}`,
          label: option
        } as V1Choice)),
        required: true
      }
    }))

    return {
      schemaVersion: '1.0',
      name: quiz.title,
      fields,
      settings: {
        description: quiz.description,
        publicForm: true,
        disallowAnonymous: false
      }
    }
  }

  /**
   * Create a new form using Formstr SDK
   */
  async createForm(quiz: Quiz, userSecretKey?: string): Promise<string[]> {
    try {
      const formSpec = this.quizToFormSpec(quiz)
      const formCredentials = await createForm(
        formSpec,
        true, // saveOnNostr
        userSecretKey,
        [], // tags
        [], // relayList - use defaults
        false // encodeProfile
      )
      return formCredentials
    } catch (error) {
      console.error('Failed to create Formstr form:', error)
      throw new Error('Failed to create form on Nostr')
    }
  }

  /**
   * Load user's existing forms from Nostr
   */
  async loadUserForms(userPublicKey: string, userSecretKey?: string): Promise<V1FormSpec[]> {
    try {
      const forms = await getPastUserForms<string[]>(userPublicKey, userSecretKey)
      const formSpecs: V1FormSpec[] = []

      for (const formCredentials of forms) {
        try {
          if (Array.isArray(formCredentials) && formCredentials.length > 0) {
            const formId = formCredentials[0]
            const formSpec = await getFormTemplate(formId)
            formSpecs.push(formSpec)
          }
        } catch (error) {
          console.warn('Failed to load form:', error)
          // Continue with other forms
        }
      }

      return formSpecs
    } catch (error) {
      console.error('Failed to load user forms:', error)
      return []
    }
  }

  /**
   * Get a specific form by ID
   */
  async getForm(formId: string): Promise<V1FormSpec | null> {
    try {
      return await getFormTemplate(formId)
    } catch (error) {
      console.error('Failed to get form:', error)
      return null
    }
  }
}

export const formstrService = new FormstrService()