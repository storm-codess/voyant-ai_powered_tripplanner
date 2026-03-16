import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../services/firebase'
import hero from '../assets/hero.jpg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 relative"
    >
      {/* full screen background */}
      <img
        src={hero}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* card */}
      <div
        className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl relative z-10"
        style={{ minHeight: '640px' }}
      >
        {/* LEFT — form glass */}
        <div
          className="w-full lg:w-1/2 flex flex-col justify-center px-14 py-16"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRight: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* logo */}
          <p
            className="text-sm font-semibold tracking-widest mb-10"
            style={{ color: '#e63946' }}
          >
            VOYANT
          </p>

          <h1
            className="text-5xl font-bold text-white mb-2 leading-tight"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Start your <br /> perfect trip
          </h1>

          <p className="text-white/50 text-sm mb-10">
            Sign in to plan your next adventure
          </p>

          {error && (
            <div
              className="mb-6 px-4 py-3 rounded-xl text-sm text-white"
              style={{ backgroundColor: '#e63946aa' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-5 py-4 rounded-2xl text-white placeholder-white/30 outline-none text-sm"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)'
              }}
            />

            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-5 py-4 rounded-2xl text-white placeholder-white/30 outline-none text-sm"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)'
              }}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white font-semibold rounded-2xl text-sm mt-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#e63946' }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-white/40 text-sm mt-8 text-center">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold hover:opacity-80 transition-opacity"
              style={{ color: '#e63946' }}
            >
              Register
            </Link>
          </p>
        </div>

        {/* RIGHT — hero image */}
        <div className="hidden lg:block w-1/2 relative">
          <img
            src={hero}
            alt="Adventure"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />

          {/* floating card top left */}
          <div
            className="absolute top-10 left-10 px-5 py-4 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
          >
            <p className="text-white/60 text-xs uppercase tracking-wider">Destination</p>
            <p className="text-white font-semibold text-sm mt-1">Explore Together</p>
          </div>

          {/* floating card bottom right */}
          <div
            className="absolute bottom-10 right-10 px-5 py-4 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
          >
            <p className="text-white font-semibold text-sm">Plan as a group</p>
            <p className="text-white/60 text-xs mt-1">AI powered decisions</p>
          </div>

          {/* bottom red accent */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ backgroundColor: '#e63946' }}
          />
        </div>
      </div>
    </div>
  )
}