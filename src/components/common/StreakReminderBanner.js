import React, { useState } from 'react'

const StreakReminderBanner = ({ streak, lastActivity, onClose }) => {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  const today = new Date().toISOString().split('T')[0]
  const lastDate = lastActivity

  // Don't show if already active today
  if (lastDate === today) return null

  const daysSince = lastDate
    ? Math.floor((new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24))
    : 1

  const getMessage = () => {
    if (daysSince === 1 && streak > 0) {
      return {
        icon: '🔥',
        title: `Don't break your ${streak}-day streak!`,
        sub: 'Log in daily to keep your streak alive. One action is all it takes.',
        color: '#FF6B6B',
        bg: '#FEE2E2',
        border: '#FECACA'
      }
    }
    if (daysSince > 1 && streak > 0) {
      return {
        icon: '💔',
        title: `Your ${streak}-day streak ended`,
        sub: `You were away for ${daysSince} days. Start a new streak today!`,
        color: '#F59E0B',
        bg: '#FEF3C7',
        border: '#FDE68A'
      }
    }
    return {
      icon: '⭐',
      title: 'Start your streak today!',
      sub: 'Stay active daily to earn badges and climb the leaderboard.',
      color: '#6C3FF5',
      bg: '#EDE9FE',
      border: '#C4B5FD'
    }
  }

  const { icon, title, sub, color, bg, border } = getMessage()

  return (
    <div style={{
      margin: '0 16px 16px',
      padding: '14px 16px',
      borderRadius: 16,
      backgroundColor: bg,
      border: `1.5px solid ${border}`,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      animation: 'slideDown 0.3s ease',
      position: 'relative'
    }}>
      <span style={{ fontSize: 28, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color, marginBottom: 3 }}>{title}</p>
        <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>{sub}</p>
      </div>
      <button onClick={() => { setVisible(false); onClose && onClose() }} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#9CA3AF', fontSize: 18, padding: 0, lineHeight: 1
      }}>×</button>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
      `}</style>
    </div>
  )
}

export default StreakReminderBanner