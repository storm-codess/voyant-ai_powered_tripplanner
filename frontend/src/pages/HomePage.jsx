import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import homeHero from '../assets/home-hero.png'
import goaImg from '../assets/destinations/goa.jpg'
import manaliImg from '../assets/destinations/manali.jpg'
import jaipurImg from '../assets/destinations/jaipur.jpg'
import keralaImg from '../assets/destinations/kerala.jpg'
import {
  Users, Sparkles, Vote, Mail,
  MapPin, ArrowRight, ChevronDown,
  Star, Shield, Zap
} from 'lucide-react'

const STEPS = [
  { number: '01', title: 'Create a Trip', desc: 'Name your adventure and set it up in seconds.' },
  { number: '02', title: 'Invite Your Group', desc: 'Add friends via email. Everyone joins instantly.' },
  { number: '03', title: 'Fill Preferences', desc: 'Each member fills a smart preference form independently.' },
  { number: '04', title: 'AI Recommends', desc: 'Our AI analyzes everyone\'s preferences and suggests the best destinations.' },
  { number: '05', title: 'Group Votes', desc: 'Everyone votes on destinations, hotels and activities. Majority wins.' },
]

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Powered',
    desc: 'Smart recommendations based on your entire group\'s preferences. No more endless debates.'
  },
  {
    icon: Vote,
    title: 'Group Voting',
    desc: 'Democratic trip planning. Create vote sessions, cast votes, tie goes to revote then random.'
  },
  {
    icon: Users,
    title: 'Group Forms',
    desc: 'Customizable preference forms with 5 templates. Adventure, Cultural, Party, Weekend and more.'
  },
  {
    icon: Mail,
    title: 'Email Notifications',
    desc: 'Trip invites and final plans delivered straight to everyone\'s inbox automatically.'
  },
  {
    icon: Shield,
    title: 'Secure Auth',
    desc: 'Firebase powered authentication. Sign in with Google or email. Safe and fast.'
  },
  {
    icon: Zap,
    title: 'Model Gateway',
    desc: 'Groq LLaMA → Mixtral → Gemini fallback chain. AI never goes down.'
  },
]

