import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeft, Users, Plus, Send,
  ClipboardList, Sparkles, Vote,
  CheckCircle, Clock, Mail
} from 'lucide-react'

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
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAll()
  }, [id])

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

      // get form if exists
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
    try {
      await api.post(`/recommendations/${id}/generate`)
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to generate recommendations')
    }
  }

  const isCreator = trip?.creator_id === user?.uid

  const statusColor = (status) => {
    if (status === 'planning') return '#e63946'
    if (status === 'voting') return '#f4a261'
    if (status === 'completed') return '#2a9d8f'
    return '#e63946'
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ClipboardList },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
    { id: 'votes', label: 'Votes', icon: Vote },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#e63946', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <p className="text-white/50">Trip not found</p>
      </div>
    )
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
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Dashboard
        </button>
      </nav>

      <div className="px-10 py-10 max-w-6xl mx-auto">

        {/* Trip header */}
        <div className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <h2
                className="text-6xl text-white leading-none mb-3"
                style={{ fontFamily: 'Bebas Neue, cursive' }}
              >
                {trip.name.toUpperCase()}
              </h2>
              {trip.description && (
                <p className="text-white/40 text-sm mb-4">{trip.description}</p>
              )}
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: statusColor(trip.status) + '22',
                  border: `1px solid ${statusColor(trip.status)}`,
                  color: statusColor(trip.status)
                }}
              >
                {trip.status}
              </span>
            </div>

            {/* action buttons */}
            <div className="flex gap-3">
              {form?.status === 'published' && !form?.already_submitted && (
                <button
                  onClick={() => navigate(`/trips/${id}/form`)}
                  className="flex items-center gap-2 px-5 py-3 text-white text-sm font-semibold rounded-2xl transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#e63946' }}
                >
                  <ClipboardList size={16} />
                  Fill Form
                </button>
              )}
              {isCreator && (
                <button
                  onClick={handleGenerateRecs}
                  className="flex items-center gap-2 px-5 py-3 text-white text-sm font-semibold rounded-2xl transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                >
                  <Sparkles size={16} />
                  Generate AI Recs
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-2xl w-fit" style={{ backgroundColor: '#1a1a1a' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? '#e63946' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'rgba(255,255,255,0.4)'
              }}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Members card */}
            <div className="rounded-3xl p-6" style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a' }}>
              <div className="flex items-center gap-2 mb-6">
                <Users size={18} style={{ color: '#e63946' }} />
                <h3 className="text-white font-semibold">Members</h3>
                <span className="text-white/30 text-xs ml-auto">{trip.members?.length || 0} people</span>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                {trip.members?.map((member, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: '#e63946' }}
                    >
                      {member.user_id?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm">{member.user_id}</p>
                      {member.is_admin && (
                        <p className="text-white/30 text-xs">Creator</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* invite form — creator only */}
              {isCreator && (
                <form onSubmit={handleInvite} className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="Invite by email"
                    required
                    className="flex-1 px-4 py-3 rounded-xl text-white placeholder-white/20 outline-none text-sm"
                    style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                  />
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-4 py-3 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#e63946' }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              )}
              {inviteMsg && (
                <p className="text-xs mt-2" style={{ color: inviteMsg.startsWith('✅') ? '#2a9d8f' : '#e63946' }}>
                  {inviteMsg}
                </p>
              )}
            </div>

            {/* Form status card */}
            <div className="rounded-3xl p-6" style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a' }}>
              <div className="flex items-center gap-2 mb-6">
                <ClipboardList size={18} style={{ color: '#e63946' }} />
                <h3 className="text-white font-semibold">Preference Form</h3>
              </div>

              {!form ? (
                <div className="text-center py-8">
                  <p className="text-white/30 text-sm mb-4">No form created yet</p>
                  {isCreator && (
                    <button
                      onClick={() => navigate(`/trips/${id}/form`)}
                      className="flex items-center gap-2 px-5 py-3 text-white text-sm font-semibold rounded-2xl mx-auto transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#e63946' }}
                    >
                      <Plus size={16} />
                      Create Form
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold uppercase"
                      style={{
                        backgroundColor: form.status === 'published' ? '#2a9d8f22' : '#e6394622',
                        color: form.status === 'published' ? '#2a9d8f' : '#e63946',
                        border: `1px solid ${form.status === 'published' ? '#2a9d8f' : '#e63946'}`
                      }}
                    >
                      {form.status}
                    </span>
                    {form.already_submitted && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: '#2a9d8f' }}>
                        <CheckCircle size={12} />
                        Submitted
                      </span>
                    )}
                  </div>

                  {formStatus && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-white/40 mb-2">
                        <span>Responses</span>
                        <span>{formStatus.submitted_count}/{formStatus.total_members}</span>
                      </div>
                      <div className="w-full rounded-full h-2" style={{ backgroundColor: '#1a1a1a' }}>
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${(formStatus.submitted_count / formStatus.total_members) * 100}%`,
                            backgroundColor: '#e63946'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {!form.already_submitted && form.status === 'published' && (
                    <button
                      onClick={() => navigate(`/trips/${id}/form`)}
                      className="w-full py-3 text-white text-sm font-semibold rounded-2xl transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#e63946' }}
                    >
                      Fill Form →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS TAB */}
        {activeTab === 'recommendations' && (
          <div>
            {Object.keys(recommendations).length === 0 ? (
              <div className="text-center py-20">
                <Sparkles size={40} className="mx-auto mb-4 opacity-20" color="white" />
                <p className="text-white/30 text-sm mb-2">No recommendations yet</p>
                <p className="text-white/20 text-xs">Make sure all members fill the form first</p>
                {isCreator && (
                  <button
                    onClick={handleGenerateRecs}
                    className="mt-6 flex items-center gap-2 px-6 py-3 text-white text-sm font-semibold rounded-2xl mx-auto transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#e63946' }}
                  >
                    <Sparkles size={16} />
                    Generate Recommendations
                  </button>
                )}
              </div>
            ) : (
              Object.entries(recommendations).map(([version, recs]) => (
                <div key={version} className="mb-10">
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-4">
                    Generation {version}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recs.map((rec, i) => (
                      <div
                        key={i}
                        className="rounded-3xl p-6"
                        style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a' }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4
                            className="text-2xl text-white"
                            style={{ fontFamily: 'Bebas Neue, cursive' }}
                          >
                            {rec.destination.toUpperCase()}
                          </h4>
                        </div>
                        <p className="text-white/50 text-xs mb-4 leading-relaxed">
                          {rec.reasoning}
                        </p>
                        {rec.activities && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {rec.activities.slice(0, 3).map((a, j) => (
                              <span
                                key={j}
                                className="px-2 py-1 rounded-full text-xs"
                                style={{ backgroundColor: '#e6394622', color: '#e63946', border: '1px solid #e6394644' }}
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                        {rec.estimated_budget && (
                          <div className="text-xs text-white/30">
                            <p>🏨 {rec.estimated_budget.hotel_per_night}</p>
                            <p>✈️ {rec.estimated_budget.transport_from_major_city}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* VOTES TAB */}
        {activeTab === 'votes' && (
          <div>
            {voteSessions.length === 0 ? (
              <div className="text-center py-20">
                <Vote size={40} className="mx-auto mb-4 opacity-20" color="white" />
                <p className="text-white/30 text-sm mb-2">No vote sessions yet</p>
                {isCreator && (
                  <button
                    onClick={() => navigate(`/trips/${id}/vote`)}
                    className="mt-6 flex items-center gap-2 px-6 py-3 text-white text-sm font-semibold rounded-2xl mx-auto transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#e63946' }}
                  >
                    <Plus size={16} />
                    Create Vote Session
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {voteSessions.map(session => (
                  <div
                    key={session.session_id}
                    className="rounded-3xl p-6"
                    style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-white font-semibold mb-1">{session.title}</h4>
                        {session.description && (
                          <p className="text-white/40 text-xs">{session.description}</p>
                        )}
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold uppercase"
                        style={{
                          backgroundColor: session.status === 'closed' ? '#2a9d8f22' : '#e6394622',
                          color: session.status === 'closed' ? '#2a9d8f' : '#e63946',
                          border: `1px solid ${session.status === 'closed' ? '#2a9d8f' : '#e63946'}`
                        }}
                      >
                        {session.status}
                      </span>
                    </div>

                    {/* options */}
                    <div className="flex flex-col gap-2">
                      {session.options.map(option => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between px-4 py-3 rounded-xl"
                          style={{
                            backgroundColor: option.id === session.winner_option_id ? '#2a9d8f22' : '#1a1a1a',
                            border: `1px solid ${option.id === session.winner_option_id ? '#2a9d8f' : '#2a2a2a'}`
                          }}
                        >
                          <span className="text-white text-sm">{option.text}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-white/30 text-xs">{option.votes} votes</span>
                            {option.id === session.winner_option_id && (
                              <CheckCircle size={14} color="#2a9d8f" />
                            )}
                            {session.status === 'open' && option.id !== session.user_voted && (
                              <button
                                onClick={async () => {
                                  await api.post(`/votes/${id}/cast`, { option_id: option.id })
                                  fetchAll()
                                }}
                                className="px-3 py-1 rounded-lg text-xs text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: '#e63946' }}
                              >
                                Vote
                              </button>
                            )}
                            {option.id === session.user_voted && (
                              <span className="text-xs" style={{ color: '#e63946' }}>✓ Voted</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* close button for creator */}
                    {isCreator && session.status !== 'closed' && (
                      <button
                        onClick={async () => {
                          await api.post(`/votes/${id}/close/${session.session_id}`)
                          fetchAll()
                        }}
                        className="mt-4 px-5 py-2 text-white text-xs font-semibold rounded-xl transition-opacity hover:opacity-90"
                        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                      >
                        Close Voting
                      </button>
                    )}
                  </div>
                ))}

                {isCreator && (
                  <button
                    onClick={() => navigate(`/trips/${id}/vote`)}
                    className="flex items-center gap-2 px-6 py-3 text-white text-sm font-semibold rounded-2xl w-fit transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#e63946' }}
                  >
                    <Plus size={16} />
                    New Vote Session
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}