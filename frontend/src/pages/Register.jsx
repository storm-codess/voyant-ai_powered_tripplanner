import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
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

  async function handleGoogleLogin() {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      await api.post('/users/register', {
        name: result.user.displayName,
        email: result.user.email
      }).catch(() => {})
      navigate('/dashboard')
    } catch (err) {
      setError('Google sign in failed')
    }
  }

  return (
    <div className="min-h-screen w-full relative flex">

      {/* full screen background */}
      <img src={hero} alt="Adventure" className="absolute inset-0 w-full h-full object-cover" />

      {/* dark overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(13, 20, 20, 0.50)' }} />

      {/* navbar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-12 py-6 z-10">
        <h1
          className="text-3xl tracking-widest"
          style={{ fontFamily: 'Bebas Neue, cursive', color: '#c8e64c' }}
        >
          VOYANT
        </h1>
        <Link
          to="/login"
          className="text-sm font-medium px-5 py-2 rounded-full transition-opacity hover:opacity-80"
          style={{ border: '1px solid #c8e64c', color: '#c8e64c' }}
        >
          Sign In
        </Link>
      </div>

      {/* main content */}
      <div className="relative z-10 flex w-full min-h-screen">

        {/* LEFT — big text */}
        <div className="hidden lg:flex w-1/2 flex-col justify-end px-16 pb-20">
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#c8e64c' }}>
            Join Voyant
          </p>
          <h2
            className="text-8xl text-white leading-none mb-6"
            style={{ fontFamily: 'Bebas Neue, cursive' }}
          >
            YOUR NEXT<br />TRIP<br />STARTS HERE
          </h2>
          <p className="text-white/50 text-lg max-w-sm">
            Create a group, fill preferences, let AI do the rest.
          </p>
          <div className="mt-10 h-0.5 w-16" style={{ backgroundColor: '#c8e64c' }} />
        </div>

        {/* RIGHT — form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 lg:px-16">
          <div
            className="w-full max-w-md rounded-3xl p-10"
            style={{
              background: 'rgba(13, 20, 20, 0.75)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(200, 230, 76, 0.15)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)'
            }}
          >
            <h3
              className="text-4xl text-white mb-1"
              style={{ fontFamily: 'Bebas Neue, cursive' }}
            >
              CREATE ACCOUNT
            </h3>
            <p className="text-sm mb-8" style={{ color: '#8a9e9e' }}>
              Join and start planning together
            </p>

            {error && (
              <div
                className="mb-6 px-4 py-3 rounded-xl text-sm text-white"
                style={{ backgroundColor: 'rgba(200,60,60,0.3)', border: '1px solid rgba(200,60,60,0.5)' }}
              >
                {error}
              </div>
            )}

            {/* Google button */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-medium transition-all hover:opacity-80 mb-6"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#ffffff'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Continue with Google
            </button>

            {/* divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <span className="text-xs" style={{ color: '#8a9e9e' }}>or continue with email</span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: '#8a9e9e' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-5 py-4 rounded-2xl text-white placeholder-white/20 outline-none text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: '#8a9e9e' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-5 py-4 rounded-2xl text-white placeholder-white/20 outline-none text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: '#8a9e9e' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full px-5 py-4 rounded-2xl text-white placeholder-white/20 outline-none text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 font-bold rounded-2xl text-sm mt-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
              >
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
            </form>

            <p className="text-sm mt-6 text-center" style={{ color: '#8a9e9e' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold hover:opacity-80 transition-opacity"
                style={{ color: '#c8e64c' }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}