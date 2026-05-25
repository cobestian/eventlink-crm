import React, { useEffect, useState, useCallback } from 'react'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getEvents, rsvpEvent, getAttendeeRsvps } from '../../services/eventService'
import { addPoints, awardBadge } from '../../services/gamificationService'
import { initializePayment, savePayment, hasPayedForEvent } from '../../services/paymentService'
import { sendRsvpConfirmationEmail } from '../../services/emailService'
import { formatDate, formatTime, getCountdown } from '../../utils/helpers'
import toast from 'react-hot-toast'

const GRADIENTS = [
  'linear-gradient(135deg, #6C3FF5, #9B59B6)',
  'linear-gradient(135deg, #FF6B6B, #F59E0B)',
  'linear-gradient(135deg, #00C896, #6C3FF5)',
  'linear-gradient(135deg, #F59E0B, #FF6B6B)',
]

const BrowseEvents = () => {
  const { profile } = useAuth()
  const [events, setEvents] = useState([])
  const [myRsvps, setMyRsvps] = useState([])
  const [paidEvents, setPaidEvents] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [processing, setProcessing] = useState(null)

  const loadData = useCallback(async () => {
    try {
      const [e, r] = await Promise.all([getEvents(), getAttendeeRsvps(profile.id)])
      setEvents(e || [])
      setMyRsvps(r || [])
      const paidMap = {}
      for (const evt of (e || [])) {
        if (evt.price > 0) {
          const paid = await hasPayedForEvent(profile.id, evt.id)
          paidMap[evt.id] = paid
        }
      }
      setPaidEvents(paidMap)
    } catch (err) {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [profile])

  useEffect(() => {
    if (profile) loadData()
  }, [profile, loadData])

  const handleFreeRsvp = async (evt) => {
    setProcessing(evt.id)
    try {
      const data = await rsvpEvent(profile.id, evt.id)
      await addPoints(profile.id, 10)
      await awardBadge(profile.id, 'first_rsvp')
      await sendRsvpConfirmationEmail({
        email: profile.email,
        name: profile.full_name,
        eventTitle: evt.title,
        eventDate: formatDate(evt.event_date),
        venue: evt.venue,
        rsvpId: data?.id
      })
      toast.success('Registered! +10 points 🎉 Check your email!')
      loadData()
    } catch (err) {
      if (err.message?.includes('duplicate')) toast.error('Already registered')
      else toast.error(err.message || 'Registration failed')
    } finally {
      setProcessing(null)
    }
  }

  const handlePaidRsvp = async (evt) => {
    setProcessing(evt.id)
    try {
      initializePayment({
        email: profile.email,
        amount: evt.price,
        eventTitle: evt.title,
        onSuccess: async (reference) => {
          try {
            await savePayment({
              attendeeId: profile.id,
              eventId: evt.id,
              amount: evt.price,
              reference
            })
            await rsvpEvent(profile.id, evt.id)
            await addPoints(profile.id, 20)
            await awardBadge(profile.id, 'first_rsvp')
            await sendRsvpConfirmationEmail({
              email: profile.email,
              name: profile.full_name,
              eventTitle: evt.title,
              eventDate: formatDate(evt.event_date),
              venue: evt.venue,
              rsvpId: reference
            })
            toast.success('Payment successful! Ticket confirmed 🎉 Check your email!')
            loadData()
          } catch (err) {
            toast.error('Payment saved but registration failed.')
          }
        },
        onClose: () => {
          toast('Payment cancelled')
          setProcessing(null)
        }
      })
    } catch (err) {
      toast.error('Payment failed. Try again.')
      setProcessing(null)
    }
  }

  const isRegistered = (eventId) => myRsvps.some(r => r.event_id === eventId)

  const filtered = events.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.venue?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ position: 'relative', zIndex: 1, marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>Browse Events</h1>
          <p style={{ opacity: 0.75, fontSize: 13 }}>Discover events happening near you</p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1,
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search events, venues..."
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: 'white', fontSize: 14, outline: 'none'
            }} />
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>Loading events...</p>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <h3>No events found</h3>
              <p>{search ? 'Try a different search' : 'No events available yet'}</p>
            </div>
          </div>
        ) : filtered.map((evt, i) => (
          <div key={evt.id} className="event-card" style={{ marginBottom: 16 }}>
            <div className="event-card-image" style={{
              background: GRADIENTS[i % GRADIENTS.length],
              position: 'relative', overflow: 'hidden'
            }}>
              {evt.cover_url ? (
                <img src={evt.cover_url} alt={evt.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
              ) : null}
              <div style={{
                position: 'absolute', bottom: 10, left: 10,
                background: 'rgba(0,0,0,0.4)', borderRadius: 8,
                padding: '3px 10px', fontSize: 11, color: 'white', fontWeight: 700
              }}>EVENT</div>
              <div style={{
                position: 'absolute', top: 10, right: 10,
                background: evt.price > 0 ? '#FF6B6B' : '#00C896',
                borderRadius: 20, padding: '4px 12px',
                fontSize: 12, color: 'white', fontWeight: 800
              }}>
                {evt.price > 0 ? `GHS ${evt.price}` : 'FREE'}
              </div>
            </div>

            <div className="event-card-body">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{evt.title}</h3>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>📍 {evt.venue}</p>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
                📅 {formatDate(evt.event_date)} at {formatTime(evt.event_date)}
              </p>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>👥 Max {evt.max_attendees}</p>

              {evt.description && (
                <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 10, lineHeight: 1.5 }}>
                  {evt.description?.substring(0, 80)}{evt.description?.length > 80 ? '...' : ''}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                  background: '#EDE9FE', color: '#6C3FF5', fontSize: 12, fontWeight: 700
                }}>⏰ {getCountdown(evt.event_date)}</div>
                {evt.price > 0 && (
                  <div style={{
                    padding: '4px 12px', borderRadius: 20,
                    background: '#FEE2E2', color: '#FF6B6B', fontSize: 13, fontWeight: 800
                  }}>GHS {evt.price}</div>
                )}
              </div>

              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>
                By {evt.profiles?.organization_name || evt.profiles?.full_name}
              </p>

              {isRegistered(evt.id) ? (
                <div style={{
                  padding: '12px', borderRadius: 12, background: '#D1FAE5',
                  textAlign: 'center', color: '#065F46', fontWeight: 700, fontSize: 14
                }}>✅ Registered</div>
              ) : evt.price > 0 ? (
                paidEvents[evt.id] ? (
                  <div style={{
                    padding: '12px', borderRadius: 12, background: '#D1FAE5',
                    textAlign: 'center', color: '#065F46', fontWeight: 700
                  }}>✅ Payment confirmed</div>
                ) : (
                  <button className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #FF6B6B, #F59E0B)' }}
                    disabled={processing === evt.id}
                    onClick={() => handlePaidRsvp(evt)}>
                    {processing === evt.id ? 'Processing...' : `Pay GHS ${evt.price} & Register 💳`}
                  </button>
                )
              ) : (
                <button className="btn-primary"
                  style={{ background: GRADIENTS[i % GRADIENTS.length] }}
                  disabled={processing === evt.id}
                  onClick={() => handleFreeRsvp(evt)}>
                  {processing === evt.id ? 'Registering...' : 'Register Free →'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Navbar />
    </div>
  )
}

export default BrowseEvents