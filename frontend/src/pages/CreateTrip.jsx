import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { ArrowLeft, MapPin, Clock, Wallet, Sparkles } from 'lucide-react'

import goaImg from '../assets/destinations/goa.jpg'
import manaliImg from '../assets/destinations/manali.jpg'
import jaipurImg from '../assets/destinations/jaipur.jpg'
import keralaImg from '../assets/destinations/kerala.jpg'
import travel1 from '../assets/destinations/travel1.jpg'
import travel2 from '../assets/destinations/travel2.jpg'
import travel3 from '../assets/destinations/travel3.jpg'
import travel4 from '../assets/destinations/travel4.jpg'

const destinationImages = {
  goa: goaImg, manali: manaliImg,
  jaipur: jaipurImg, kerala: keralaImg
}

const COLLAGE_IMAGES = [
  { src: goaImg, top: '-5%', left: '-2%', width: '380px', height: '280px', rotate: '-4deg', zIndex: 1 },
  { src: manaliImg, top: '-8%', left: '20%', width: '340px', height: '360px', rotate: '3deg', zIndex: 2 },
  { src: jaipurImg, top: '-4%', left: '44%', width: '360px', height: '270px', rotate: '-2deg', zIndex: 1 },
  { src: keralaImg, top: '-6%', right: '8%', width: '320px', height: '340px', rotate: '5deg', zIndex: 2 },
  { src: travel1, top: '-3%', right: '-2%', width: '360px', height: '280px', rotate: '-3deg', zIndex: 1 },
  { src: travel2, bottom: '-5%', left: '-2%', width: '350px', height: '300px', rotate: '4deg', zIndex: 2 },
  { src: travel3, bottom: '-6%', left: '18%', width: '370px', height: '290px', rotate: '-5deg', zIndex: 1 },
  { src: travel4, bottom: '-4%', left: '42%', width: '340px', height: '320px', rotate: '3deg', zIndex: 2 },
  { src: goaImg, bottom: '-5%', right: '8%', width: '360px', height: '280px', rotate: '-2deg', zIndex: 1 },
  { src: manaliImg, bottom: '-3%', right: '-2%', width: '345px', height: '300px', rotate: '6deg', zIndex: 2 },
  { src: keralaImg, top: '32%', left: '-3%', width: '300px', height: '270px', rotate: '-3deg', zIndex: 1 },
  { src: travel1, top: '30%', right: '-3%', width: '310px', height: '280px', rotate: '4deg', zIndex: 1 },
]

export default function CreateTrip() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const destination = searchParams.get('destination')
  const duration = searchParams.get('duration')
  const budget = searchParams.get('budget')
  const isFromPackage = !!destination

  useEffect(() => {
    if (destination) {
      setName(`${destination} Trip`)
      setDescription(`${duration || ''} · ₹${Number(budget).toLocaleString() || ''}/person`)
    }
  }, [])

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
    <div
      className="min-h-screen w-full relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#0f1515' }}
    >

      {/* ── COLLAGE BACKGROUND ── */}
      {COLLAGE_IMAGES.map((img, i) => (
        <div
          key={i}
          className="absolute overflow-hidden rounded-2xl"
          style={{
            top: img.top,
            left: img.left,
            right: img.right,
            bottom: img.bottom,
            width: img.width,
            height: img.height,
            transform: `rotate(${img.rotate})`,
            zIndex: img.zIndex,
            opacity: 0.9,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}
        >
          <img
            src={img.src}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(15,21,21,0.15) 0%, rgba(15,21,21,0.45) 70%)',
          zIndex: 3
        }}
      />

      {/* back button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ 
          color: 'white', 
          zIndex: 10,
          backgroundColor: 'rgba(13,20,20,0.5)',
          backdropFilter: 'blur(8px)',
          padding: '8px 14px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <ArrowLeft size={16} />
        Dashboard
      </button>

      {/* logo */}
      <div className="absolute top-7 left-1/2 -translate-x-1/2" style={{ zIndex: 10 }}>
        <h1
          className="text-2xl tracking-widest"
          style={{ fontFamily: 'Bebas Neue, cursive', color: '#c8e64c' }}
        >
          VOYANT
        </h1>
      </div>

      {/* ── CENTERED FORM ── */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-3xl overflow-hidden"
        style={{ zIndex: 10 }}
      >
        {/* top accent bar */}
        <div
          className="h-1 w-full"
          style={{ background: 'linear-gradient(90deg, #c8e64c, rgba(200,230,76,0.2))' }}
        />

        <div
          className="p-10"
          style={{
            background: 'rgba(13, 20, 20, 0.88)',
            border: '1px solid rgba(200, 230, 76, 0.15)',
            borderTop: 'none',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
          }}
        >
          {/* package badge */}
          {isFromPackage && (
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ backgroundColor: 'rgba(200,230,76,0.1)', border: '1px solid rgba(200,230,76,0.2)' }}
              >
                <MapPin size={12} style={{ color: '#c8e64c' }} />
                <span className="text-xs font-semibold" style={{ color: '#c8e64c' }}>{destination}</span>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Clock size={12} style={{ color: '#8a9e9e' }} />
                <span className="text-xs" style={{ color: '#8a9e9e' }}>{duration}</span>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Wallet size={12} style={{ color: '#8a9e9e' }} />
                <span className="text-xs" style={{ color: '#8a9e9e' }}>₹{Number(budget).toLocaleString()}</span>
              </div>
            </div>
          )}

          <h2
            className="text-6xl text-white leading-none mb-2"
            style={{ fontFamily: 'Bebas Neue, cursive' }}
          >
            {isFromPackage ? `PLAN ${destination.toUpperCase()}` : 'CREATE TRIP'}
          </h2>
          <p className="text-sm mb-8" style={{ color: '#8a9e9e' }}>
            {isFromPackage
              ? 'Customize and create your group trip'
              : 'Name your adventure and invite your crew'}
          </p>

          {error && (
            <div
              className="mb-6 px-4 py-3 rounded-xl text-sm text-white"
              style={{ backgroundColor: 'rgba(200,60,60,0.2)', border: '1px solid rgba(200,60,60,0.4)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <div>
              <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: '#8a9e9e' }}>
                Trip Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="eg. Goa Trip 2025"
                required
                className="w-full px-5 py-4 rounded-2xl text-white placeholder-white/20 outline-none text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: '#8a9e9e' }}>
                Description
                <span className="ml-2 normal-case tracking-normal text-xs" style={{ color: '#4a5a5a' }}>
                  optional
                </span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What's the vibe? Who's coming?"
                rows={3}
                className="w-full px-5 py-4 rounded-2xl text-white placeholder-white/20 outline-none text-sm resize-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            {/* AI hint */}
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-2xl"
              style={{ backgroundColor: 'rgba(200,230,76,0.05)', border: '1px solid rgba(200,230,76,0.1)' }}
            >
              <Sparkles size={14} style={{ color: '#c8e64c' }} className="mt-0.5 shrink-0" />
              <p className="text-xs leading-relaxed" style={{ color: '#8a9e9e' }}>
                Invite your group → fill preferences → AI recommends the perfect destination
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 font-bold rounded-2xl text-sm mt-1 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
            >
              {loading ? 'Creating...' : 'Create Trip →'}
            </button>
          </form>

          <p className="text-xs mt-5 text-center" style={{ color: '#8a9e9e' }}>
            You can invite members after creating the trip
          </p>
        </div>
      </div>
    </div>
  )
}