import React, { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getAgencyBookings, updateBookingStatus } from '../../services/bookingService'
import { addPoints, awardBadge } from '../../services/gamificationService'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const BookingRequests = () => {
  const { profile } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (profile) loadBookings()
  }, [profile])

  const loadBookings = async () => {
    try {
      const data = await getAgencyBookings(profile.id)
      setBookings(data || [])
    } catch (err) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status)
      if (status === 'accepted') {
        await addPoints(profile.id, 100)
        await awardBadge(profile.id, 'first_booking')
        toast.success('Booking accepted! +100 points 🎉')
      } else {
        toast.success('Booking rejected')
      }
      loadBookings()
    } catch (err) {
      toast.error('Action failed')
    }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>Booking Requests</h1>
          <p style={{ opacity: 0.75, fontSize: 13 }}>Manage incoming requests from organizers</p>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {['all', 'pending', 'accepted', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700,
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', textTransform: 'capitalize',
              backgroundColor: filter === f ? '#6C3FF5' : '#E8EAFF',
              color: filter === f ? 'white' : '#6C3FF5',
            }}>{f}</button>
          ))}
        </div>

        {loading ? <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>Loading...</p> :
          filtered.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No {filter === 'all' ? '' : filter} bookings</h3>
                <p>Booking requests will appear here</p>
              </div>
            </div>
          ) : filtered.map(booking => (
            <div key={booking.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, #6C3FF5, #FF6B6B)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: 18
                }}>
                  {booking.profiles?.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>
                    {booking.profiles?.organization_name || booking.profiles?.full_name}
                  </p>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>{booking.profiles?.email}</p>
                </div>
                <span className={`badge badge-${booking.status}`}>{booking.status}</span>
              </div>

              <div style={{ background: '#F8F9FF', borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
                <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>📅 {booking.events?.title}</p>
                <p style={{ fontSize: 13, color: '#6B7280' }}>
                  🗓 {formatDate(booking.events?.event_date)} • 📍 {booking.events?.venue}
                </p>
              </div>

              {booking.message && (
                <p style={{ fontSize: 13, color: '#6B7280', fontStyle: 'italic', marginBottom: 12 }}>
                  "{booking.message}"
                </p>
              )}

              {booking.status === 'pending' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-danger" style={{ flex: 1, padding: '12px' }}
                    onClick={() => handleAction(booking.id, 'rejected')}>Reject</button>
                  <button className="btn-success" style={{ flex: 1, padding: '12px' }}
                    onClick={() => handleAction(booking.id, 'accepted')}>Accept ✓</button>
                </div>
              )}
            </div>
          ))}
      </div>
      <Navbar />
    </div>
  )
}

export default BookingRequests