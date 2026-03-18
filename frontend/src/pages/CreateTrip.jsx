import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { ArrowLeft } from 'lucide-react'

export default function CreateTrip() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleCreate(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/trips/create', { name, description })
      navigate(`/trips/${res.data.trip_id}`)
    } catch (err) {
      setError('Failed to create trip. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#1a2e1a' }}>

      {/* back button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: '#52b788' }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* card */}
      <div
        className="w-full max-w-md rounded-3xl p-10"
        style={{ backgroundColor: '#ffffff', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
      >
        <p className="text-sm font-bold tracking-widest mb-8" style={{ color: '#4a7c59' }}>
          VOYANT
        </p>

        <h1 className="text-5xl font-bold mb-2 leading-tight" style={{ color: '#1a2e1a', fontFamily: 'Bebas Neue, cursive' }}>
          NEW TRIP
        </h1>
        <p className="text-sm mb-8" style={{ color: '#6b8f71' }}>
          Name your adventure and invite your crew
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-white" style={{ backgroundColor: '#c0392b' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: '#6b8f71' }}>
              Trip Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="eg. Goa Trip 2025"
              required
              className="w-full px-5 py-4 rounded-2xl text-sm outline-none"
              style={{ backgroundColor: '#f0f7f0', border: '1.5px solid #d8f3dc', color: '#1a2e1a' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: '#6b8f71' }}>
              Description <span style={{ color: '#b0c4b0' }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's the vibe? Who's coming?"
              rows={3}
              className="w-full px-5 py-4 rounded-2xl text-sm outline-none resize-none"
              style={{ backgroundColor: '#f0f7f0', border: '1.5px solid #d8f3dc', color: '#1a2e1a' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white font-semibold rounded-2xl text-sm mt-2 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#4a7c59' }}
          >
            {loading ? 'Creating...' : 'Create Trip →'}
          </button>
        </form>
      </div>
    </div>
  )
}