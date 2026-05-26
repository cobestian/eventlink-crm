import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import { sendEmail } from '../../services/emailService'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Generate reset link through Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://eventlink-crm.vercel.app/reset-password'
      })
      if (error) throw error

      // Also send branded email through Resend
      await sendEmail({
        to: email,
        subject: '🔐 Reset Your EventLink CRM Password',
        html: `
          <h2 style="color:#6C3FF5;">Reset Your Password 🔐</h2>
          <p>We received a request to reset your EventLink CRM password.</p>
          <p>Check your inbox for a separate email from Supabase with the reset link, or click below if you received a direct link.</p>
          <div style="background:#F0F2FF;border-radius:12px;padding:16px;margin:20px 0;">
            <p style="color:#6B7280;font-size:14px;margin:0;">
              If you did not request a password reset, please ignore this email.
            </p>
          </div>
          <p style="color:#9CA3AF;font-size:12px;">EventLink CRM — Ghana's Event Industry Platform</p>
        `
      })

      setSent(true)
      toast.success('Reset link sent! Check your email.')
    } catch (err) {
  // Show success even if Supabase SMTP fails
  // because the email might still be queued
  setSent(true)
  toast.success('If that email exists, a reset link will arrive shortly.')
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
          {sent ? `We sent a reset link to ${email}` : 'Enter your email to receive a reset link'}
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
              <input type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
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
                📧 Check your email at <strong>{email}</strong> for the password reset link.
              </p>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 8 }}>
                Also check your spam/junk folder if you don't see it.
              </p>
            </div>
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