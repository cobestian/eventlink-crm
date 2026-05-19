import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import NotificationBell from '../../components/common/NotificationBell'
import { supabase } from '../../config/supabase'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ users: 0, events: 0, bookings: 0, rsvps: 0 })
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    try {
      const [users, events, bookings, rsvps] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('rsvps').select('*', { count: 'exact', head: true }),
      ])
      setStats({ users: users.count || 0, events: events.count || 0, bookings: bookings.count || 0, rsvps: rsvps.count || 0 })
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5)
      setRecentUsers(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const roleColor = (role) => {
    if (role === 'organizer') return { bg: '#EDE9FE', color: '#6C3FF5' }
    if (role === 'agency') return { bg: '#FEE2E2', color: '#FF6B6B' }
    if (role === 'attendee') return { bg: '#D1FAE5', color: '#00C896' }
    return { bg: '#F3F4F6', color: '#6B7280' }
  }

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative', zIndex: 1 }}>
          <div>
            <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>Admin Panel</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>EventLink CRM</h1>
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>Platform overview</p>
          </div>
          <NotificationBell />
        </div>

        <div className="grid-2" style={{ position: 'relative', zIndex: 1, gap: 10 }}>
          {[
            { label: 'USERS', value: stats.users, bg: 'rgba(255,255,255,0.15)' },
            { label: 'EVENTS', value: stats.events, bg: 'rgba(0,200,150,0.2)' },
            { label: 'BOOKINGS', value: stats.bookings, bg: 'rgba(245,158,11,0.2)' },
            { label: 'RSVPs', value: stats.rsvps, bg: 'rgba(255,107,107,0.2)' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, borderRadius: 14, padding: '14px',
              backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <p style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>{s.value}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="page-body">
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Admin Actions</h2>
          <button onClick={() => navigate('/admin/users')} style={{
            width: '100%', background: 'linear-gradient(135deg, #6C3FF5, #9B59B6)',
            borderRadius: 16, padding: '18px', color: 'white', fontWeight: 700,
            fontSize: 15, border: 'none', cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 4px 12px rgba(108,63,245,0.3)'
          }}>
            <span style={{ fontSize: 28 }}>👥</span>
            <div>
              <p style={{ fontWeight: 700 }}>Manage Users</p>
              <p style={{ fontSize: 12, opacity: 0.8 }}>{stats.users} total users on platform</p>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 20 }}>›</span>
          </button>
        </div>

        <div>
          <div className="section-header">
            <h2>Recent Users</h2>
            <span onClick={() => navigate('/admin/users')} style={{ fontSize: 13, color: '#6C3FF5', fontWeight: 600, cursor: 'pointer' }}>View all</span>
          </div>
          {loading ? <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>Loading...</p> :
            recentUsers.map(user => {
              const rc = roleColor(user.role)
              return (
                <div key={user.id} className="card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, #6C3FF5, #FF6B6B)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: 16
                  }}>
                    {user.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{user.full_name}</p>
                    <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{user.email}</p>
                  </div>
                  <span style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 11,
                    fontWeight: 700, backgroundColor: rc.bg, color: rc.color,
                    textTransform: 'capitalize'
                  }}>{user.role}</span>
                </div>
              )
            })}
        </div>
      </div>
      <Navbar />
    </div>
  )
}

export default AdminDashboard