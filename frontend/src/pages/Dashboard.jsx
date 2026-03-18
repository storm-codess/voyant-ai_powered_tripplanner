import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import emptyTravel from '../assets/empty-travel.jpg'
import {
  Plus, LogOut, Users, MapPin,
  Clock, Star, Bell, Heart,
  Calendar, ChevronRight, Search,
  Sparkles, Vote, ClipboardList,
  ArrowRight, Zap
} from 'lucide-react'

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
  jaipur: jaipurImg, kerala: keralaImg,
  shimla: travel1, ladakh: travel2,
  rishikesh: travel3, andaman: travel4,
  travel1, travel2, travel3, travel4
}
const fallbackImages = [travel1, travel2, travel3, travel4]

function getTripImage(tripName) {
  const name = tripName.toLowerCase()
  for (const key of Object.keys(destinationImages)) {
    if (name.includes(key)) return destinationImages[key]
  }
  return fallbackImages[Math.floor(Math.random() * fallbackImages.length)]
}

const PACKAGES = [
  {
    id: 1, destination: 'Goa', image: goaImg,
    duration: '3 Days 2 Nights', price: 8999, originalPrice: 10999,
    includes: ['Flight', 'Hotel', 'Breakfast'],
    rating: 4.8, reviews: 240, tag: 'Most Popular',
    description: 'Sun-kissed beaches, vibrant nightlife, and Portuguese heritage.',
    location: 'North Goa, India'
  },
  {
    id: 2, destination: 'Manali', image: manaliImg,
    duration: '4 Days 3 Nights', price: 12999, originalPrice: 15999,
    includes: ['Hotel', 'All Meals', 'Adventure Sports'],
    rating: 4.7, reviews: 186, tag: 'Adventure',
    description: 'Snow-capped peaks, river rafting and cozy cafes in the Himalayas.',
    location: 'Himachal Pradesh, India'
  },
  {
    id: 3, destination: 'Jaipur', image: jaipurImg,
    duration: '2 Days 1 Night', price: 6999, originalPrice: 8499,
    includes: ['Hotel', 'Breakfast', 'City Tour'],
    rating: 4.6, reviews: 312, tag: 'Cultural',
    description: 'Royal palaces, forts and bazaars in the Pink City.',
    location: 'Rajasthan, India'
  },
  {
    id: 4, destination: 'Kerala', image: keralaImg,
    duration: '5 Days 4 Nights', price: 15999, originalPrice: 19999,
    includes: ['Flight', 'Houseboat', 'All Meals'],
    rating: 4.9, reviews: 428, tag: 'Nature',
    description: 'Serene backwaters, lush green hills and Ayurvedic retreats.',
    location: 'Kerala, India'
  }
]

