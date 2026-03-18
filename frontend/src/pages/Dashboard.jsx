import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import emptyTravel from '../assets/empty-travel.jpg'
import { Plus, LogOut, Users, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)

  useEffect(() => { fetchTrips() }, [])

  async function fetchTrips() {
    try {
      const res = await api.get('/trips/my-trips')
      setTrips(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })
  }

  const firstName = user?.displayName?.split(' ')[0] || 'Traveller'

  const statusColor = (status) => {
    if (status === 'planning') return '#4a7c59'
    if (status === 'voting') return '#f4a261'
    if (status === 'completed') return '#2a9d8f'
    return '#4a7c59'
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a2e1a' }}>

      {/* Navbar */}
      <nav
        className="flex items-center justify-between px-10 py-4 sticky top-0 z-50"
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #d8f3dc',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}
      >
        <h1
          className="text-3xl tracking-widest"
          style={{ fontFamily: 'Bebas Neue, cursive', color: '#1a2e1a' }}
        >
          VOYANT
        </h1>
        <div className="flex items-center gap-6">
          <span className="text-sm" style={{ color: '#6b8f71' }}>
            {user?.displayName || user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: '#4a7c59' }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      <div className="px-10 py-12 max-w-7xl mx-auto">

        {/* Hero */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-sm uppercase tracking-widest mb-2" style={{ color: '#52b788' }}>
              Welcome back
            </p>
            <h2
              className="text-7xl text-white leading-none"
              style={{ fontFamily: 'Bebas Neue, cursive' }}
            >
              HELLO, {firstName.toUpperCase()}
            </h2>
            <p className="mt-3 text-lg" style={{ color: '#6b8f71' }}>
              Where are you going next?
            </p>
          </div>
          <button
            onClick={() => navigate('/trips/create')}
            className="flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-2xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#4a7c59' }}
          >
            <Plus size={20} />
            New Trip
          </button>
        </div>

        {/* Trips */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3
              className="text-3xl text-white"
              style={{ fontFamily: 'Bebas Neue, cursive' }}
            >
              YOUR TRIPS
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm mr-4" style={{ color: '#52b788' }}>
                {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
              </span>
              {trips.length > 0 && (
                <>
                  <button
                    onClick={scrollLeft}
                    className="p-2 rounded-full transition-opacity hover:opacity-70"
                    style={{ backgroundColor: '#2d4a2d', color: '#52b788' }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={scrollRight}
                    className="p-2 rounded-full transition-opacity hover:opacity-70"
                    style={{ backgroundColor: '#2d4a2d', color: '#52b788' }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div
                className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#52b788', borderTopColor: 'transparent' }}
              />
            </div>
          ) : trips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <img src={emptyTravel} alt="No trips" className="w-56 mb-8 opacity-90" />
              <h4 className="text-white text-xl font-semibold mb-2">No trips yet</h4>
              <p className="text-sm mb-8" style={{ color: '#6b8f71' }}>
                Create your first trip and invite your friends
              </p>
              <button
                onClick={() => navigate('/trips/create')}
                className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-2xl transition-opacity hover:opacity-90 text-sm"
                style={{ backgroundColor: '#4a7c59' }}
              >
                <Plus size={16} />
                Create your first trip
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* horizontal scroll container */}
              <div
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto pb-6"
                style={{
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {trips.map((trip, index) => (
                  <div
                    key={trip.id}
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    className="shrink-0 cursor-pointer"
                    style={{
                      scrollSnapAlign: 'start',
                      width: '300px',
                    }}
                  >
                    <div
                      className="rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                      style={{
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        minHeight: '280px'
                      }}
                    >
                      {/* image placeholder */}
                      <div
                        className="w-full rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden"
                        style={{
                          height: '150px',
                          backgroundColor: '#f0f7f0',
                          border: '2px dashed #d8f3dc'
                        }}
                      >
                        <span
                          className="absolute top-2 left-3 font-bold opacity-10"
                          style={{
                            color: '#4a7c59',
                            fontFamily: 'Bebas Neue, cursive',
                            fontSize: '64px',
                            lineHeight: 1
                          }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="text-center relative z-10">
                          <MapPin size={24} style={{ color: '#52b788' }} className="mx-auto mb-1" />
                          <p className="text-xs" style={{ color: '#6b8f71' }}>Trip image coming soon</p>
                        </div>
                      </div>

                      {/* trip info */}
                      <div className="flex items-start justify-between mb-2">
                        <h4
                          className="font-bold leading-tight"
                          style={{ color: '#1a2e1a', fontFamily: 'Bebas Neue, cursive', fontSize: '22px' }}
                        >
                          {trip.name.toUpperCase()}
                        </h4>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-semibold uppercase ml-2 shrink-0"
                          style={{
                            backgroundColor: statusColor(trip.status) + '22',
                            color: statusColor(trip.status),
                            border: `1px solid ${statusColor(trip.status)}44`
                          }}
                        >
                          {trip.status}
                        </span>
                      </div>

                      {trip.description && (
                        <p className="text-xs mb-3 line-clamp-2" style={{ color: '#6b8f71' }}>
                          {trip.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid #f0f7f0' }}>
                        <div className="flex items-center gap-1 text-xs" style={{ color: '#6b8f71' }}>
                          <Users size={12} />
                          <span>{trip.member_count || 1} members</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs" style={{ color: '#6b8f71' }}>
                          <Calendar size={12} />
                          <span>
                            {new Date(trip.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* add new trip card */}
                <div
                  onClick={() => navigate('/trips/create')}
                  className="shrink-0 cursor-pointer rounded-3xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                  style={{
                    width: '300px',
                    minHeight: '280px',
                    border: '2px dashed #4a7c59',
                    backgroundColor: 'rgba(74,124,89,0.08)',
                    scrollSnapAlign: 'start'
                  }}
                >
                  <Plus size={32} style={{ color: '#4a7c59' }} className="mb-3" />
                  <p className="font-semibold text-sm" style={{ color: '#4a7c59' }}>New Trip</p>
                </div>
              </div>

              {/* scroll dots */}
              <div className="flex justify-center gap-2 mt-2">
                {trips.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: i === 0 ? '#52b788' : '#2d4a2d'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}