const DESTINATIONS = [
  { name: 'Goa', img: goaImg, tag: 'Beach · Party', price: '₹8,999' },
  { name: 'Manali', img: manaliImg, tag: 'Adventure · Snow', price: '₹12,999' },
  { name: 'Jaipur', img: jaipurImg, tag: 'Cultural · Heritage', price: '₹6,999' },
  { name: 'Kerala', img: keralaImg, tag: 'Nature · Backwaters', price: '₹15,999' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ backgroundColor: '#0f1515', color: '#ffffff' }}>

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 grid grid-cols-3 items-center px-12 py-5 transition-all"
        style={{
          backgroundColor: scrolled ? 'rgba(15,21,21,0.97)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none'
        }}
      >
        {/* logo */}
        <h1
          className="text-2xl tracking-widest"
          style={{ fontFamily: 'Bebas Neue, cursive', color: '#c8e64c' }}
        >
          VOYANT
        </h1>

        {/* nav links center */}
        <div className="hidden md:flex items-center justify-center gap-9">
          {['How it Works', 'Features', 'Destinations'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm transition-opacity hover:opacity-80"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {item}
            </a>
          ))}
        </div>

        {/* auth buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-5 py-2 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
          >
            Register
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex items-end pb-16" style={{ paddingTop: '80px' }}>

        {/* hero image */}
        <img
          src={homeHero}
          alt="Adventure"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* overlay — darker at bottom where text is */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(15,21,21,0.85) 0%, rgba(15,21,21,0.35) 50%, rgba(15,21,21,0.1) 100%)'
          }}
        />

        {/* content — bottom left */}
        <div className="relative z-10 w-full" style={{ paddingLeft: '80px', paddingRight: '80px' }}>
          <div>
            <div style={{ maxWidth: '580px' }}>

              {/* social proof badge */}
              <div
                className="flex items-center gap-3 px-4 py-2 rounded-full w-fit mb-5"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.12)'
                }}
              >
                <div className="flex -space-x-2">
                  {['A', 'B', 'C'].map((l, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border flex items-center justify-center font-bold"
                      style={{
                        backgroundColor: ['#c8e64c', '#4a9e6b', '#e64c7a'][i],
                        borderColor: 'rgba(0,0,0,0.3)',
                        color: '#131a1a',
                        fontSize: '8px'
                      }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={9} fill="#c8e64c" color="#c8e64c" />
                  ))}
                </div>
                <p className="text-xs text-white/70">
                  Trusted by <span style={{ color: '#c8e64c' }}>500+</span> travelers
                </p>
              </div>

              {/* headline */}
              <h2
                className="text-8xl text-white leading-none mb-5"
                style={{ fontFamily: 'Bebas Neue, cursive' }}
              >
                PLAN YOUR GROUP
                <br />
                <span style={{ color: '#c8e64c' }}>ADVENTURE</span>
              </h2>

              {/* subtext */}
              <p
                className="text-base mb-7 leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '420px' }}
              >
                Let AI analyze your group's preferences and recommend the perfect destination. Everyone votes. Best trip wins.
              </p>

              {/* CTAs */}
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-105 hover:shadow-lg"
                  style={{
                    backgroundColor: '#c8e64c',
                    color: '#131a1a',
                    boxShadow: '0 4px 20px rgba(200, 230, 76, 0.3)'
                  }}
                >
                  Start Planning Free
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.12)'
                  }}
                >
                  See How It Works
                </button>
              </div>

              {/* feature pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {['AI Recommendations', 'Group Voting', 'Smart Forms', 'Email Alerts'].map(f => (
                  <span
                    key={f}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)'
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* scroll indicator — bottom right */}
        <div
          className="absolute bottom-8 right-12 flex flex-col items-center gap-2 animate-bounce"
          style={{ zIndex: 10 }}
        >
          <ChevronDown size={20} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Scroll</p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how-it-works"
        className="py-24 px-12"
        style={{ backgroundColor: '#131a1a' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#c8e64c' }}>
              Simple Process
            </p>
            <h3
              className="text-6xl text-white"
              style={{ fontFamily: 'Bebas Neue, cursive' }}
            >
              HOW IT WORKS
            </h3>
            <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: '#8a9e9e' }}>
              From idea to final plan in 5 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="relative">
                {/* connector line */}
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute top-8 left-full w-full h-px hidden md:block"
                    style={{ backgroundColor: 'rgba(200,230,76,0.2)', zIndex: 0 }}
                  />
                )}

                <div
                  className="relative z-10 rounded-2xl p-5 h-full transition-all hover:-translate-y-1"
                  style={{
                    backgroundColor: '#1a2222',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  {/* number */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 font-bold"
                    style={{
                      backgroundColor: 'rgba(200,230,76,0.1)',
                      border: '1px solid rgba(200,230,76,0.2)',
                      color: '#c8e64c',
                      fontFamily: 'Bebas Neue, cursive',
                      fontSize: '22px'
                    }}
                  >
                    {step.number}
                  </div>
                  <h4 className="text-white font-bold mb-2 text-sm">{step.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: '#8a9e9e' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="features"
        className="py-24 px-12"
        style={{ backgroundColor: '#0f1515' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#c8e64c' }}>
              Why Voyant
            </p>
            <h3
              className="text-6xl text-white"
              style={{ fontFamily: 'Bebas Neue, cursive' }}
            >
              BUILT FOR GROUPS
            </h3>
            <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: '#8a9e9e' }}>
              Every feature designed for group travel decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 transition-all hover:-translate-y-1"
                style={{
                  backgroundColor: '#1a2222',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    backgroundColor: 'rgba(200,230,76,0.1)',
                    border: '1px solid rgba(200,230,76,0.2)'
                  }}
                >
                  <feature.icon size={20} style={{ color: '#c8e64c' }} />
                </div>
                <h4 className="text-white font-bold mb-2">{feature.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: '#8a9e9e' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ── */}
      <section
        id="destinations"
        className="py-24 px-12"
        style={{ backgroundColor: '#131a1a' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#c8e64c' }}>
                Popular
              </p>
              <h3
                className="text-6xl text-white leading-none"
                style={{ fontFamily: 'Bebas Neue, cursive' }}
              >
                TOP DESTINATIONS
              </h3>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: '#c8e64c' }}
            >
              View all <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DESTINATIONS.map((dest, i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden cursor-pointer group"
                style={{ height: '280px' }}
                onClick={() => navigate('/register')}
              >
                <img
                  src={dest.img}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div
                  className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: '#c8e64c', color: '#131a1a', fontSize: '10px' }}
                >
                  {dest.price}/person
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h4
                    className="text-2xl text-white leading-none mb-1"
                    style={{ fontFamily: 'Bebas Neue, cursive' }}
                  >
                    {dest.name.toUpperCase()}
                  </h4>
                  <p className="text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <MapPin size={9} />
                    {dest.tag}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section
        className="py-24 px-12 relative overflow-hidden"
        style={{ backgroundColor: '#0f1515' }}
      >
        {/* subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(200,230,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(200,230,76,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        {/* subtle top and bottom fade */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, #0f1515 0%, transparent 20%, transparent 80%, #0f1515 100%)'
          }}
        />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#c8e64c' }}>
            Ready to go?
          </p>
          <h3
            className="text-7xl text-white leading-none mb-6"
            style={{ fontFamily: 'Bebas Neue, cursive' }}
          >
            START YOUR<br />ADVENTURE
          </h3>
          <p className="text-base mb-10 leading-relaxed" style={{ color: '#8a9e9e' }}>
            Join thousands of groups who plan smarter trips with Voyant.
            Free to use. No credit card required.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-base transition-opacity hover:opacity-90 mx-auto"
            style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
          >
            Create Your First Trip
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="px-12 py-8"
        style={{
          backgroundColor: '#131a1a',
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1
            className="text-2xl tracking-widest"
            style={{ fontFamily: 'Bebas Neue, cursive', color: '#c8e64c' }}
          >
            VOYANT
          </h1>
          <p className="text-xs" style={{ color: '#4a5a5a' }}>
            © 2025 Voyant. Plan Together. Travel Better.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact'].map(item => (
              <span
                key={item}
                className="text-xs cursor-pointer transition-opacity hover:opacity-80"
                style={{ color: '#8a9e9e' }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}