const FILTERS = ['All Tours', 'Beach', 'Mountain', 'Cultural', 'Adventure']
const CONTENT_HEIGHT = 'calc(100vh - 200px)'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All Tours')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { fetchTrips() }, [])

  async function fetchTrips() {
    try {
      const res = await api.get('/trips/my-trips')
      setTrips(res.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  const firstName = user?.displayName?.split(' ')[0] || 'Traveller'
  const activeTrip = trips[0] || null

  const statusColor = (status) => {
    if (status === 'planning') return '#c8e64c'
    if (status === 'voting') return '#f4a261'
    if (status === 'completed') return '#2a9d8f'
    return '#c8e64c'
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f1515' }}>

      {/* ── NAVBAR ── */}
      <nav
        className="flex items-center justify-between px-10 py-4 sticky top-0 z-50"
        style={{
          backgroundColor: 'rgba(15,21,21,0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <h1
          className="text-2xl tracking-widest shrink-0"
          style={{ fontFamily: 'Bebas Neue, cursive', color: '#c8e64c' }}
        >
          VOYANT
        </h1>

        <div className="hidden md:flex items-center gap-8">
          {['Home', 'Book', 'My Trips', 'Profile'].map(item => (
            <span
              key={item}
              className="text-sm cursor-pointer transition-opacity hover:opacity-80"
              style={{
                color: item === 'Home' ? '#c8e64c' : '#8a9e9e',
                borderBottom: item === 'Home' ? '2px solid #c8e64c' : 'none',
                paddingBottom: '2px'
              }}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <Bell size={18} style={{ color: '#8a9e9e' }} className="cursor-pointer hover:opacity-80" />
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer"
            style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
            onClick={handleLogout}
            title="Logout"
          >
            {firstName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm hidden md:block" style={{ color: '#8a9e9e' }}>
            {user?.displayName || firstName}
          </span>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <div
        className="px-10 py-6 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-1.5 rounded-full shrink-0"
            style={{ backgroundColor: '#c8e64c', height: '48px' }}
          />
          <h2
            className="text-5xl text-white leading-none whitespace-nowrap"
            style={{ fontFamily: 'Bebas Neue, cursive' }}
          >
            PLAN YOUR NEXT TRIP
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              width: '480px'
            }}
          >
            <Search size={16} style={{ color: '#8a9e9e' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Where we go?"
              className="bg-transparent outline-none text-sm flex-1 text-white placeholder-white/30"
            />
          </div>
          <button
            className="p-3.5 rounded-2xl transition-opacity hover:opacity-80 shrink-0"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a9e9e" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="px-10 pt-6 pb-8">
        <div className="grid grid-cols-12 gap-8">

          {/* ── LEFT — YOUR TRIPS (primary) ── */}
          <div
            className="col-span-12 lg:col-span-5 flex flex-col"
            style={{ height: CONTENT_HEIGHT }}
          >
            {/* section header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white font-semibold text-base">Your Trips</p>
                <p className="text-xs mt-0.5" style={{ color: '#8a9e9e' }}>
                  Manage and track your group adventures
                </p>
              </div>
              <button
                onClick={() => navigate('/trips/create')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
              >
                <Plus size={14} />
                New Trip
              </button>
            </div>

            {/* filter pills */}
            <div className="flex gap-2 flex-wrap mb-5">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: activeFilter === f ? '#c8e64c' : 'rgba(255,255,255,0.06)',
                    color: activeFilter === f ? '#131a1a' : '#8a9e9e',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* trips grid */}
            <div
              className="flex-1 overflow-y-auto pr-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,230,76,0.3) transparent' }}
            >
              {loading ? (
                <div className="flex justify-center py-12">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: '#c8e64c', borderTopColor: 'transparent' }}
                  />
                </div>
              ) : trips.length === 0 ? (
                <div className="text-center py-12">
                  <img src={emptyTravel} alt="No trips" className="w-32 mx-auto mb-4 opacity-60" />
                  <p className="text-sm mb-2" style={{ color: '#8a9e9e' }}>No trips yet</p>
                  <p className="text-xs mb-6" style={{ color: '#8a9e9e' }}>
                    Create a trip, invite friends, let AI recommend the best destination
                  </p>
                  <button
                    onClick={() => navigate('/trips/create')}
                    className="px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
                  >
                    Create First Trip →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {trips.map(trip => (
                    <div
                      key={trip.id}
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group"
                      style={{ height: '200px' }}
                    >
                      <img
                        src={getTripImage(trip.name)}
                        alt={trip.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                      <div
                        className="absolute top-3 left-3 px-2 py-0.5 rounded-full font-bold"
                        style={{ backgroundColor: 'rgba(200,230,76,0.9)', color: '#131a1a', fontSize: '9px' }}
                      >
                        {trip.status}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <p
                          className="text-white font-bold leading-tight mb-1"
                          style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '18px' }}
                        >
                          {trip.name.length > 14 ? trip.name.substring(0, 14) + '...' : trip.name}
                        </p>
                        <p className="text-white/50 flex items-center gap-1" style={{ fontSize: '11px' }}>
                          <Users size={9} />
                          {trip.member_count || 1} members
                        </p>
                        <p className="text-white/40 flex items-center gap-1 mt-0.5" style={{ fontSize: '11px' }}>
                          <Calendar size={9} />
                          {new Date(trip.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* new trip card */}
                  <div
                    onClick={() => navigate('/trips/create')}
                    className="relative rounded-2xl cursor-pointer flex items-center justify-center transition-all hover:opacity-80"
                    style={{
                      height: '200px',
                      border: '2px dashed rgba(200,230,76,0.25)',
                      backgroundColor: 'rgba(200,230,76,0.04)'
                    }}
                  >
                    <div className="text-center">
                      <Plus size={32} style={{ color: '#c8e64c' }} className="mx-auto mb-2" />
                      <p className="text-sm font-semibold" style={{ color: '#c8e64c' }}>New Trip</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── MIDDLE — ACTIVE TRIP + AI STATUS (primary) ── */}
          <div
            className="col-span-12 lg:col-span-4 flex flex-col gap-4"
            style={{ height: CONTENT_HEIGHT }}
          >
            <div>
              <p className="text-white font-semibold text-base">Active Trip</p>
              <p className="text-xs mt-0.5" style={{ color: '#8a9e9e' }}>
                Your current trip status and actions
              </p>
            </div>

            {!activeTrip ? (
              /* no trip — big CTA */
              <div
                className="rounded-3xl p-8 flex flex-col items-center justify-center text-center flex-1"
                style={{
                  backgroundColor: '#1a2222',
                  border: '1px solid rgba(200,230,76,0.15)'
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: 'rgba(200,230,76,0.1)', border: '1px solid rgba(200,230,76,0.2)' }}
                >
                  <Zap size={28} style={{ color: '#c8e64c' }} />
                </div>
                <h4
                  className="text-3xl text-white mb-2"
                  style={{ fontFamily: 'Bebas Neue, cursive' }}
                >
                  START PLANNING
                </h4>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: '#8a9e9e' }}>
                  Create a trip, invite your group, fill preferences and let AI recommend the perfect destination.
                </p>

                {/* steps */}
                <div className="w-full flex flex-col gap-3 mb-6">
                  {[
                    { icon: Plus, label: 'Create a trip', step: '01' },
                    { icon: Users, label: 'Invite your group', step: '02' },
                    { icon: ClipboardList, label: 'Fill preferences', step: '03' },
                    { icon: Sparkles, label: 'AI recommends', step: '04' },
                    { icon: Vote, label: 'Group votes', step: '05' },
                  ].map(({ icon: Icon, label, step }) => (
                    <div
                      key={step}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <span
                        className="text-xs font-bold shrink-0"
                        style={{ color: '#c8e64c', fontFamily: 'Bebas Neue, cursive', fontSize: '16px' }}
                      >
                        {step}
                      </span>
                      <Icon size={14} style={{ color: '#8a9e9e' }} className="shrink-0" />
                      <span className="text-sm text-white">{label}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('/trips/create')}
                  className="w-full py-4 rounded-2xl text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
                >
                  Create Your First Trip →
                </button>
              </div>
            ) : (
              /* active trip detail */
              <div className="flex flex-col gap-4 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {/* trip card */}
                <div
                  className="rounded-3xl overflow-hidden"
                  style={{ backgroundColor: '#1a2222', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="relative" style={{ height: '160px' }}>
                    <img
                      src={getTripImage(activeTrip.name)}
                      alt={activeTrip.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h4
                        className="text-3xl text-white leading-none"
                        style={{ fontFamily: 'Bebas Neue, cursive' }}
                      >
                        {activeTrip.name.toUpperCase()}
                      </h4>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: 'rgba(200,230,76,0.2)',
                          color: '#c8e64c',
                          border: '1px solid rgba(200,230,76,0.4)'
                        }}
                      >
                        {activeTrip.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <p className="text-xs mb-1" style={{ color: '#8a9e9e' }}>Members</p>
                      <p className="text-xl font-bold" style={{ color: '#c8e64c', fontFamily: 'Bebas Neue, cursive' }}>
                        {activeTrip.member_count || 1}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs mb-1" style={{ color: '#8a9e9e' }}>Created</p>
                      <p className="text-sm font-bold text-white">
                        {new Date(activeTrip.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI pipeline steps */}
                <div
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: '#1a2222', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-white font-semibold text-sm mb-4">Trip Progress</p>
                  <div className="flex flex-col gap-3">
                    {[
                      { icon: Users, label: 'Invite members', done: true },
                      { icon: ClipboardList, label: 'Fill preference form', done: false },
                      { icon: Sparkles, label: 'Generate AI recommendations', done: false },
                      { icon: Vote, label: 'Group votes on destination', done: false },
                    ].map(({ icon: Icon, label, done }, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: done ? 'rgba(200,230,76,0.2)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${done ? '#c8e64c' : 'rgba(255,255,255,0.1)'}`
                          }}
                        >
                          <Icon size={13} style={{ color: done ? '#c8e64c' : '#8a9e9e' }} />
                        </div>
                        <span
                          className="text-sm"
                          style={{ color: done ? '#ffffff' : '#8a9e9e' }}
                        >
                          {label}
                        </span>
                        {done && (
                          <span className="ml-auto text-xs" style={{ color: '#c8e64c' }}>✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* quick actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate(`/trips/${activeTrip.id}`)}
                    className="py-3 rounded-2xl text-sm font-bold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
                  >
                    Open Trip →
                  </button>
                  <button
                    onClick={() => navigate('/trips/create')}
                    className="py-3 rounded-2xl text-sm font-bold transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: 'rgba(200,230,76,0.1)',
                      color: '#c8e64c',
                      border: '1px solid rgba(200,230,76,0.3)'
                    }}
                  >
                    + New Trip
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT — POPULAR PACKAGES (secondary) ── */}
          <div
            className="col-span-12 lg:col-span-3 flex flex-col"
            style={{ height: CONTENT_HEIGHT }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-semibold text-sm">Popular Packages</p>
                <p className="text-xs mt-0.5" style={{ color: '#8a9e9e' }}>Inspiration for your next trip</p>
              </div>
            </div>

            <div
              className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,230,76,0.3) transparent' }}
            >
              {PACKAGES.map(pkg => (
                <div
                  key={pkg.id}
                  className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 group shrink-0"
                  style={{ backgroundColor: '#1a2222', border: '1px solid rgba(255,255,255,0.06)' }}
                  onClick={() => navigate(`/trips/create?destination=${pkg.destination}&duration=${pkg.duration}&budget=${pkg.price}`)}
                >
                  {/* image */}
                  <div className="relative overflow-hidden" style={{ height: '110px' }}>
                    <img
                      src={pkg.image}
                      alt={pkg.destination}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div
                      className="absolute top-2 left-2 px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: '#c8e64c', color: '#131a1a', fontSize: '9px' }}
                    >
                      {pkg.tag}
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <p className="font-bold text-sm" style={{ color: '#c8e64c' }}>
                        ₹{pkg.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* content */}
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <h4
                        className="text-base text-white leading-none"
                        style={{ fontFamily: 'Bebas Neue, cursive' }}
                      >
                        {pkg.destination}
                      </h4>
                      <div className="flex items-center gap-1">
                        <Star size={9} fill="#c8e64c" color="#c8e64c" />
                        <span className="text-xs text-white">{pkg.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs flex items-center gap-1 mb-2" style={{ color: '#8a9e9e' }}>
                      <Clock size={9} />
                      {pkg.duration}
                    </p>
                    <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: '#8a9e9e' }}>
                      {pkg.description}
                    </p>
                    <div
                      className="flex items-center justify-between pt-2"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <p className="text-xs line-through" style={{ color: '#8a9e9e' }}>
                        ₹{pkg.originalPrice.toLocaleString()}
                      </p>
                      <span
                        className="text-xs font-semibold flex items-center gap-1"
                        style={{ color: '#c8e64c' }}
                      >
                        Plan this <ChevronRight size={10} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}