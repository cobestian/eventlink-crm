import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import NotificationBell from '../../components/common/NotificationBell'
import { useAuth } from '../../context/AuthContext'
import { getAttendeeRsvps, getEvents } from '../../services/eventService'
import { getUserGamification, updateStreak } from '../../services/gamificationService'
import { formatDate, getCountdown } from '../../utils/helpers'

const AttendeeDashboard = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [rsvps, setRsvps] = useState([])
  const [allEvents, setAllEvents] = useState([])
  const [gamification, setGamification] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  const loadData = async () => {
    try {
      const [r, g, e] = await Promise.all([
        getAttendeeRsvps(profile.id),
        getUserGamification(profile.id),
        getEvents()
      ])
      setRsvps(r || [])
      setGamification(g)
      setAllEvents(e || [])
      await updateStreak(profile.id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const upcoming = rsvps.filter(r =>
    r.events?.status === 'published' && new Date(r.events?.event_date) > new Date()
  )

  const EVENT_GRADIENTS = [
    'linear-gradient(135deg, #6C3FF5, #9B59B6)',
    'linear-gradient(135deg, #FF6B6B, #F59E0B)',
    'linear-gradient(135deg, #00C896, #6C3FF5)',
    'linear-gradient(135deg, #F59E0B, #FF6B6B)',
  ]

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative', zIndex: 1 }}>
          <div>
            <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>Hello, {profile?.full_name?.split(' ')[0]} 👋</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>Discover Amazing</h1>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>Events Near You</h1>
          </div>
          <NotificationBell />
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1,
          border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer'
        }} onClick={() => navigate('/attendee/events')}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Search events, venues...</span>
        </div>
      </div>

      <div className="page-body">
        {upcoming.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div className="section-header">
              <h2>Featured Events</h2>
              <span onClick={() => navigate('/attendee/events')} style={{ fontSize: 13, color: '#6C3FF5', fontWeight: 600, cursor: 'pointer' }}>See all</span>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {upcoming.slice(0, 4).map((rsvp, i) => (
                <div key={rsvp.id} style={{
                  minWidth: 220, borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)', flexShrink: 0
                }}>
                  <div style={{
                    height: 120, background: EVENT_GRADIENTS[i % EVENT_GRADIENTS.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 40, position: 'relative'
                  }}>
                    🎪
                    <div style={{
                      position: 'absolute', bottom: 8, left: 8,
                      background: 'rgba(0,0,0,0.5)', borderRadius: 8,
                      padding: '3px 8px', fontSize: 10, color: 'white', fontWeight: 700
                    }}>EVENT</div>
                  </div>
                  <div style={{ background: 'white', padding: '12px' }}>
                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{rsvp.events?.title}</p>
                    <p style={{ fontSize: 11, color: '#6B7280' }}>📅 {formatDate(rsvp.events?.event_date)}</p>
                    <p style={{ fontSize: 11, color: '#6B7280' }}>📍 {rsvp.events?.venue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Quick Actions</h2>
          <div className="grid-3" style={{ gap: 10 }}>
            {[
              { label: 'My Events', sub: `${rsvps.length} registered`, icon: '📅', gradient: 'linear-gradient(135deg, #6C3FF5, #9B59B6)', path: '/attendee/tickets' },
              { label: 'Saved', sub: 'Your favorites', icon: '🔖', gradient: 'linear-gradient(135deg, #FF6B6B, #F59E0B)', path: '/attendee/events' },
              { label: 'Badges', sub: `${gamification?.badges?.length || 0} earned`, icon: '⭐', gradient: 'linear-gradient(135deg, #00C896, #6C3FF5)', path: '/attendee/badges' },
            ].map(action => (
              <button key={action.label} onClick={() => navigate(action.path)}
                style={{
                  background: action.gradient, borderRadius: 16, padding: '16px 10px',
                  color: 'white', border: 'none', cursor: 'pointer', textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{action.icon}</div>
                <p style={{ fontWeight: 700, fontSize: 12 }}>{action.label}</p>
                <p style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{action.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="section-header">
            <h2>Events Near You</h2>
            <span onClick={() => navigate('/attendee/events')} style={{ fontSize: 13, color: '#6C3FF5', fontWeight: 600, cursor: 'pointer' }}>See all</span>
          </div>
          {loading ? <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>Loading...</p> :
            allEvents.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-icon">🎉</div>
                  <h3>No events yet</h3>
                  <p>Check back soon for upcoming events</p>
                </div>
              </div>
            ) : allEvents.slice(0, 5).map((event, i) => (
              <div key={event.id} className="card" style={{ marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 12, flexShrink: 0,
                  background: EVENT_GRADIENTS[i % EVENT_GRADIENTS.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
                }}>🎪</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{event.title}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>📅 {formatDate(event.event_date)}</p>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>📍 {event.venue}</p>
                </div>
                <span style={{ fontSize: 18, color: '#9CA3AF' }}>›</span>
              </div>
            ))}
        </div>
      </div>
      <Navbar />
    </div>
  )
}

export default AttendeeDashboard