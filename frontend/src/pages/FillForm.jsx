import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

export default function FillForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [direction, setDirection] = useState('forward')
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    fetchForm()
  }, [id])

  async function fetchForm() {
    try {
      const res = await api.get(`/forms/${id}/form`)
      setForm(res.data)
      setQuestions(res.data.questions || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  function getCurrentAnswer() {
    return answers[questions[currentIndex]?.id]
  }

  function handleSingleChoice(option) {
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: { answer_options: [option] }
    }))
    // auto advance after short delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setDirection('forward')
        setAnimating(true)
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1)
          setAnimating(false)
        }, 200)
      }
    }, 400)
  }

  function handleMultipleChoice(option) {
    const current = answers[questions[currentIndex]?.id]?.answer_options || []
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option]
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: { answer_options: updated }
    }))
  }

  function handleText(value) {
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: { answer_text: value }
    }))
  }

  function canProceed() {
    const q = questions[currentIndex]
    if (!q?.is_required) return true
    const ans = answers[q.id]
    if (!ans) return false
    if (q.question_type === 'text') return ans.answer_text?.trim().length > 0
    return ans.answer_options?.length > 0
  }

  function goNext() {
    if (!canProceed()) return
    if (currentIndex < questions.length - 1) {
      setDirection('forward')
      setAnimating(true)
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
        setAnimating(false)
      }, 200)
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setDirection('backward')
      setAnimating(true)
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1)
        setAnimating(false)
      }, 200)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && canProceed()) goNext()
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const formattedAnswers = Object.entries(answers).map(([question_id, ans]) => ({
        question_id,
        answer_text: ans.answer_text || null,
        answer_options: ans.answer_options || null
      }))
      await api.post(`/forms/${id}/submit`, { answers: formattedAnswers })
      navigate(`/trips/${id}`)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f1515' }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#c8e64c', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!form || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#0f1515' }}>
        <p style={{ color: '#8a9e9e' }}>No form found</p>
        <button onClick={() => navigate(`/trips/${id}`)} className="mt-4 text-sm" style={{ color: '#c8e64c' }}>
          Go back
        </button>
      </div>
    )
  }

  const question = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const progress = ((currentIndex) / questions.length) * 100

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#0f1515' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >

      {/* ── PROGRESS BAR ── */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full h-1" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-1 transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: '#c8e64c' }}
          />
        </div>

        {/* navbar */}
        <div
          className="flex items-center justify-between px-10 py-4"
          style={{
            backgroundColor: 'rgba(15,21,21,0.97)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <button
            onClick={() => navigate(`/trips/${id}`)}
            className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
            style={{ color: '#8a9e9e' }}
          >
            <ArrowLeft size={16} />
            Back to Trip
          </button>

          <h1
            className="text-xl tracking-widest"
            style={{ fontFamily: 'Bebas Neue, cursive', color: '#c8e64c' }}
          >
            VOYANT
          </h1>

          <div className="text-sm" style={{ color: '#8a9e9e' }}>
            <span style={{ color: '#c8e64c' }}>{currentIndex + 1}</span>
            <span> / {questions.length}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-28 pb-24">
        <div className="w-full max-w-2xl">

          {/* form title — only on first question */}
          {currentIndex === 0 && (
            <div className="mb-12 text-center">
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#c8e64c' }}>
                {form.title}
              </p>
              <p className="text-sm" style={{ color: '#8a9e9e' }}>
                {form.description || 'Answer a few questions to help plan the perfect trip'}
              </p>
            </div>
          )}

          {/* question card */}
          <div
            className="transition-all duration-200"
            style={{
              opacity: animating ? 0 : 1,
              transform: animating
                ? direction === 'forward' ? 'translateX(30px)' : 'translateX(-30px)'
                : 'translateX(0)'
            }}
          >
            {/* question number + text */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="font-bold"
                  style={{
                    color: '#c8e64c',
                    fontFamily: 'Bebas Neue, cursive',
                    fontSize: '18px'
                  }}
                >
                  {String(currentIndex + 1).padStart(2, '0')}
                </span>
                <div className="h-px flex-1" style={{ backgroundColor: 'rgba(200,230,76,0.2)' }} />
                {question.is_required && (
                  <span className="text-xs" style={{ color: '#c8e64c' }}>Required</span>
                )}
              </div>
              <h2
                className="text-4xl text-white leading-tight"
                style={{ fontFamily: 'Bebas Neue, cursive' }}
              >
                {question.question_text}
              </h2>
              {question.placeholder && (
                <p className="text-sm mt-2" style={{ color: '#8a9e9e' }}>
                  {question.placeholder}
                </p>
              )}
            </div>

            {/* ── ANSWER TYPES ── */}

            {/* Single choice */}
            {question.question_type === 'single_choice' && (
              <div className="flex flex-col gap-3">
                {question.options?.map((option, i) => {
                  const selected = getCurrentAnswer()?.answer_options?.includes(option)
                  return (
                    <button
                      key={i}
                      onClick={() => handleSingleChoice(option)}
                      className="flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all hover:-translate-y-0.5"
                      style={{
                        backgroundColor: selected ? 'rgba(200,230,76,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1.5px solid ${selected ? '#c8e64c' : 'rgba(255,255,255,0.08)'}`,
                        color: selected ? '#ffffff' : 'rgba(255,255,255,0.7)'
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                        style={{
                          backgroundColor: selected ? '#c8e64c' : 'rgba(255,255,255,0.06)',
                          color: selected ? '#131a1a' : '#8a9e9e',
                          fontFamily: 'Bebas Neue, cursive',
                          fontSize: '14px'
                        }}
                      >
                        {selected ? <Check size={14} /> : String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-sm font-medium">{option}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Multiple choice */}
            {question.question_type === 'multiple_choice' && (
              <div>
                <p className="text-xs mb-4" style={{ color: '#8a9e9e' }}>
                  Select all that apply
                </p>
                <div className="flex flex-wrap gap-3">
                  {question.options?.map((option, i) => {
                    const selected = getCurrentAnswer()?.answer_options?.includes(option)
                    return (
                      <button
                        key={i}
                        onClick={() => handleMultipleChoice(option)}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all hover:-translate-y-0.5"
                        style={{
                          backgroundColor: selected ? 'rgba(200,230,76,0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1.5px solid ${selected ? '#c8e64c' : 'rgba(255,255,255,0.08)'}`,
                          color: selected ? '#c8e64c' : 'rgba(255,255,255,0.6)'
                        }}
                      >
                        {selected && <Check size={13} />}
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Text */}
            {question.question_type === 'text' && (
              <textarea
                value={getCurrentAnswer()?.answer_text || ''}
                onChange={e => handleText(e.target.value)}
                placeholder={question.placeholder || 'Type your answer here...'}
                rows={4}
                className="w-full px-6 py-4 rounded-2xl text-white placeholder-white/20 outline-none text-sm resize-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                }}
              />
            )}

            {/* Scale */}
            {question.question_type === 'scale' && (
              <div>
                <div className="flex justify-between text-xs mb-3" style={{ color: '#8a9e9e' }}>
                  <span>Not at all</span>
                  <span>Extremely</span>
                </div>
                <div className="flex gap-3 justify-between">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
                    const selected = getCurrentAnswer()?.answer_options?.includes(String(n))
                    return (
                      <button
                        key={n}
                        onClick={() => handleSingleChoice(String(n))}
                        className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
                        style={{
                          backgroundColor: selected ? '#c8e64c' : 'rgba(255,255,255,0.04)',
                          border: `1.5px solid ${selected ? '#c8e64c' : 'rgba(255,255,255,0.08)'}`,
                          color: selected ? '#131a1a' : 'rgba(255,255,255,0.6)'
                        }}
                      >
                        {n}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-10 py-5 flex items-center justify-between"
        style={{
          backgroundColor: 'rgba(15,21,21,0.97)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        {/* back button */}
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-20"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#ffffff'
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* center hint */}
        <p className="text-xs" style={{ color: '#8a9e9e' }}>
          Press <span style={{ color: '#c8e64c' }}>Enter</span> to continue
        </p>

        {/* next / submit */}
        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || submitting}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
          >
            <Check size={16} />
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
          >
            Next
            <ArrowRight size={16} />
          </button>
        )}
      </div>

    </div>
  )
}