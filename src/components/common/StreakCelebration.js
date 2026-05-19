import React, { useEffect, useState } from 'react'

const StreakCelebration = ({ streak, onClose }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose()
    }, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  if (!visible) return null

  const getMessage = () => {
    if (streak === 1) return { title: "You're back! 🎉", sub: "Day 1 of your streak. Keep it going!", color: '#6C3FF5' }
    if (streak < 7) return { title: `${streak} Day Streak! 🔥`, sub: "You're building momentum. Don't stop now!", color: '#FF6B6B' }
    if (streak === 7) return { title: "7 Days! Incredible! 🔥", sub: "You earned the 7-Day Streak badge!", color: '#F59E0B' }
    if (streak < 30) return { title: `${streak} Day Streak! 💎`, sub: "You're on fire! Keep the habit going.", color: '#F59E0B' }
    if (streak === 30) return { title: "30 Days! Legend! 💎", sub: "You earned the 30-Day Streak badge!", color: '#00C896' }
    return { title: `${streak} Day Streak! 👑`, sub: "You are absolutely unstoppable!", color: '#00C896' }
  }

  const { title, sub, color } = getMessage()

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'white', borderRadius: 28, padding: '40px 32px',
        textAlign: 'center', maxWidth: 320, width: '90%',
        animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Confetti dots */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          {['🎊', '⭐', '🎉', '✨', '🏆'].map((emoji, i) => (
            <span key={i} style={{
              position: 'absolute',
              fontSize: 20,
              animation: `float${i} 2s ease-in-out infinite`,
              top: i % 2 === 0 ? -20 : -10,
              left: `${i * 20 + 5}%`,
            }}>{emoji}</span>
          ))}
        </div>

        <div style={{
          fontSize: 72, marginBottom: 16, marginTop: 20,
          animation: 'bounce 0.6s ease infinite alternate'
        }}>
          {streak >= 30 ? '💎' : streak >= 7 ? '🔥' : '⭐'}
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 900, color, marginBottom: 8 }}>{title}</h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 1.5 }}>{sub}</p>

        <div style={{
          background: `${color}15`, borderRadius: 16, padding: '12px 20px',
          marginBottom: 24, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 12
        }}>
          <span style={{ fontSize: 28 }}>🔥</span>
          <div>
            <p style={{ fontSize: 28, fontWeight: 900, color }}>{streak}</p>
            <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700 }}>DAY STREAK</p>
          </div>
        </div>

        <button onClick={() => { setVisible(false); onClose() }} style={{
          width: '100%', padding: '14px', borderRadius: 14,
          background: `linear-gradient(135deg, ${color}, #6C3FF5)`,
          color: 'white', border: 'none', fontSize: 15,
          fontWeight: 700, cursor: 'pointer'
        }}>
          Let's Go! 🚀
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
        @keyframes bounce {
          from { transform: translateY(0) }
          to { transform: translateY(-10px) }
        }
      `}</style>
    </div>
  )
}

export default StreakCelebration