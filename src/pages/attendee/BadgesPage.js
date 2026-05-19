import React, { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getUserGamification, getLeaderboard } from '../../services/gamificationService'

const ALL_BADGES = [
  { id: 'first_rsvp', icon: '🎯', label: 'First RSVP', desc: 'Register for your first event', pts: 10 },
  { id: 'streak_7', icon: '🔥', label: '7-Day Streak', desc: 'Log in for 7 days in a row', pts: 175 },
  { id: 'streak_30', icon: '💎', label: '30-Day Streak', desc: 'Log in for 30 days in a row', pts: 750 },
  { id: 'loyal_attendee', icon: '⭐', label: 'Loyal Attendee', desc: 'Attend 5 events', pts: 250 },
  { id: 'event_explorer', icon: '🗺️', label: 'Event Explorer', desc: 'Register for 10 events', pts: 100 },
  { id: 'vip_attendee', icon: '👑', label: 'VIP Attendee', desc: 'Earn 500 points', pts: 500 },
]

const BadgesPage = () => {
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
  const earnedCount = ALL_BADGES.filter(b => gamification?.badges?.includes(b.id)).length

  return (
    <div className="app-shell">
      <div className="app-header">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: 48, marginBottom: 8 }}>🏅</p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 16 }}>Badges & Rewards</h1>
          <div style={{
            display: 'flex', justifyContent: 'space-around',
            background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 14,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {[
              { label: 'Points', value: gamification?.points || 0, icon: '⭐' },
              { label: 'Badges', value: `${earnedCount}/${ALL_BADGES.length}`, icon: '🏅' },
              { label: 'Streak', value: gamification?.streak || 0, icon: '🔥' },
              { label: 'Rank', value: myRank ? `#${myRank}` : '-', icon: '🏆' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 8, marginBottom: 4 }}>{s.icon}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{s.value}</p>
                <p style={{ fontSize: 10, opacity: 0.7, color: 'white' }}>{s.label}</p>
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
              backgroundColor: tab === t ? '#00C896' : '#E8EAFF',
              color: tab === t ? 'white' : '#00C896',
            }}>{t === 'badges' ? '🏅 Badges' : '🏆 Leaderboard'}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>Loading...</p>
        ) : tab === 'badges' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ALL_BADGES.map(badge => {
              const earned = gamification?.badges?.includes(badge.id)
              return (
                <div key={badge.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px',
                  borderRadius: 16, border: '1.5px solid',
                  borderColor: earned ? '#6EE7B7' : '#E8EAFF',
                  backgroundColor: earned ? '#D1FAE5' : '#F8F9FF',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: earned ? 'linear-gradient(135deg, #00C896, #6C3FF5)' : '#E8EAFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26
                  }}>{badge.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: earned ? '#065F46' : '#6B7280' }}>{badge.label}</p>
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
                borderColor: entry.user_id === profile.id ? '#6EE7B7' : '#E8EAFF',
                backgroundColor: entry.user_id === profile.id ? '#D1FAE5' : 'white',
              }}>
                <span style={{
                  fontSize: index < 3 ? 24 : 14, fontWeight: 800, minWidth: 36, textAlign: 'center',
                  color: index === 0 ? '#F59E0B' : index === 1 ? '#9CA3AF' : index === 2 ? '#B45309' : '#6B7280'
                }}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>
                    {entry.profiles?.full_name}
                    {entry.user_id === profile.id && <span style={{ color: '#00C896', fontSize: 11 }}> (You)</span>}
                  </p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'capitalize' }}>{entry.profiles?.role}</p>
                </div>
                <p style={{ fontWeight: 800, color: '#00C896', fontSize: 15 }}>{entry.points}pts</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  )
}

export default BadgesPage