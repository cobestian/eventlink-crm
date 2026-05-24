import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getOrganizerEvents, cancelEvent } from '../../services/eventService'
import { formatDate, formatTime } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ManageEvents = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (profile) loadEvents()
  }, [profile])

  const loadEvents = async () => {
    try {
      const data = await getOrganizerEvents(profile.id)
      setEvents(data || [])
    } catch (err) {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (eventId) => {
    if (!window.confirm('Cancel this event?')) return
    try {
      await cancelEvent(eventId)
      toast.success('Event cancelled')
      loadEvents()
    } catch (err) {
      toast.error('Failed to cancel event')
    }
  }

  const filtered = filter === 'all' ? events : events.filter(e => e.status === filter)

  const GRADIENTS = [
    'linear-gradient(135deg, #6C3FF5, #9B59B6)',
    'linear-gradient(135deg, #FF6B6B, #F59E0B)',
    'linear-gradient(135deg, #00C896, #6C3FF5)',
    'linear-gradient(135deg, #F59E0B, #FF6B6B)',
  ]

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>My Events</h1>
            <p style={{ opacity: 0.75, fontSize: 13 }}>{events.length} total events</p>
          </div>
          <button onClick={() => navigate('/organizer/create-event')} style={{
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
            color: 'white', borderRadius: 12, padding: '10px 16px',
            fontWeight: 700, fontSize: 13, cursor: 'pointer'
          }}>+ New</button>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {['all', 'published', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700,
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', textTransform: 'capitalize',
              backgroundColor: filter === f ? '#6C3FF5' : '#E8EAFF',
              color: filter === f ? 'white' : '#6C3FF5',
            }}>{f}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No events yet</h3>
              <p>Create your first event to get started</p>
              <button className="btn-primary" onClick={() => navigate('/organizer/create-event')}
                style={{ marginTop: 16, width: 'auto', padding: '12px 24px' }}>
                Create Event
              </button>
            </div>
          </div>
        ) : filtered.map((event, i) => (
          <div key={event.id} className="event-card" style={{ marginBottom: 12 }}>
            <div style={{
  height: 100, borderRadius: '16px 16px 0 0', overflow: 'hidden',
  background: GRADIENTS[i % GRADIENTS.length],
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  position: 'relative'
}}>
  {event.cover_url ? (
    <img src={event.cover_url} alt={event.title}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  ) : (
    <div style={{
      width: '100%', height: '100%',
      background: GRADIENTS[i % GRADIENTS.length]
    }} />
  )}
</div>
            <div className="event-card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, flex: 1, marginRight: 8 }}>{event.title}</h3>
                <span className={`badge badge-${event.status}`}>{event.status}</span>
              </div>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 2 }}>📍 {event.venue}</p>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
                📅 {formatDate(event.event_date)} at {formatTime(event.event_date)}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
  <button onClick={() => {
    const link = `${window.location.origin}/attendee/events?join=${event.id}`
    navigator.clipboard.writeText(link)
    toast.success('Event link copied! 🔗')
  }} style={{
    padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid #E8EAFF', background: '#EDE9FE',
    fontSize: 13, fontWeight: 700, color: '#6C3FF5', cursor: 'pointer'
  }}>🔗 Share</button>
  <button onClick={() => navigate(`/organizer/attendees?event=${event.id}`)} style={{
    padding: '10px 16px', borderRadius: 10,
    border: '1.5px solid #E8EAFF', background: '#F8F9FF',
    fontSize: 13, fontWeight: 700, color: '#6C3FF5', cursor: 'pointer'
  }}>👥 Attendees</button>
  {event.status !== 'cancelled' && (
    <button onClick={() => handleCancel(event.id)} style={{
      padding: '10px 16px', borderRadius: 10, border: 'none',
      background: '#FEE2E2', color: '#FF6B6B',
      fontSize: 13, fontWeight: 700, cursor: 'pointer'
    }}>Cancel</button>
  )}
</div>
            </div>
          </div>
        ))}
      </div>
      <Navbar />
    </div>
  )
}

export default ManageEvents