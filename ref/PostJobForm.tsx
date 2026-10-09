import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Resolver } from 'react-hook-form'
import { CheckCircle } from 'lucide-react'
import { Button, Input } from '../ui'
import { createJob } from '../../api/jobs'
import { ImportPromptButton } from './ImportPromptButton'

const currencies = ['USD', 'EUR', 'GBP']
const categories = ['Engineering', 'Design', 'Marketing', 'Sales', 'Operations', 'Product', 'Support']
const seniorities = ['Junior', 'Mid', 'Senior', 'Lead', 'Executive']

const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().min(1, 'Location is required'),
  remote: z.boolean(),
  salaryMin: z.coerce.number().min(0, 'Must be positive').optional(),
  salaryMax: z.coerce.number().min(0, 'Must be positive').optional(),
  currency: z.string(),
  category: z.string(),
  seniority: z.string(),
  tags: z.string(),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string(),
  responsibilities: z.string(),
  applicationUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

type JobFormData = z.infer<typeof jobSchema>

interface ScreeningQuestionDraft {
  id: string
  prompt: string
  expectedKeywords: string
  maxScore: number
}

const selectClass =
  'w-full rounded-md border border-hairline bg-surface-1 text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:border-ink px-3 py-2.5 text-sm'
const textareaClass =
  'w-full rounded-md border border-hairline bg-surface-1 text-ink placeholder:text-ink-tertiary outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:border-ink px-3 py-2.5 text-sm resize-none'

