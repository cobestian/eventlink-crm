import React from 'react'
import { useNavigate } from 'react-router-dom'

const Welcome = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #6C3FF5 0%, #9B59B6 40%, #FF6B6B 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{ textAlign: 'center', color: 'white', marginBottom: 48 }}>
        <div style={{
          width: 90, height: 90, borderRadius: 26,
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 44,
          border: '2px solid rgba(255,255,255,0.3)'
        }}>🎪</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, letterSpacing: -0.5 }}>EventLink CRM</h1>
        <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 6 }}>Ghana's Event Industry Platform</p>
        <p style={{ fontSize: 14, opacity: 0.65, maxWidth: 280, margin: '0 auto', lineHeight: 1.6 }}>
          Connecting organizers, ushering agencies, and attendees
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24, padding: 24, marginBottom: 16,
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 28 }}>
            {[
              { icon: '🎯', label: 'Organizers' },
              { icon: '👔', label: 'Agencies' },
              { icon: '🎉', label: 'Attendees' },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>{item.icon}</div>
                <p style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>{item.label}</p>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/register')} style={{
            width: '100%', padding: '16px', borderRadius: 14,
            background: 'white', color: '#6C3FF5',
            fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)', marginBottom: 12
          }}>Get Started →</button>
          <button onClick={() => navigate('/login')} style={{
            width: '100%', padding: '16px', borderRadius: 14,
            background: 'rgba(255,255,255,0.15)', color: 'white',
            fontSize: 16, fontWeight: 700, border: '2px solid rgba(255,255,255,0.4)', cursor: 'pointer'
          }}>Sign In</button>
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
          Powered by automation & gamification
        </p>
      </div>
    </div>
  )
}

export default Welcome