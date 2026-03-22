import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeft, Users, ClipboardList,
  Sparkles, Vote, Plus, Send,
  CheckCircle, Clock, MapPin,
  Star, ChevronRight, Zap,
  Trophy, RefreshCw, Mail
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
}
const fallbackImages = [travel1, travel2, travel3, travel4]

function getTripImage(tripName) {
  if (!tripName) return fallbackImages[0]
  const name = tripName.toLowerCase()
  for (const key of Object.keys(destinationImages)) {
    if (name.includes(key)) return destinationImages[key]
  }
  return fallbackImages[Math.floor(Math.random() * fallbackImages.length)]
}

const TABS = [
  { id: 'members', label: 'Members', icon: Users },
  { id: 'form', label: 'Form', icon: ClipboardList },
  { id: 'recommendations', label: 'AI Recs', icon: Sparkles },
  { id: 'votes', label: 'Votes', icon: Vote },
]

export default function TripDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [trip, setTrip] = useState(null)
  const [form, setForm] = useState(null)
  const [formStatus, setFormStatus] = useState(null)
  const [recommendations, setRecommendations] = useState({})
  const [voteSessions, setVoteSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('members')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => { fetchAll() }, [id])

  async function fetchAll() {
    try {
      const [tripRes, recsRes, votesRes] = await Promise.all([
        api.get(`/trips/${id}`),
        api.get(`/recommendations/${id}`),
        api.get(`/votes/${id}/sessions`)
      ])
      setTrip(tripRes.data)
      setRecommendations(recsRes.data.recommendations_by_version || {})
      setVoteSessions(votesRes.data.sessions || [])

      try {
        const formRes = await api.get(`/forms/${id}/form`)
        setForm(formRes.data)
        const statusRes = await api.get(`/forms/${id}/status`)
        setFormStatus(statusRes.data)
      } catch {
        setForm(null)
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  async function handleInvite(e) {
    e.preventDefault()
    setInviting(true)
    setInviteMsg('')
    try {
      await api.post(`/trips/${id}/invite`, { email: inviteEmail })
      setInviteMsg('✅ Invited successfully!')
      setInviteEmail('')
      fetchAll()
    } catch (err) {
      setInviteMsg('❌ ' + (err.response?.data?.detail || 'Failed to invite'))
    }
    setInviting(false)
  }

  async function handleGenerateRecs() {
    setGenerating(true)
    try {
      await api.post(`/recommendations/${id}/generate`)
      await fetchAll()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to generate')
    }
    setGenerating(false)
  }

  async function handleSendFinalPlan() {
    try {
      await api.post(`/votes/${id}/send-final-plan`)
      alert('Final plan sent to all members!')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send')
    }
  }

  async function handleCreateForm() {
    try {
      // get templates first
      const templatesRes = await api.get('/forms/templates')
      const templates = templatesRes.data

      // use Weekend Trip template by default (first non-custom)
      const template = templates.find(t => !t.is_custom) || templates[0]

      // create form
      await api.post(`/forms/${id}/create`, {
        template_id: template.id,
        title: `${trip.name} Preferences`,
        description: 'Fill this form to help us plan the perfect trip!'
      })

      // publish immediately
      await api.post(`/forms/${id}/publish`)

      // refresh
      await fetchAll()
      alert('✅ Form created and published! Members can now fill it.')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create form')
    }
  }

  const isCreator = trip?.creator_id === user?.uid
  const totalRecs = Object.values(recommendations).flat().length

  const statusColor = (status) => {
    if (status === 'planning') return '#c8e64c'
    if (status === 'voting') return '#f4a261'
    if (status === 'completed') return '#2a9d8f'
    return '#c8e64c'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f1515' }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#c8e64c', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f1515' }}>
        <p style={{ color: '#8a9e9e' }}>Trip not found</p>
      </div>
    )
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
          className="text-2xl tracking-widest"
          style={{ fontFamily: 'Bebas Neue, cursive', color: '#c8e64c' }}
        >
          VOYANT
        </h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
          style={{ color: '#8a9e9e' }}
        >
          <ArrowLeft size={16} />
          Dashboard
        </button>
      </nav>

      {/* ── TRIP HERO ── */}
      <div className="relative" style={{ height: '220px' }}>
        <img
          src={getTripImage(trip.name)}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* trip info overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-10 pb-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                  style={{
                    backgroundColor: statusColor(trip.status) + '33',
                    color: statusColor(trip.status),
                    border: `1px solid ${statusColor(trip.status)}`
                  }}
                >
                  {trip.status}
                </span>
                <span className="text-white/40 text-xs flex items-center gap-1">
                  <Users size={10} />
                  {trip.members?.length || 1} members
                </span>
                <span className="text-white/40 text-xs flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(trip.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h2
                className="text-6xl text-white leading-none"
                style={{ fontFamily: 'Bebas Neue, cursive' }}
              >
                {trip.name.toUpperCase()}
              </h2>
              {trip.description && (
                <p className="text-white/50 text-sm mt-2">{trip.description}</p>
              )}
            </div>

            {/* quick actions */}
            <div className="flex gap-3">
              {form?.status === 'published' && !form?.already_submitted && (
                <button
                  onClick={() => navigate(`/trips/${id}/form`)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
                >
                  <ClipboardList size={15} />
                  Fill Form
                </button>
              )}
              {isCreator && (
                <button
                  onClick={handleGenerateRecs}
                  disabled={generating}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{
                    backgroundColor: 'rgba(200,230,76,0.1)',
                    border: '1px solid rgba(200,230,76,0.3)',
                    color: '#c8e64c'
                  }}
                >
                  <Sparkles size={15} />
                  {generating ? 'Generating...' : 'AI Recommend'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div
        className="px-10 sticky top-[65px] z-40"
        style={{
          backgroundColor: 'rgba(15,21,21,0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative"
              style={{ color: activeTab === tab.id ? '#c8e64c' : '#8a9e9e' }}
            >
              <tab.icon size={15} />
              {tab.label}
              {/* active indicator */}
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: '#c8e64c' }}
                />
              )}
              {/* badges */}
              {tab.id === 'recommendations' && totalRecs > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: '#c8e64c', color: '#131a1a', fontSize: '10px' }}
                >
                  {totalRecs}
                </span>
              )}
              {tab.id === 'votes' && voteSessions.length > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: '#c8e64c', color: '#131a1a', fontSize: '10px' }}
                >
                  {voteSessions.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="px-10 py-10 max-w-6xl mx-auto" style={{ minHeight: 'calc(100vh - 400px)' }}>

        {/* ── MEMBERS TAB ── */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* members list */}
            <div
              className="rounded-3xl p-6"
              style={{ backgroundColor: '#1a2222', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold">Trip Members</h3>
                <span className="text-xs" style={{ color: '#8a9e9e' }}>
                  {trip.members?.length || 1} people
                </span>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                {trip.members?.map((member, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: member.is_admin ? '#c8e64c' : 'rgba(200,230,76,0.15)', color: member.is_admin ? '#131a1a' : '#c8e64c' }}
                    >
                      {member.user_id?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{member.user_id}</p>
                      {member.is_admin && (
                        <p className="text-xs" style={{ color: '#c8e64c' }}>Creator</p>
                      )}
                    </div>
                    {member.is_admin && (
                      <Trophy size={14} style={{ color: '#c8e64c' }} />
                    )}
                  </div>
                ))}
              </div>

              {/* invite form — creator only */}
              {isCreator && (
                <div>
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#8a9e9e' }}>
                    Invite Member
                  </p>
                  <form onSubmit={handleInvite} className="flex gap-2">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder="friend@email.com"
                      required
                      className="flex-1 px-4 py-3 rounded-xl text-white placeholder-white/20 outline-none text-sm"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                    <button
                      type="submit"
                      disabled={inviting}
                      className="px-4 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
                    >
                      <Send size={16} />
                    </button>
                  </form>
                  {inviteMsg && (
                    <p className="text-xs mt-2" style={{ color: inviteMsg.startsWith('✅') ? '#2a9d8f' : '#e63946' }}>
                      {inviteMsg}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* trip progress */}
            <div
              className="rounded-3xl p-6"
              style={{ backgroundColor: '#1a2222', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h3 className="text-white font-semibold mb-6">Trip Progress</h3>
              <div className="flex flex-col gap-4">
                {[
                  { icon: Users, label: 'Members invited', done: (trip.members?.length || 1) > 1, detail: `${trip.members?.length || 1} members` },
                  { icon: ClipboardList, label: 'Form published', done: form?.status === 'published', detail: form ? form.status : 'Not created' },
                  { icon: CheckCircle, label: 'All responses collected', done: formStatus?.all_submitted, detail: formStatus ? `${formStatus.submitted_count}/${formStatus.total_members} submitted` : 'No form yet' },
                  { icon: Sparkles, label: 'AI recommendations generated', done: totalRecs > 0, detail: totalRecs > 0 ? `${totalRecs} recommendations` : 'Not generated' },
                  { icon: Vote, label: 'Voting completed', done: voteSessions.some(s => s.status === 'closed'), detail: `${voteSessions.length} sessions` },
                ].map(({ icon: Icon, label, done, detail }, i) => (
                  <div key={i} className="flex items-start gap-4">

                    {/* step number + line */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                        style={{
                          backgroundColor: done ? '#c8e64c' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${done ? '#c8e64c' : 'rgba(255,255,255,0.08)'}`,
                          color: done ? '#131a1a' : '#8a9e9e',
                          fontFamily: 'Bebas Neue, cursive',
                          fontSize: '16px'
                        }}
                      >
                        {done ? <CheckCircle size={16} color="#131a1a" /> : String(i + 1).padStart(2, '0')}
                      </div>
                      {/* connecting line */}
                      {i < 4 && (
                        <div
                          className="w-0.5 mt-1"
                          style={{
                            height: '20px',
                            backgroundColor: done ? 'rgba(200,230,76,0.3)' : 'rgba(255,255,255,0.06)'
                          }}
                        />
                      )}
                    </div>

                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <Icon size={13} style={{ color: done ? '#c8e64c' : '#8a9e9e' }} />
                        <p className="text-sm font-medium" style={{ color: done ? '#ffffff' : '#8a9e9e' }}>
                          {label}
                        </p>
                      </div>
                      <p className="text-xs mt-0.5 ml-5" style={{ color: '#4a5a5a' }}>{detail}</p>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FORM TAB ── */}
        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* form status */}
            <div
              className="rounded-3xl p-6"
              style={{ backgroundColor: '#1a2222', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h3 className="text-white font-semibold mb-6">Preference Form</h3>

              {!form ? (
                <div className="text-center py-8">
                  <ClipboardList size={40} className="mx-auto mb-4 opacity-20" color="white" />
                  <p className="text-white/30 text-sm mb-2">No form created yet</p>
                  {isCreator && (
                    <button
                      onClick={handleCreateForm}
                      className="mt-4 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold mx-auto transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
                    >
                      <Plus size={15} />
                      Create Form
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  {/* status badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                      style={{
                        backgroundColor: form.status === 'published' ? 'rgba(42,157,143,0.2)' : 'rgba(200,230,76,0.1)',
                        color: form.status === 'published' ? '#2a9d8f' : '#c8e64c',
                        border: `1px solid ${form.status === 'published' ? '#2a9d8f' : '#c8e64c'}`
                      }}
                    >
                      {form.status}
                    </span>
                    {form.already_submitted && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: '#2a9d8f' }}>
                        <CheckCircle size={12} />
                        You submitted
                      </span>
                    )}
                  </div>

                  {/* progress bar */}
                  {formStatus && (
                    <div className="mb-6">
                      <div className="flex justify-between text-xs mb-2" style={{ color: '#8a9e9e' }}>
                        <span>Responses</span>
                        <span style={{ color: '#c8e64c' }}>{formStatus.submitted_count}/{formStatus.total_members}</span>
                      </div>
                      <div className="w-full rounded-full h-2" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${(formStatus.submitted_count / formStatus.total_members) * 100}%`,
                            backgroundColor: '#c8e64c'
                          }}
                        />
                      </div>
                      {formStatus.all_submitted && (
                        <p className="text-xs mt-2 flex items-center gap-1" style={{ color: '#2a9d8f' }}>
                          <CheckCircle size={11} />
                          All members have submitted!
                        </p>
                      )}
                    </div>
                  )}

                  {/* pending members */}
                  {formStatus?.pending?.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#8a9e9e' }}>
                        Pending
                      </p>
                      <div className="flex flex-col gap-2">
                        {formStatus.pending.map((uid, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl"
                            style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                          >
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#8a9e9e' }}
                            >
                              {uid.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-xs" style={{ color: '#8a9e9e' }}>{uid}</p>
                            <Clock size={10} className="ml-auto" style={{ color: '#8a9e9e' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* fill form button */}
                  {!form.already_submitted && form.status === 'published' && (
                    <button
                      onClick={() => navigate(`/trips/${id}/form`)}
                      className="w-full py-3 rounded-2xl text-sm font-bold transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
                    >
                      Fill Form →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* form questions preview */}
            <div
              className="rounded-3xl p-6"
              style={{ backgroundColor: '#1a2222', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h3 className="text-white font-semibold mb-6">Form Questions</h3>
              {!form ? (
                <div className="text-center py-8">
                  <p className="text-white/20 text-sm">No form yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: '400px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,230,76,0.3) transparent' }}>
                  {form.questions?.map((q, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 rounded-2xl"
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="text-xs font-bold shrink-0 mt-0.5"
                          style={{ color: '#c8e64c', fontFamily: 'Bebas Neue, cursive', fontSize: '14px' }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <p className="text-white text-sm">{q.question_text}</p>
                          <p className="text-xs mt-1" style={{ color: '#8a9e9e' }}>
                            {q.question_type.replace('_', ' ')}
                            {q.is_required && <span style={{ color: '#c8e64c' }}> · required</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RECOMMENDATIONS TAB ── */}
        {activeTab === 'recommendations' && (
          <div>
            {/* generate button */}
            {isCreator && (
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-white font-semibold">AI Recommendations</p>
                  <p className="text-xs mt-0.5" style={{ color: '#8a9e9e' }}>
                    {totalRecs > 0 ? `${totalRecs} destinations generated` : 'Generate destinations based on group preferences'}
                  </p>
                </div>
                <button
                  onClick={handleGenerateRecs}
                  disabled={generating}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
                >
                  {generating ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Sparkles size={15} />
                  )}
                  {generating ? 'Generating...' : totalRecs > 0 ? 'Generate More' : 'Generate'}
                </button>
              </div>
            )}

            {Object.keys(recommendations).length === 0 ? (
              <div
                className="rounded-3xl p-12 text-center"
                style={{ backgroundColor: '#1a2222', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Sparkles size={40} className="mx-auto mb-4 opacity-20" color="white" />
                <p className="text-white/30 text-sm mb-2">No recommendations yet</p>
                <p className="text-white/20 text-xs">
                  Make sure all members fill the preference form first
                </p>
              </div>
            ) : (
              Object.entries(recommendations).map(([version, recs]) => (
                <div key={version} className="mb-8">
                  <p
                    className="text-xs uppercase tracking-widest mb-4"
                    style={{ color: '#8a9e9e' }}
                  >
                    Generation {version}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recs.map((rec, i) => (
                      <div
                        key={i}
                        className="rounded-3xl overflow-hidden"
                        style={{ backgroundColor: '#1a2222', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        {/* destination image */}
                        <div className="relative" style={{ height: '140px' }}>
                          <img
                            src={getTripImage(rec.destination)}
                            alt={rec.destination}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-4">
                            <h4
                              className="text-2xl text-white leading-none"
                              style={{ fontFamily: 'Bebas Neue, cursive' }}
                            >
                              {rec.destination.toUpperCase()}
                            </h4>
                          </div>
                        </div>

                        <div className="p-5">
                          <p className="text-xs mb-4 leading-relaxed" style={{ color: '#8a9e9e' }}>
                            {rec.reasoning}
                          </p>

                          {/* activities */}
                          {rec.activities && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {rec.activities.slice(0, 3).map((a, j) => (
                                <span
                                  key={j}
                                  className="px-2 py-1 rounded-full text-xs"
                                  style={{
                                    backgroundColor: 'rgba(200,230,76,0.08)',
                                    color: '#c8e64c',
                                    border: '1px solid rgba(200,230,76,0.15)',
                                    fontSize: '10px'
                                  }}
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* budget */}
                          {rec.estimated_budget && (
                            <div
                              className="px-3 py-2 rounded-xl text-xs"
                              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                            >
                              <p style={{ color: '#8a9e9e' }}>
                                🏨 {rec.estimated_budget.hotel_per_night}
                              </p>
                              <p className="mt-0.5" style={{ color: '#8a9e9e' }}>
                                ✈️ {rec.estimated_budget.transport_from_major_city}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── VOTES TAB ── */}
        {activeTab === 'votes' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white font-semibold">Vote Sessions</p>
                <p className="text-xs mt-0.5" style={{ color: '#8a9e9e' }}>
                  Group decisions on trip details
                </p>
              </div>
              <div className="flex gap-3">
                {voteSessions.some(s => s.status === 'closed') && isCreator && (
                  <button
                    onClick={handleSendFinalPlan}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: 'rgba(42,157,143,0.15)',
                      color: '#2a9d8f',
                      border: '1px solid rgba(42,157,143,0.3)'
                    }}
                  >
                    <Mail size={14} />
                    Send Final Plan
                  </button>
                )}
                {isCreator && (
                  <button
                    onClick={() => navigate(`/trips/${id}/vote`)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
                  >
                    <Plus size={14} />
                    New Vote
                  </button>
                )}
              </div>
            </div>

            {voteSessions.length === 0 ? (
              <div
                className="rounded-3xl p-12 text-center"
                style={{ backgroundColor: '#1a2222', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Vote size={40} className="mx-auto mb-4 opacity-20" color="white" />
                <p className="text-white/30 text-sm mb-2">No vote sessions yet</p>
                {isCreator && (
                  <button
                    onClick={() => navigate(`/trips/${id}/vote`)}
                    className="mt-4 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold mx-auto transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
                  >
                    <Plus size={15} />
                    Create First Vote
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {voteSessions.map(session => (
                  <div
                    key={session.session_id}
                    className="rounded-3xl p-6"
                    style={{ backgroundColor: '#1a2222', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <h4 className="text-white font-semibold text-base">{session.title}</h4>
                        {session.description && (
                          <p className="text-xs mt-1" style={{ color: '#8a9e9e' }}>{session.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs" style={{ color: '#8a9e9e' }}>
                            {sum(session.vote_counts)} votes
                          </span>
                          {session.deadline && (
                            <span className="text-xs flex items-center gap-1" style={{ color: '#8a9e9e' }}>
                              <Clock size={9} />
                              {new Date(session.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                        style={{
                          backgroundColor: session.status === 'closed' ? 'rgba(42,157,143,0.2)' : 'rgba(200,230,76,0.1)',
                          color: session.status === 'closed' ? '#2a9d8f' : '#c8e64c',
                          border: `1px solid ${session.status === 'closed' ? '#2a9d8f' : '#c8e64c'}`
                        }}
                      >
                        {session.status}
                      </span>
                    </div>

                    {/* options */}
                    <div className="flex flex-col gap-2 mb-4">
                      {session.options?.map(option => {
                        const totalVotes = sum(session.vote_counts)
                        const optionVotes = option.votes || 0
                        const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0
                        const isWinner = option.id === session.winner_option_id
                        const isUserVote = option.id === session.user_voted

                        return (
                          <div
                            key={option.id}
                            className="px-4 py-3 rounded-2xl"
                            style={{
                              backgroundColor: isWinner ? 'rgba(42,157,143,0.1)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${isWinner ? 'rgba(42,157,143,0.4)' : isUserVote ? 'rgba(200,230,76,0.3)' : 'rgba(255,255,255,0.06)'}`
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-white text-sm">{option.text}</span>
                                {isWinner && <Trophy size={12} style={{ color: '#2a9d8f' }} />}
                                {isUserVote && !isWinner && (
                                  <span className="text-xs" style={{ color: '#c8e64c' }}>✓ Your vote</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs" style={{ color: '#8a9e9e' }}>
                                  {optionVotes} votes
                                </span>
                                {session.status === 'open' && !isUserVote && (
                                  <button
                                    onClick={async () => {
                                      await api.post(`/votes/${id}/cast`, { option_id: option.id })
                                      fetchAll()
                                    }}
                                    className="px-3 py-1 rounded-lg text-xs font-bold transition-opacity hover:opacity-90"
                                    style={{ backgroundColor: '#c8e64c', color: '#131a1a' }}
                                  >
                                    Vote
                                  </button>
                                )}
                              </div>
                            </div>
                            {/* progress bar */}
                            <div className="w-full rounded-full h-1" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                              <div
                                className="h-1 rounded-full transition-all"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: isWinner ? '#2a9d8f' : '#c8e64c'
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* close button */}
                    {isCreator && session.status !== 'closed' && (
                      <button
                        onClick={async () => {
                          await api.post(`/votes/${id}/close/${session.session_id}`)
                          fetchAll()
                        }}
                        className="px-4 py-2 text-xs font-bold rounded-xl transition-opacity hover:opacity-80"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#8a9e9e'
                        }}
                      >
                        Close Voting
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

// helper
function sum(obj) {
  if (!obj) return 0
  return Object.values(obj).reduce((a, b) => a + b, 0)
}