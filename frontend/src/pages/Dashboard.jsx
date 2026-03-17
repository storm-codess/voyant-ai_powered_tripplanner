import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import tripDefault from '../assets/trip-default.jpg'
import emptyTravel from '../assets/empty-travel.jpg'
import { Plus, LogOut, MapPin, Users, Calendar } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrips()
  }, [])

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

  const firstName = user?.displayName?.split(' ')[0] || 'Traveller'

  const statusColor = (status) => {
    if (status === 'planning') return '#e63946'
    if (status === 'voting') return '#f4a261'
    if (status === 'completed') return '#2a9d8f'
    return '#e63946'
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>

      {/* Navbar */}
      <nav
        className="flex items-center justify-between px-10 py-5 sticky top-0 z-50"
        style={{
          backgroundColor: 'rgba(10,10,10,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <h1
          className="text-3xl tracking-widest"
          style={{ fontFamily: 'Bebas Neue, cursive', color: '#e63946' }}
        >
          VOYANT
        </h1>

        <div className="flex items-center gap-6">
          <span className="text-white/50 text-sm">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      <div className="px-10 py-12 max-w-7xl mx-auto">

        {/* Hero section */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-white/40 text-sm uppercase tracking-widest mb-2">
              Welcome back
            </p>
            <h2
              className="text-7xl text-white leading-none"
              style={{ fontFamily: 'Bebas Neue, cursive' }}
            >
              HELLO, {firstName.toUpperCase()}
            </h2>
            <p className="text-white/40 mt-3 text-lg">
              Where are you going next?
            </p>
          </div>

          <button
            onClick={() => navigate('/trips/create')}
            className="flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-2xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#e63946' }}
          >
            <Plus size={20} />
            New Trip
          </button>
        </div>

        {/* Trips section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3
              className="text-3xl text-white"
              style={{ fontFamily: 'Bebas Neue, cursive' }}
            >
              YOUR TRIPS
            </h3>
            <span className="text-white/30 text-sm">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div
                className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#e63946', borderTopColor: 'transparent' }}
              />
            </div>
          ) : trips.length === 0 ? (
            // empty state
            <div className="flex flex-col items-center justify-center py-20">
              <img
                src={emptyTravel}
                alt="No trips"
                className="w-64 mb-8 opacity-80"
              />
              <h4 className="text-white text-xl font-semibold mb-2">
                No trips yet
              </h4>
              <p className="text-white/40 text-sm mb-8">
                Create your first trip and invite your friends
              </p>
              <button
                onClick={() => navigate('/trips/create')}
                className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-2xl transition-opacity hover:opacity-90 text-sm"
                style={{ backgroundColor: '#e63946' }}
              >
                <Plus size={16} />
                Create your first trip
              </button>
            </div>
          ) : (
            // trips grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map(trip => (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="relative rounded-3xl overflow-hidden cursor-pointer group"
                  style={{ height: '280px' }}
                >
                  {/* background image */}
                  <img
                    src={tripDefault}
                    alt={trip.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* status badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className="px-3 py-1 rounded-full text-white text-xs font-semibold uppercase tracking-wider"
                      style={{ backgroundColor: statusColor(trip.status) + '33', border: `1px solid ${statusColor(trip.status)}`, color: statusColor(trip.status) }}
                    >
                      {trip.status}
                    </span>
                  </div>

                  {/* trip info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h4
                      className="text-2xl text-white mb-3 leading-tight"
                      style={{ fontFamily: 'Bebas Neue, cursive' }}
                    >
                      {trip.name.toUpperCase()}
                    </h4>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-white/60 text-xs">
                        <Users size={12} />
                        <span>{trip.member_count || 1} members</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/60 text-xs">
                        <Calendar size={12} />
                        <span>
                          {new Date(trip.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* hover red accent */}
                  <div
                    className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-300"
                    style={{ backgroundColor: '#e63946' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}