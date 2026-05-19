import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import { useAuth } from '../context/AuthContext'

const ProfilePage = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const roleColors = {
    organizer: { bg: '#EDE9FE', color: '#6C3FF5', gradient: 'linear-gradient(135deg, #6C3FF5, #9B59B6)' },
    agency: { bg: '#FEE2E2', color: '#FF6B6B', gradient: 'linear-gradient(135deg, #FF6B6B, #F59E0B)' },
    attendee: { bg: '#D1FAE5', color: '#00C896', gradient: 'linear-gradient(135deg, #00C896, #6C3FF5)' },
    admin: { bg: '#EDE9FE', color: '#6C3FF5', gradient: 'linear-gradient(135deg, #1A1A2E, #6C3FF5)' },
  }

  const rc = roleColors[profile?.role] || roleColors.organizer

  return (
    <div className="app-shell">
      <div className="app-header" style={{ textAlign: 'center', paddingBottom: 40 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', color: 'white', fontWeight: 900, fontSize: 32,
            border: '3px solid rgba(255,255,255,0.3)'
          }}>
            {profile?.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>
            {profile?.full_name}
          </h1>
          <span style={{
            display: 'inline-block', padding: '4px 16px', borderRadius: 20,
            background: 'rgba(255,255,255,0.2)', color: 'white',
            fontSize: 12, fontWeight: 700, textTransform: 'capitalize'
          }}>{profile?.role}</span>
        </div>
      </div>

      <div className="page-body">
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#9CA3AF', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>
            Account Info
          </h3>
          {[
            { label: 'Full Name', value: profile?.full_name, icon: '👤' },
            { label: 'Email', value: profile?.email, icon: '📧' },
            { label: 'Phone', value: profile?.phone || 'Not set', icon: '📱' },
            { label: 'Organization', value: profile?.organization_name || 'Not set', icon: '🏢' },
            { label: 'Role', value: profile?.role, icon: '🎯' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 0', borderBottom: '1px solid #F0F2FF'
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', marginTop: 2, textTransform: 'capitalize' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleSignOut} style={{
          width: '100%', padding: '16px', borderRadius: 16,
          background: '#FEE2E2', color: '#FF6B6B', border: 'none',
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
          🚪 Sign Out
        </button>
      </div>
      <Navbar />
    </div>
  )
}

export default ProfilePage