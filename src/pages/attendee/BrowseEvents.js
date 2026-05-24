import React, { useEffect, useState, useCallback } from 'react'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getEvents, rsvpEvent, getAttendeeRsvps } from '../../services/eventService'
import { addPoints, awardBadge } from '../../services/gamificationService'
import { initializePayment, savePayment, hasPayedForEvent } from '../../services/paymentService'
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

      // check which paid events this attendee has paid for
      const paidMap = {}
      for (const event of (e || [])) {
        if (event.price > 0) {
          const paid = await hasPayedForEvent(profile.id, event.id)
          paidMap[event.id] = paid
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

  const handleFreeRsvp = async (eventId) => {
    setProcessing(eventId)
    try {
      await rsvpEvent(profile.id, eventId)
      await addPoints(profile.id, 10)
      await awardBadge(profile.id, 'first_rsvp')
      toast.success('Registered! +10 points 🎉')
      loadData()
    } catch (err) {
      if (err.message?.includes('duplicate')) toast.error('Already registered')
      else toast.error(err.message || 'Registration failed')
    } finally {
      setProcessing(null)
    }
  }

  const handlePaidRsvp = async (event) => {
    setProcessing(event.id)
    try {
      initializePayment({
        email: profile.email,
        amount: event.price,
        eventTitle: event.title,
        onSuccess: async (reference) => {
          try {
            await savePayment({
              attendeeId: profile.id,
              eventId: event.id,
              amount: event.price,
              reference
            })
            await rsvpEvent(profile.id, event.id)
            await addPoints(profile.id, 20)
            await awardBadge(profile.id, 'first_rsvp')
            toast.success('Payment successful! Ticket confirmed 🎉')
            loadData()
          } catch (err) {
            toast.error('Payment saved but registration failed. Contact support.')
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
        ) : filtered.map((event, i) => (
          <div key={event.id} className="event-card" style={{ marginBottom: 16 }}>
            <div className="event-card-image" style={{ background: GRADIENTS[i % GRADIENTS.length] }}>
  {event.cover_url ? (
    <img src={event.cover_url} alt={event.title}
      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
  ) : null}
              <div style={{
                position: 'absolute', bottom: 10, left: 10,
                background: 'rgba(0,0,0,0.4)', borderRadius: 8,
                padding: '3px 10px', fontSize: 11, color: 'white', fontWeight: 700
              }}>EVENT</div>

              {/* Price tag */}
              <div style={{
                position: 'absolute', top: 10, right: 10,
                background: event.price > 0 ? '#FF6B6B' : '#00C896',
                borderRadius: 20, padding: '4px 12px',
                fontSize: 12, color: 'white', fontWeight: 800
              }}>
                {event.price > 0 ? `GHS ${event.price}` : 'FREE'}
              </div>
            </div>

            <div className="event-card-body">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{event.title}</h3>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>📍 {event.venue}</p>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
                📅 {formatDate(event.event_date)} at {formatTime(event.event_date)}
              </p>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>👥 Max {event.max_attendees}</p>

              {event.description && (
                <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 10, lineHeight: 1.5 }}>
                  {event.description?.substring(0, 80)}{event.description?.length > 80 ? '...' : ''}
                </p>
              )}

              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 14
              }}>
                <div style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                  background: '#EDE9FE', color: '#6C3FF5', fontSize: 12, fontWeight: 700
                }}>⏰ {getCountdown(event.event_date)}</div>

                {event.price > 0 && (
                  <div style={{
                    padding: '4px 12px', borderRadius: 20,
                    background: '#FEE2E2', color: '#FF6B6B',
                    fontSize: 13, fontWeight: 800
                  }}>GHS {event.price}</div>
                )}
              </div>

              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>
                By {event.profiles?.organization_name || event.profiles?.full_name}
              </p>

              {isRegistered(event.id) ? (
                <div style={{
                  padding: '12px', borderRadius: 12, background: '#D1FAE5',
                  textAlign: 'center', color: '#065F46', fontWeight: 700, fontSize: 14
                }}>✅ Registered</div>
              ) : event.price > 0 ? (
                <div>
                  {paidEvents[event.id] ? (
                    <div style={{
                      padding: '12px', borderRadius: 12, background: '#D1FAE5',
                      textAlign: 'center', color: '#065F46', fontWeight: 700
                    }}>✅ Payment confirmed</div>
                  ) : (
                    <button
                      className="btn-primary"
                      style={{ background: 'linear-gradient(135deg, #FF6B6B, #F59E0B)' }}
                      disabled={processing === event.id}
                      onClick={() => handlePaidRsvp(event)}>
                      {processing === event.id ? 'Processing...' : `Pay GHS ${event.price} & Register 💳`}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  className="btn-primary"
                  style={{ background: GRADIENTS[i % GRADIENTS.length] }}
                  disabled={processing === event.id}
                  onClick={() => handleFreeRsvp(event.id)}>
                  {processing === event.id ? 'Registering...' : 'Register Free →'}
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