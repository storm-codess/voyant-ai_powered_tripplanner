import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import emptyTravel from '../assets/empty-travel.jpg'
import {
  Plus, LogOut, Users, MapPin,
  Clock, Star, Bell, Heart,
  Calendar, ChevronRight, Search
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
    description: 'Sun-kissed beaches, vibrant nightlife, and Portuguese heritage. Perfect for groups seeking fun and relaxation on the coast.',
    location: 'North Goa, India'
  },
  {
    id: 2, destination: 'Manali', image: manaliImg,
    duration: '4 Days 3 Nights', price: 12999, originalPrice: 15999,
    includes: ['Hotel', 'All Meals', 'Adventure Sports'],
    rating: 4.7, reviews: 186, tag: 'Adventure',
    description: 'Snow-capped peaks, river rafting and cozy cafes. An adventurous escape into the heart of the Himalayas.',
    location: 'Himachal Pradesh, India'
  },
  {
    id: 3, destination: 'Jaipur', image: jaipurImg,
    duration: '2 Days 1 Night', price: 6999, originalPrice: 8499,
    includes: ['Hotel', 'Breakfast', 'City Tour'],
    rating: 4.6, reviews: 312, tag: 'Cultural',
    description: 'Royal palaces, majestic forts and vibrant bazaars in the Pink City. Immerse yourself in Rajasthani culture.',
    location: 'Rajasthan, India'
  },
  {
    id: 4, destination: 'Kerala', image: keralaImg,
    duration: '5 Days 4 Nights', price: 15999, originalPrice: 19999,
    includes: ['Flight', 'Houseboat', 'All Meals'],
    rating: 4.9, reviews: 428, tag: 'Nature',
    description: 'Serene backwaters, lush green hills and Ayurvedic retreats. God\'s Own Country awaits your group.',
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
  const [featuredPackage, setFeaturedPackage] = useState(PACKAGES[0])
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
        {/* left — single line heading with accent line */}
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

        {/* right — search bar aligned to page right */}
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

          {/* ── LEFT — Your Trips ── */}
          <div
            className="col-span-12 lg:col-span-4 flex flex-col"
            style={{ height: CONTENT_HEIGHT }}
          >
            {/* section header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white font-semibold text-base">Recommended</p>
                <p className="text-xs mt-0.5" style={{ color: '#8a9e9e' }}>
                  Discover handpicked trips for your group
                </p>
              </div>
              <button
                onClick={() => navigate('/trips/create')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'rgba(200,230,76,0.1)', color: '#c8e64c', border: '1px solid rgba(200,230,76,0.2)' }}
              >
                <Plus size={12} />
                New
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

            {/* trips grid — scrollable */}
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
                  <p className="text-sm mb-4" style={{ color: '#8a9e9e' }}>No trips yet</p>
                  <button
                    onClick={() => navigate('/trips/create')}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
                  >
                    Create First Trip
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {trips.map(trip => (
                    <div
                      key={trip.id}
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group"
                      style={{ height: '180px' }}
                    >
                      <img
                        src={getTripImage(trip.name)}
                        alt={trip.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                      {/* status badge */}
                      <div
                        className="absolute top-3 left-3 px-2 py-0.5 rounded-full font-bold"
                        style={{ backgroundColor: 'rgba(200,230,76,0.9)', color: '#131a1a', fontSize: '9px' }}
                      >
                        {trip.status}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <p
                          className="text-white font-bold leading-tight mb-1"
                          style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '16px' }}
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
                      height: '180px',
                      border: '2px dashed rgba(200,230,76,0.25)',
                      backgroundColor: 'rgba(200,230,76,0.04)'
                    }}
                  >
                    <div className="text-center">
                      <Plus size={28} style={{ color: '#c8e64c' }} className="mx-auto mb-2" />
                      <p className="text-sm font-semibold" style={{ color: '#c8e64c' }}>New Trip</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── MIDDLE — Popular Packages ── */}
          <div
            className="col-span-12 lg:col-span-5 flex flex-col"
            style={{ height: CONTENT_HEIGHT }}
          >
            <h3
              className="text-2xl text-white mb-5 shrink-0"
              style={{ fontFamily: 'Bebas Neue, cursive' }}
            >
              POPULAR PACKAGES
            </h3>

            <div
              className="flex flex-col gap-5 overflow-y-auto pr-2 flex-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,230,76,0.3) transparent' }}
            >
              {PACKAGES.map(pkg => (
                <div
                  key={pkg.id}
                  className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl shrink-0"
                  style={{ backgroundColor: '#1a2222', border: '1px solid rgba(255,255,255,0.06)' }}
                  onClick={() => {
                    setFeaturedPackage(pkg)
                    navigate(`/trips/create?destination=${pkg.destination}&duration=${pkg.duration}&budget=${pkg.price}`)
                  }}
                >
                  <div className="flex">
                    {/* image */}
                    <div className="relative shrink-0 overflow-hidden" style={{ width: '160px', height: '180px' }}>
                      <img
                        src={pkg.image}
                        alt={pkg.destination}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                      <div
                        className="absolute top-3 left-3 px-2 py-1 rounded-full font-bold"
                        style={{ backgroundColor: '#c8e64c', color: '#131a1a', fontSize: '10px' }}
                      >
                        {pkg.tag}
                      </div>
                    </div>

                    {/* content */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4
                            className="text-2xl text-white leading-none"
                            style={{ fontFamily: 'Bebas Neue, cursive' }}
                          >
                            {pkg.destination}
                          </h4>
                          <p className="text-xs flex items-center gap-1 mt-1" style={{ color: '#8a9e9e' }}>
                            <MapPin size={10} />
                            {pkg.location}
                          </p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="font-bold text-lg leading-none" style={{ color: '#c8e64c' }}>
                            ₹{pkg.price.toLocaleString()}
                          </p>
                          <p className="text-xs line-through mt-0.5" style={{ color: '#8a9e9e' }}>
                            ₹{pkg.originalPrice.toLocaleString()}
                          </p>
                          <p className="text-xs" style={{ color: '#8a9e9e' }}>/person</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1">
                          <Star size={11} fill="#c8e64c" color="#c8e64c" />
                          <span className="text-xs font-semibold text-white">{pkg.rating}</span>
                          <span className="text-xs" style={{ color: '#8a9e9e' }}>({pkg.reviews})</span>
                        </div>
                        <span className="text-xs flex items-center gap-1" style={{ color: '#8a9e9e' }}>
                          <Clock size={10} />
                          {pkg.duration}
                        </span>
                      </div>

                      <p
                        className="text-xs mb-4 leading-relaxed line-clamp-2"
                        style={{ color: '#8a9e9e' }}
                      >
                        {pkg.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1.5 flex-wrap">
                          {pkg.includes.map((item, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: 'rgba(200,230,76,0.08)',
                                color: '#c8e64c',
                                border: '1px solid rgba(200,230,76,0.15)',
                                fontSize: '10px'
                              }}
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                        <span
                          className="text-xs font-semibold flex items-center gap-1 shrink-0 ml-2"
                          style={{ color: '#c8e64c' }}
                        >
                          Plan this <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT — Featured ── */}
          <div
            className="col-span-12 lg:col-span-3 flex flex-col"
            style={{ height: CONTENT_HEIGHT }}
          >
            <h3
              className="text-2xl text-white mb-5 shrink-0"
              style={{ fontFamily: 'Bebas Neue, cursive' }}
            >
              FEATURED
            </h3>

            <div
              className="rounded-3xl overflow-hidden flex flex-col flex-1"
              style={{ backgroundColor: '#1a2222', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* big image */}
              <div className="relative shrink-0" style={{ height: '200px' }}>
                <img
                  src={featuredPackage.image}
                  alt={featuredPackage.destination}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  className="absolute top-4 right-4 p-2 rounded-full"
                  style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
                >
                  <Heart size={15} color="white" />
                </button>
              </div>

              {/* details */}
              <div className="p-5 flex flex-col flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <h4
                  className="text-2xl text-white leading-none mb-1"
                  style={{ fontFamily: 'Bebas Neue, cursive' }}
                >
                  {featuredPackage.destination.toUpperCase()}
                </h4>
                <p className="text-xs flex items-center gap-1 mb-4" style={{ color: '#8a9e9e' }}>
                  <MapPin size={10} />
                  {featuredPackage.location}
                </p>

                {/* member avatars */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: ['#c8e64c', '#4a9e6b', '#e64c4c'][i],
                          borderColor: '#1a2222',
                          color: '#131a1a'
                        }}
                      >
                        {['A', 'B', 'C'][i]}
                      </div>
                    ))}
                    <div
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs"
                      style={{ backgroundColor: '#2a3636', borderColor: '#1a2222', color: '#8a9e9e' }}
                    >
                      +2
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: '#8a9e9e' }}>Popular with groups</p>
                </div>

                <p className="text-xs leading-relaxed mb-4" style={{ color: '#8a9e9e' }}>
                  {featuredPackage.description}
                </p>

                {/* trip stats */}
                <div className="flex gap-2 mb-4">
                  <div
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs flex-1 justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Calendar size={11} style={{ color: '#c8e64c' }} />
                    <span className="text-white text-xs">{featuredPackage.duration.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs flex-1 justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Users size={11} style={{ color: '#c8e64c' }} />
                    <span className="text-white text-xs">2-10 pax</span>
                  </div>
                </div>

                {/* pricing */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs line-through" style={{ color: '#8a9e9e' }}>
                      ₹{featuredPackage.originalPrice.toLocaleString()}
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: '#c8e64c', fontFamily: 'Bebas Neue, cursive' }}
                    >
                      ₹{featuredPackage.price.toLocaleString()}
                      <span className="text-xs font-normal text-white/40 ml-1">/person</span>
                    </p>
                  </div>
                  <div
                    className="px-2 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: 'rgba(200,230,76,0.15)',
                      color: '#c8e64c',
                      border: '1px solid rgba(200,230,76,0.3)'
                    }}
                  >
                    {Math.round((1 - featuredPackage.price / featuredPackage.originalPrice) * 100)}% OFF
                  </div>
                </div>

                {/* action buttons */}
                <div className="flex gap-2 mt-auto">
                  <button
                    className="flex-1 py-3 rounded-2xl text-xs font-bold transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: 'rgba(200,230,76,0.1)',
                      color: '#c8e64c',
                      border: '1px solid rgba(200,230,76,0.3)'
                    }}
                    onClick={() => setFeaturedPackage(
                      PACKAGES[(PACKAGES.indexOf(featuredPackage) + 1) % PACKAGES.length]
                    )}
                  >
                    Learn more
                  </button>
                  <button
                    className="flex-1 py-3 rounded-2xl text-xs font-bold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
                    onClick={() => navigate(`/trips/create?destination=${featuredPackage.destination}&duration=${featuredPackage.duration}&budget=${featuredPackage.price}`)}
                  >
                    Plan Trip →
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}