import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../services/firebase'
import api from '../services/api'
import hero from '../assets/hero.jpg'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName: name })
      await api.post('/users/register', { name, email })
      navigate('/dashboard')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Email already in use')
      else if (err.code === 'auth/weak-password') setError('Password must be at least 6 characters')
      else setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
      <img src={hero} alt="background" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(15, 31, 15, 0.75)' }} />

      <div
        className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl relative z-10"
        style={{ minHeight: '580px' }}
      >
        {/* LEFT — form */}
        <div
          className="w-full lg:w-1/2 flex flex-col justify-center px-14 py-12"
          style={{ backgroundColor: '#ffffff' }}
        >
          <p className="text-sm font-bold tracking-widest mb-8" style={{ color: '#4a7c59' }}>
            VOYANT
          </p>

          <h1 className="text-5xl font-bold mb-2 leading-tight" style={{ color: '#1a2e1a' }}>
            Create your <br /> account
          </h1>
          <p className="text-sm mb-8" style={{ color: '#6b8f71' }}>
            Join Voyant and start planning together
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-white" style={{ backgroundColor: '#c0392b' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full px-5 py-4 rounded-2xl text-sm outline-none"
              style={{ backgroundColor: '#f0f7f0', border: '1.5px solid #d8f3dc', color: '#1a2e1a' }}
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-5 py-4 rounded-2xl text-sm outline-none"
              style={{ backgroundColor: '#f0f7f0', border: '1.5px solid #d8f3dc', color: '#1a2e1a' }}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              required
              className="w-full px-5 py-4 rounded-2xl text-sm outline-none"
              style={{ backgroundColor: '#f0f7f0', border: '1.5px solid #d8f3dc', color: '#1a2e1a' }}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white font-semibold rounded-2xl text-sm mt-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#4a7c59' }}
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="text-sm mt-6 text-center" style={{ color: '#6b8f71' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#4a7c59' }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* RIGHT — hero image */}
        <div className="hidden lg:block w-1/2 relative">
          <img src={hero} alt="Adventure" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(15,31,15,0.35)' }} />

          <div
            className="absolute top-10 left-10 px-5 py-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <p className="text-white/60 text-xs uppercase tracking-wider">Join</p>
            <p className="text-white font-semibold text-sm mt-1">Plan with friends</p>
          </div>

          <div
            className="absolute bottom-10 right-10 px-5 py-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <p className="text-white font-semibold text-sm">AI powered trips</p>
            <p className="text-white/60 text-xs mt-1">Vote. Decide. Travel.</p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: '#52b788' }} />
        </div>
      </div>
    </div>
  )
}