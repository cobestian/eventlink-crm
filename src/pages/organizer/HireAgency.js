import React, { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getAgencies, sendBookingRequest } from '../../services/bookingService'
import { getOrganizerEvents } from '../../services/eventService'
import toast from 'react-hot-toast'

const HireAgency = () => {
  const { profile } = useAuth()
  const [agencies, setAgencies] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ eventId: '', message: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  const loadData = async () => {
    try {
      const [a, e] = await Promise.all([getAgencies(), getOrganizerEvents(profile.id)])
      setAgencies(a || [])
      setEvents((e || []).filter(ev => ev.status === 'published'))
    } catch (err) {
      toast.error('Failed to load agencies')
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async () => {
    if (!form.eventId) { toast.error('Please select an event'); return }
    setSending(true)
    try {
      await sendBookingRequest({
        organizerId: profile.id,
        agencyId: selected.id,
        eventId: form.eventId,
        message: form.message
      })
      toast.success('Booking request sent! 🎉')
      setSelected(null)
      setForm({ eventId: '', message: '' })
    } catch (err) {
      toast.error(err.message || 'Failed to send request')
    } finally {
      setSending(false)
    }
  }

  const GRADIENTS = [
    'linear-gradient(135deg, #6C3FF5, #9B59B6)',
    'linear-gradient(135deg, #FF6B6B, #F59E0B)',
    'linear-gradient(135deg, #00C896, #6C3FF5)',
    'linear-gradient(135deg, #F59E0B, #FF6B6B)',
  ]

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>Hire Agency</h1>
          <p style={{ opacity: 0.75, fontSize: 13 }}>Book professional ushering agencies</p>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>Loading agencies...</p>
        ) : agencies.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">👔</div>
              <h3>No agencies available</h3>
              <p>Check back later for registered agencies</p>
            </div>
          </div>
        ) : agencies.map((agency, i) => (
          <div key={agency.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                background: GRADIENTS[i % GRADIENTS.length],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: 22
              }}>
                {agency.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 15 }}>
                  {agency.organization_name || agency.full_name}
                </p>
                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{agency.email}</p>
                <p style={{ fontSize: 12, color: '#6B7280' }}>{agency.phone}</p>
              </div>
            </div>

            {agency.gamification && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, background: '#EDE9FE', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: '#6C3FF5' }}>{agency.gamification.points || 0}</p>
                  <p style={{ fontSize: 11, color: '#6B7280' }}>Points</p>
                </div>
                <div style={{ flex: 1, background: '#FEE2E2', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: '#FF6B6B' }}>{agency.gamification.streak || 0} 🔥</p>
                  <p style={{ fontSize: 11, color: '#6B7280' }}>Streak</p>
                </div>
                <div style={{ flex: 1, background: '#D1FAE5', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: '#00C896' }}>{agency.gamification.badges?.length || 0}</p>
                  <p style={{ fontSize: 11, color: '#6B7280' }}>Badges</p>
                </div>
              </div>
            )}

            <button className="btn-primary" onClick={() => setSelected(agency)}
              style={{ background: GRADIENTS[i % GRADIENTS.length] }}>
              Book This Agency →
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Book Agency</h3>
            <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 20 }}>
              {selected.organization_name || selected.full_name}
            </p>
            <div className="input-group">
              <label>Select Event</label>
              <select value={form.eventId} onChange={e => setForm({ ...form, eventId: e.target.value })}>
                <option value="">Choose an event...</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Message (optional)</label>
              <textarea rows={3} placeholder="Add any specific requirements..."
                value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                style={{ padding: '12px 16px', border: '1.5px solid #E8EAFF', borderRadius: 12, fontSize: 14, resize: 'none', width: '100%', background: '#F8F9FF' }} />
            </div>
            <button className="btn-primary" onClick={handleBook} disabled={sending}>
              {sending ? 'Sending...' : 'Send Booking Request →'}
            </button>
          </div>
        </div>
      )}
      <Navbar />
    </div>
  )
}

export default HireAgency