import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import NotificationBell from '../../components/common/NotificationBell'
import { useAuth } from '../../context/AuthContext'
import { getOrganizerEvents } from '../../services/eventService'
import { getOrganizerBookings } from '../../services/bookingService'
import { formatDate } from '../../utils/helpers'

const OrganizerDashboard = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [e, b] = await Promise.all([
          getOrganizerEvents(profile.id),
          getOrganizerBookings(profile.id)
        ])
        setEvents(e || [])
        setBookings(b || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (profile) load()
  }, [profile])

  const upcoming = events.filter(e => e.status === 'published' && new Date(e.event_date) > new Date())

  const GRADIENTS = [
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
            <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>Welcome back 👋</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>
              {profile?.organization_name || profile?.full_name}
            </h1>
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>Your event dashboard</p>
          </div>
          <NotificationBell />
        </div>

        <div className="grid-2" style={{ position: 'relative', zIndex: 1 }}>
          {[
            { label: 'TOTAL EVENTS', value: events.length, bg: 'rgba(255,255,255,0.15)' },
            { label: 'UPCOMING', value: upcoming.length, bg: 'rgba(0,200,150,0.2)' },
            { label: 'BOOKINGS', value: bookings.length, bg: 'rgba(245,158,11,0.2)' },
            { label: 'ATTENDEES', value: events.reduce((s, e) => s + (e.max_attendees || 0), 0), bg: 'rgba(255,107,107,0.2)' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, borderRadius: 14, padding: '14px',
              backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <p style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>{s.value}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginTop: 2, letterSpacing: 0.5 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="page-body">
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Quick Actions</h2>
          <div className="grid-2" style={{ gap: 12 }}>
            {[
              { label: 'Create Event', icon: '➕', gradient: 'linear-gradient(135deg, #6C3FF5, #9B59B6)', path: '/organizer/create-event' },
              { label: 'Hire Agency', icon: '🤝', gradient: 'linear-gradient(135deg, #FF6B6B, #F59E0B)', path: '/organizer/hire-agency' },
              { label: 'View Attendees', icon: '👥', gradient: 'linear-gradient(135deg, #00C896, #6C3FF5)', path: '/organizer/attendees' },
              { label: 'Messages', icon: '💬', gradient: 'linear-gradient(135deg, #F59E0B, #FF6B6B)', path: '/organizer/messages' },
            ].map(action => (
              <button key={action.label} onClick={() => navigate(action.path)}
                style={{
                  background: action.gradient, borderRadius: 16, padding: '18px 14px',
                  color: 'white', fontWeight: 700, fontSize: 13, border: 'none',
                  cursor: 'pointer', textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{action.icon}</div>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="section-header">
            <h2>Recent Events</h2>
            <span onClick={() => navigate('/organizer/events')}
              style={{ fontSize: 13, color: '#6C3FF5', fontWeight: 600, cursor: 'pointer' }}>See all</span>
          </div>
          {loading ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>Loading...</p>
          ) : events.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>No events yet</h3>
                <p>Create your first event to get started</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {events.slice(0, 4).map((event, i) => (
                <div key={event.id} style={{
                  background: 'white', borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #E8EAFF'
                }}>
                  {/* Event image */}
                  <div style={{
                    height: 120, position: 'relative', overflow: 'hidden',
                    background: GRADIENTS[i % GRADIENTS.length]
                  }}>
                    {event.cover_url ? (
                      <img src={event.cover_url} alt={event.title}
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'cover', display: 'block'
                        }} />
                    ) : null}
                  </div>

                  {/* Event details */}
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, flex: 1, marginRight: 8 }}>{event.title}</h3>
                      <span className={`badge badge-${event.status}`}>{event.status}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#6B7280' }}>📍 {event.venue}</p>
                    <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>📅 {formatDate(event.event_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Navbar />
    </div>
  )
}

export default OrganizerDashboard