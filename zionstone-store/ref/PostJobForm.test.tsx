import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PostJobForm from '../PostJobForm'

vi.mock('../../../api/jobs', () => ({
  createJob: vi.fn(),
}))

vi.mock('../../../utils/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}))

function renderPostJobForm() {
  return render(
    <MemoryRouter initialEntries={['/post-job']}>
      <PostJobForm />
    </MemoryRouter>
  )
}

describe('PostJobForm', () => {
  it('renders job title input', () => {
    renderPostJobForm()
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument()
  })

  it('renders company name input', () => {
    renderPostJobForm()
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
  })

  it('renders location input', () => {
    renderPostJobForm()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderPostJobForm()
    expect(screen.getByRole('button', { name: /submit job listing/i })).toBeInTheDocument()
  })

  it('renders remote checkbox', () => {
    renderPostJobForm()
    expect(screen.getByRole('checkbox', { name: /remote/i })).toBeInTheDocument()
  })

  it('renders category select', () => {
    renderPostJobForm()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
  })

  it('renders seniority select', () => {
    renderPostJobForm()
    expect(screen.getByLabelText(/seniority/i)).toBeInTheDocument()
  })
})
