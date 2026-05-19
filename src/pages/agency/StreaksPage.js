import React, { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getUserGamification, getLeaderboard } from '../../services/gamificationService'

const BADGES = [
  { id: 'streak_7', icon: '🔥', label: '7-Day Streak', desc: 'Stay active for 7 days', pts: 175 },
  { id: 'streak_30', icon: '💎', label: '30-Day Streak', desc: 'Stay active for 30 days', pts: 750 },
  { id: 'first_booking', icon: '🎯', label: 'First Booking', desc: 'Accept your first booking', pts: 100 },
  { id: 'fast_responder', icon: '⚡', label: 'Fast Responder', desc: 'Respond to bookings quickly', pts: 50 },
  { id: 'top_agency', icon: '🏆', label: 'Top Agency', desc: 'Reach top of leaderboard', pts: 500 },
]

const StreaksPage = () => {
  const { profile } = useAuth()
  const [gamification, setGamification] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [tab, setTab] = useState('badges')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  const loadData = async () => {
    try {
      const [g, l] = await Promise.all([getUserGamification(profile.id), getLeaderboard()])
      setGamification(g)
      setLeaderboard(l || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const myRank = leaderboard.findIndex(l => l.user_id === profile.id) + 1

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: 60, marginBottom: 8 }}>🔥</p>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: 'white' }}>{gamification?.streak || 0}</h1>
          <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 4 }}>Day Streak</p>
          <p style={{ fontSize: 13, opacity: 0.65 }}>
            {gamification?.streak === 0 ? 'Start your streak today!' : 'Keep it up! Come back tomorrow.'}
          </p>

          <div style={{
            display: 'flex', justifyContent: 'space-around', marginTop: 20,
            background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '14px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {[
              { label: 'Points', value: gamification?.points || 0 },
              { label: 'Rank', value: myRank ? `#${myRank}` : '-' },
              { label: 'Badges', value: gamification?.badges?.length || 0 },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{s.value}</p>
                <p style={{ fontSize: 11, opacity: 0.7, color: 'white' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['badges', 'leaderboard'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700,
              border: 'none', cursor: 'pointer', textTransform: 'capitalize',
              backgroundColor: tab === t ? '#6C3FF5' : '#E8EAFF',
              color: tab === t ? 'white' : '#6C3FF5',
            }}>{t === 'badges' ? '🏅 Badges' : '🏆 Leaderboard'}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>Loading...</p>
        ) : tab === 'badges' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BADGES.map(badge => {
              const earned = gamification?.badges?.includes(badge.id)
              return (
                <div key={badge.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px',
                  borderRadius: 16, border: '1.5px solid',
                  borderColor: earned ? '#C4B5FD' : '#E8EAFF',
                  backgroundColor: earned ? '#EDE9FE' : '#F8F9FF',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: earned ? 'linear-gradient(135deg, #6C3FF5, #9B59B6)' : '#E8EAFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26
                  }}>{badge.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: earned ? '#6C3FF5' : '#6B7280' }}>{badge.label}</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{badge.desc}</p>
                  </div>
                  {earned
                    ? <span style={{ fontSize: 22 }}>✅</span>
                    : <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 700 }}>+{badge.pts}pts</span>}
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leaderboard.map((entry, index) => (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                borderRadius: 16, border: '1.5px solid',
                borderColor: entry.user_id === profile.id ? '#C4B5FD' : '#E8EAFF',
                backgroundColor: entry.user_id === profile.id ? '#EDE9FE' : 'white',
              }}>
                <span style={{
                  fontSize: index < 3 ? 24 : 14, fontWeight: 800, minWidth: 36, textAlign: 'center',
                  color: index === 0 ? '#F59E0B' : index === 1 ? '#9CA3AF' : index === 2 ? '#B45309' : '#6B7280'
                }}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>
                    {entry.profiles?.organization_name || entry.profiles?.full_name}
                    {entry.user_id === profile.id && <span style={{ color: '#6C3FF5', fontSize: 11 }}> (You)</span>}
                  </p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'capitalize' }}>{entry.profiles?.role}</p>
                </div>
                <p style={{ fontWeight: 800, color: '#6C3FF5', fontSize: 15 }}>{entry.points}pts</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  )
}

export default StreaksPage