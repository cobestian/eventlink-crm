import React, { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getAttendeeRsvps } from '../../services/eventService'
import { QRCodeCanvas as QRCode } from 'qrcode.react'
import { formatDate, formatTime, getCountdown } from '../../utils/helpers'

const MyTickets = () => {
  const { profile } = useAuth()
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (profile) getAttendeeRsvps(profile.id).then(data => {
      setRsvps(data || [])
      setLoading(false)
    })
  }, [profile])

  const upcoming = rsvps.filter(r => new Date(r.events?.event_date) > new Date())
  const past = rsvps.filter(r => new Date(r.events?.event_date) <= new Date())

  const GRADIENTS = [
    'linear-gradient(135deg, #6C3FF5, #9B59B6)',
    'linear-gradient(135deg, #FF6B6B, #F59E0B)',
    'linear-gradient(135deg, #00C896, #6C3FF5)',
  ]

  const TicketCard = ({ rsvp, index }) => {
    const isOpen = expanded === rsvp.id
    const isPast = new Date(rsvp.events?.event_date) <= new Date()
    const gradient = isPast ? 'linear-gradient(135deg, #9CA3AF, #6B7280)' : GRADIENTS[index % GRADIENTS.length]

    return (
      <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: 16 }}>
        <div style={{ background: gradient, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 10, opacity: 0.7, letterSpacing: 1, textTransform: 'uppercase', color: 'white', marginBottom: 4 }}>
                EventLink CRM
              </p>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 6 }}>{rsvp.events?.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>📍 {rsvp.events?.venue}</p>
            </div>
            {rsvp.checked_in && (
              <div style={{
                background: 'rgba(255,255,255,0.2)', borderRadius: 10,
                padding: '6px 12px', fontSize: 12, color: 'white', fontWeight: 700
              }}>✅ In</div>
            )}
          </div>
        </div>

        <div style={{
          background: 'white', padding: '16px 20px',
          borderBottom: '2px dashed #E8EAFF'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, marginBottom: 3 }}>DATE</p>
              <p style={{ fontSize: 14, fontWeight: 700 }}>{formatDate(rsvp.events?.event_date)}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, marginBottom: 3 }}>TIME</p>
              <p style={{ fontSize: 14, fontWeight: 700 }}>{formatTime(rsvp.events?.event_date)}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, marginBottom: 3 }}>STATUS</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: isPast ? '#6B7280' : '#00C896' }}>
                {isPast ? 'Done' : getCountdown(rsvp.events?.event_date)}
              </p>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '14px 20px' }}>
          <button onClick={() => setExpanded(isOpen ? null : rsvp.id)} style={{
            width: '100%', padding: '12px', borderRadius: 12,
            border: '1.5px solid #E8EAFF', background: '#F8F9FF',
            fontSize: 14, fontWeight: 700, color: '#6C3FF5', cursor: 'pointer'
          }}>
            {isOpen ? 'Hide QR Code ▲' : 'Show QR Code ▼'}
          </button>

          {isOpen && (
            <div style={{ marginTop: 16, textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                display: 'inline-block', padding: 16, background: 'white',
                borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <QRCode
                  value={JSON.stringify({ rsvpId: rsvp.id, eventId: rsvp.event_id, attendeeId: profile.id, name: profile.full_name })}
                  size={180}
                />
              </div>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 12 }}>Show at event entrance</p>
              <p style={{ fontSize: 11, color: '#C4B5FD', marginTop: 4, fontWeight: 700 }}>
                #{rsvp.id?.substring(0, 8).toUpperCase()}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>My Tickets</h1>
          <p style={{ opacity: 0.75, fontSize: 13 }}>{rsvps.length} event registrations</p>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>Loading tickets...</p>
        ) : rsvps.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">🎟️</div>
              <h3>No tickets yet</h3>
              <p>Register for events to get your tickets here</p>
            </div>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#1A1A2E' }}>Upcoming</h2>
                {upcoming.map((rsvp, i) => <TicketCard key={rsvp.id} rsvp={rsvp} index={i} />)}
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#6B7280' }}>Past Events</h2>
                {past.map((rsvp, i) => <TicketCard key={rsvp.id} rsvp={rsvp} index={i} />)}
              </div>
            )}
          </>
        )}
      </div>
      <Navbar />
    </div>
  )
}

export default MyTickets