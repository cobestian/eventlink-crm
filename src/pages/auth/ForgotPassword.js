import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://eventlink-crm.vercel.app/reset-password'
      })
      if (error) throw error
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
      background: 'linear-gradient(160deg, #6C3FF5 0%, #9B59B6 60%, #5530D4 100%)'
    }}>
      <div style={{ padding: '60px 24px 32px', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>{sent ? '✅' : '🔐'}</div>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>
          {sent ? 'Check Your Email' : 'Reset Password'}
        </h1>
        <p style={{ opacity: 0.75, marginTop: 6, fontSize: 14 }}>
          {sent
            ? `We sent a reset link to ${email}`
            : 'Enter your email to receive a reset link'}
        </p>
      </div>

      <div style={{
        background: 'white', borderRadius: '28px 28px 0 0',
        padding: '32px 24px 40px', minHeight: '60vh'
      }}>
        {!sent ? (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link →'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              background: '#EDE9FE', borderRadius: 20, padding: 24, marginBottom: 24
            }}>
              <p style={{ fontSize: 15, color: '#6C3FF5', fontWeight: 600, lineHeight: 1.6 }}>
                📧 We sent a password reset link to <strong>{email}</strong>.
                Click the link in your email to set a new password.
              </p>
            </div>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>
              Didn't receive it? Check your spam folder.
            </p>
            <button onClick={() => setSent(false)} style={{
              background: 'none', border: 'none', color: '#6C3FF5',
              fontSize: 14, fontWeight: 700, cursor: 'pointer'
            }}>
              Try a different email
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6B7280' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: '#6C3FF5', fontWeight: 700 }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword