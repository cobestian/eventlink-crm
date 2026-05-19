import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import NotificationBell from '../../components/common/NotificationBell'
import { useAuth } from '../../context/AuthContext'
import { getAgencyBookings } from '../../services/bookingService'
import { getUserGamification, updateStreak } from '../../services/gamificationService'
import { formatDate } from '../../utils/helpers'

const AgencyDashboard = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [gamification, setGamification] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  const loadData = async () => {
    try {
      const [b, g] = await Promise.all([
        getAgencyBookings(profile.id),
        getUserGamification(profile.id)
      ])
      setBookings(b || [])
      setGamification(g)
      await updateStreak(profile.id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const pending = bookings.filter(b => b.status === 'pending').length
  const accepted = bookings.filter(b => b.status === 'accepted').length

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative', zIndex: 1 }}>
          <div>
            <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>Hello, {profile?.full_name?.split(' ')[0]} 👋</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>
              {profile?.organization_name || 'Agency Dashboard'}
            </h1>
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>Ready for your next event?</p>
          </div>
          <NotificationBell />
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16,
          display: 'flex', justifyContent: 'space-around', position: 'relative', zIndex: 1,
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {[
            { label: 'TOTAL', value: bookings.length },
            { label: 'CONFIRMED', value: accepted },
            { label: 'PENDING', value: pending },
            { label: 'STREAK 🔥', value: gamification?.streak || 0 },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>{s.value}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="page-body">
        {gamification?.badges?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>🏆 Your Badges</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {gamification.badges.map(badge => {
                const map = {
                  streak_7: { label: '7-Day Streak', icon: '🔥' },
                  streak_30: { label: '30-Day Streak', icon: '💎' },
                  first_booking: { label: 'First Booking', icon: '🎯' },
                  fast_responder: { label: 'Fast Responder', icon: '⚡' },
                  top_agency: { label: 'Top Agency', icon: '🏆' },
                }
                const b = map[badge] || { label: badge, icon: '🏅' }
                return (
                  <div key={badge} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', backgroundColor: '#EDE9FE',
                    borderRadius: 20, border: '1px solid #C4B5FD'
                  }}>
                    <span>{b.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6C3FF5' }}>{b.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Quick Actions</h2>
          <div className="grid-2" style={{ gap: 12 }}>
            {[
              { label: 'Booking Requests', icon: '📋', gradient: 'linear-gradient(135deg, #FF6B6B, #F59E0B)', path: '/agency/bookings' },
              { label: 'CRM & Organizers', icon: '🤝', gradient: 'linear-gradient(135deg, #6C3FF5, #9B59B6)', path: '/agency/crm' },
              { label: 'Streaks & Rewards', icon: '🔥', gradient: 'linear-gradient(135deg, #F59E0B, #FF6B6B)', path: '/agency/streaks' },
              { label: 'Messages', icon: '💬', gradient: 'linear-gradient(135deg, #00C896, #6C3FF5)', path: '/agency/messages' },
            ].map(action => (
              <button key={action.label} onClick={() => navigate(action.path)}
                style={{
                  background: action.gradient, borderRadius: 16, padding: '18px 14px',
                  color: 'white', fontWeight: 700, fontSize: 13, border: 'none',
                  cursor: 'pointer', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{action.icon}</div>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="section-header">
            <h2>Recent Bookings</h2>
            <span onClick={() => navigate('/agency/bookings')} style={{ fontSize: 13, color: '#6C3FF5', fontWeight: 600, cursor: 'pointer' }}>See all</span>
          </div>
          {loading ? <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>Loading...</p> :
            bookings.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No bookings yet</h3>
                  <p>Booking requests will appear here</p>
                </div>
              </div>
            ) : bookings.slice(0, 3).map(booking => (
              <div key={booking.id} className="card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>
                      {booking.profiles?.organization_name || booking.profiles?.full_name}
                    </p>
                    <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                      📅 {booking.events?.title}
                    </p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                      {formatDate(booking.events?.event_date)}
                    </p>
                  </div>
                  <span className={`badge badge-${booking.status}`}>{booking.status}</span>
                </div>
              </div>
            ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{
            background: 'linear-gradient(135deg, #FF6B6B, #6C3FF5)',
            borderRadius: 20, padding: 20, color: 'white', textAlign: 'center'
          }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>🔥</p>
            <p style={{ fontSize: 32, fontWeight: 800 }}>{gamification?.streak || 0} Day Streak</p>
            <p style={{ opacity: 0.8, fontSize: 13, marginTop: 6 }}>
              {gamification?.streak === 0 ? 'Start your streak today!' : 'Keep it up! Come back tomorrow.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800 }}>{gamification?.points || 0}</p>
                <p style={{ fontSize: 11, opacity: 0.7 }}>Points</p>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.3)' }} />
              <div>
                <p style={{ fontSize: 22, fontWeight: 800 }}>{gamification?.badges?.length || 0}</p>
                <p style={{ fontSize: 11, opacity: 0.7 }}>Badges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Navbar />
    </div>
  )
}

export default AgencyDashboard