export default function PostJobForm() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestionDraft[]>([])
  const [isScreeningOpen, setIsScreeningOpen] = useState(false)
  const nextQuestionId = useRef(1)

  const addScreeningQuestion = () => {
    setIsScreeningOpen(true)
    setScreeningQuestions((prev) => [
      ...prev,
      { id: `q${nextQuestionId.current++}`, prompt: '', expectedKeywords: '', maxScore: 5 },
    ])
  }

  const removeScreeningQuestion = (id: string) => {
    setScreeningQuestions((prev) => prev.filter((question) => question.id !== id))
  }

  const updateScreeningQuestion = (
    id: string,
    patch: Partial<Omit<ScreeningQuestionDraft, 'id'>>
  ) => {
    setScreeningQuestions((prev) =>
      prev.map((question) => (question.id === id ? { ...question, ...patch } : question))
    )
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema) as Resolver<JobFormData>,
    defaultValues: {
      title: '',
      company: '',
      location: '',
      remote: false,
      salaryMin: undefined,
      salaryMax: undefined,
      currency: 'USD',
      category: 'Engineering',
      seniority: 'Mid',
      tags: '',
      description: '',
      requirements: '',
      responsibilities: '',
      applicationUrl: '',
    },
  })

  const onSubmit = async (data: JobFormData) => {
    setSubmitError(null)
    try {
      await createJob({
        title: data.title,
        company: data.company,
        location: data.location,
        remote: data.remote,
        salaryMin: data.salaryMin as number | undefined,
        salaryMax: data.salaryMax as number | undefined,
        currency: data.currency,
        category: data.category,
        seniority: data.seniority,
        tags: data.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        description: data.description,
        requirements: data.requirements
          .split('\n')
          .map(r => r.trim())
          .filter(Boolean),
        responsibilities: data.responsibilities
          .split('\n')
          .map(r => r.trim())
          .filter(Boolean),
        applicationUrl: data.applicationUrl as string | undefined,
        ...(screeningQuestions.length > 0
          ? {
              screeningQuestions: screeningQuestions.map((draft, index) => ({
                prompt: draft.prompt,
                expectedKeywords: draft.expectedKeywords
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean),
                maxScore: Number(draft.maxScore) || 5,
                order: index + 1,
              })),
            }
          : {}),
      })
      reset(undefined, { keepIsSubmitSuccessful: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const onInvalid = () => {
    setSubmitError(null)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
      {submitError && (
        <div
          role="alert"
          className="rounded-lg border border-error/30 bg-error/5 p-4 text-sm text-error"
        >
          {submitError}
        </div>
      )}

      {isSubmitSuccessful && !submitError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/5 p-4"
        >
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
          <div>
            <p className="font-medium text-ink">Job listing submitted!</p>
            <p className="mt-1 text-sm text-ink-muted">
              We'll review it and publish it within 24 hours.
            </p>
          </div>
        </div>
      )}

      <Input
        label="Job title"
        required
        error={errors.title?.message}
        {...register('title')}
      />

      <Input
        label="Company name"
        required
        error={errors.company?.message}
        {...register('company')}
      />

      <Input
        label="Location"
        required
        error={errors.location?.message}
        {...register('location')}
      />

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-hairline accent-ink"
            {...register('remote')}
          />
          This job is remote
        </label>
      </div>

      <div>
        <label className="text-sm font-medium text-ink mb-1.5 block">Salary range</label>
        <div className="flex gap-3">
          <Input
            label="Min"
            type="number"
            placeholder="Min"
            className="[&>div]:mb-0"
            error={errors.salaryMin?.message}
            {...register('salaryMin')}
          />
          <Input
            label="Max"
            type="number"
            placeholder="Max"
            error={errors.salaryMax?.message}
            {...register('salaryMax')}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink mb-1.5 block" htmlFor="currency">
          Currency
        </label>
        <select
          id="currency"
          className={selectClass}
          {...register('currency')}
        >
          {currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-ink mb-1.5 block" htmlFor="category">
          Category
        </label>
        <select
          id="category"
          className={selectClass}
          {...register('category')}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-ink mb-1.5 block" htmlFor="seniority">
          Seniority
        </label>
        <select
          id="seniority"
          className={selectClass}
          {...register('seniority')}
        >
          {seniorities.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Tags"
        placeholder="Comma-separated (e.g. React, TypeScript, AWS)"
        {...register('tags')}
      />

      <div>
        <label className="text-sm font-medium text-ink mb-1.5 block" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows={6}
          placeholder="Full job description..."
          className={textareaClass}
          {...register('description')}
        />
        {errors.description?.message && (
          <p className="mt-1 text-sm text-error" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-ink mb-1.5 block" htmlFor="requirements">
          Requirements
        </label>
        <textarea
          id="requirements"
          rows={4}
          placeholder="One per line..."
          className={textareaClass}
          {...register('requirements')}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink mb-1.5 block" htmlFor="responsibilities">
          Responsibilities
        </label>
        <textarea
          id="responsibilities"
          rows={4}
          placeholder="One per line..."
          className={textareaClass}
          {...register('responsibilities')}
        />
      </div>

      <div className="rounded-lg border border-hairline">
        <div className="flex items-center justify-between gap-3 p-4">
          <button
            type="button"
            onClick={() => setIsScreeningOpen((open) => !open)}
            className="flex items-center gap-2 text-sm font-semibold text-ink"
          >
            Screening questions (optional)
            <span aria-hidden="true">{isScreeningOpen ? '−' : '+'}</span>
          </button>
          <Button variant="secondary" size="sm" type="button" onClick={addScreeningQuestion}>
            Add screening question
          </Button>
        </div>

        {isScreeningOpen && (
          <div className="space-y-4 border-t border-hairline p-4">
            {screeningQuestions.length === 0 ? (
              <p className="text-sm text-ink-muted">
                No screening questions yet. Add one to quiz applicants on key skills.
              </p>
            ) : (
              screeningQuestions.map((question, index) => (
                <div key={question.id} className="rounded-md border border-hairline p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink">Question {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeScreeningQuestion(question.id)}
                      className="text-sm text-ink-muted hover:text-error"
                    >
                      Remove question
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    <Input
                      label="Question prompt"
                      id={`${question.id}-prompt`}
                      value={question.prompt}
                      onChange={(e) =>
                        updateScreeningQuestion(question.id, { prompt: e.target.value })
                      }
                    />
                    <Input
                      label="Expected keywords"
                      id={`${question.id}-keywords`}
                      placeholder="e.g. python, fastapi"
                      value={question.expectedKeywords}
                      onChange={(e) =>
                        updateScreeningQuestion(question.id, { expectedKeywords: e.target.value })
                      }
                    />
                    <Input
                      label="Max score"
                      id={`${question.id}-max-score`}
                      type="number"
                      min={1}
                      max={100}
                      value={question.maxScore}
                      onChange={(e) =>
                        updateScreeningQuestion(question.id, {
                          maxScore: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <Input
        label="Application URL"
        type="url"
        placeholder="https://..."
        error={errors.applicationUrl?.message}
        {...register('applicationUrl')}
      />

      <ImportPromptButton />

      <Button variant="primary" size="lg" className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit job listing'}
      </Button>
    </form>
  )
}
