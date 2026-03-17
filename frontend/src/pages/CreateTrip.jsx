import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import hero from '../assets/hero.jpg'
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
    <div className="min-h-screen flex items-center justify-center p-6 relative" style={{ backgroundColor: '#0a0a0a' }}>
      
      {/* background */}
      <img src={hero} alt="background" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60" />

      {/* back button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors z-10 text-sm"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {/* card */}
      <div
        className="w-full max-w-lg relative z-10 rounded-3xl p-10"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* logo */}
        <p
          className="text-sm font-semibold tracking-widest mb-8"
          style={{ color: '#e63946' }}
        >
          VOYANT
        </p>

        <h1
          className="text-5xl text-white mb-2 leading-tight"
          style={{ fontFamily: 'Bebas Neue, cursive' }}
        >
          CREATE A <br /> NEW TRIP
        </h1>
        <p className="text-white/50 text-sm mb-10">
          Name your adventure and invite your crew
        </p>

        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-xl text-sm text-white"
            style={{ backgroundColor: '#e63946aa' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block">
              Trip Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="eg. Goa Trip 2025"
              required
              className="w-full px-5 py-4 rounded-2xl text-white placeholder-white/20 outline-none text-sm"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            />
          </div>

          <div>
            <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block">
              Description <span className="text-white/30">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's the vibe? Who's coming?"
              rows={3}
              className="w-full px-5 py-4 rounded-2xl text-white placeholder-white/20 outline-none text-sm resize-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white font-semibold rounded-2xl text-sm mt-2 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#e63946' }}
          >
            {loading ? 'Creating...' : 'Create Trip →'}
          </button>
        </form>
      </div>
    </div>
  )
}