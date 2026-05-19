import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../services/authService'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
      toast.success('Reset link sent to your email!')
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6C63FF 0%, #9B59B6 50%, #FF6584 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: 24, padding: '40px 36px',
        maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center'
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>{sent ? '✅' : '🔐'}</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E', marginBottom: 8 }}>
          {sent ? 'Check Your Email' : 'Reset Password'}
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>
          {sent
            ? `We sent a reset link to ${email}`
            : 'Enter your email and we will send you a reset link'}
        </p>

        {!sent && (
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p style={{ marginTop: 20, fontSize: 14, color: '#6B7280' }}>
          <Link to="/login" style={{ color: '#6C63FF', fontWeight: 600 }}>← Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword