import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import toast from 'react-hot-toast'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Supabase sends tokens in the URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const type = hashParams.get('type')

    if (accessToken && type === 'recovery') {
      // Set the session using the tokens from the URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ error }) => {
        if (error) {
          toast.error('Invalid or expired reset link')
          setValidSession(false)
        } else {
          setValidSession(true)
        }
        setChecking(false)
      })
    } else {
      // Also listen for auth state change
      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setValidSession(true)
          setChecking(false)
        }
      })
      // Give it 3 seconds then show form anyway
      setTimeout(() => {
        setChecking(false)
        setValidSession(true)
      }, 2000)
      return () => listener.subscription.unsubscribe()
    }
  }, [])

  const handleReset = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Password updated successfully! Please log in.')
      await supabase.auth.signOut()
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Failed to update password')
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
        <div style={{ fontSize: 44, marginBottom: 12 }}>🔐</div>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Set New Password</h1>
        <p style={{ opacity: 0.75, marginTop: 6, fontSize: 14 }}>Enter your new password below</p>
      </div>

      <div style={{
        background: 'white', borderRadius: '28px 28px 0 0',
        padding: '32px 24px 40px', minHeight: '60vh'
      }}>
        {checking ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 32, marginBottom: 16 }}>⏳</p>
            <p style={{ color: '#6B7280' }}>Verifying reset link...</p>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <div className="input-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password →'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6B7280' }}>
          Remember your password?{' '}
          <span onClick={() => navigate('/login')}
            style={{ color: '#6C3FF5', fontWeight: 700, cursor: 'pointer' }}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword