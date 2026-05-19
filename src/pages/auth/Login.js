import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../../services/authService'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await loginUser(form)
      navigate('/role-home')
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #6C3FF5 0%, #9B59B6 60%, #5530D4 100%)' }}>
      <div style={{ padding: '60px 24px 32px', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>👋</div>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Welcome Back</h1>
        <p style={{ opacity: 0.75, marginTop: 6 }}>Sign in to your EventLink account</p>
      </div>

      <div style={{
        background: 'white', borderRadius: '28px 28px 0 0',
        padding: '32px 24px 40px', minHeight: '60vh'
      }}>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                required style={{ paddingRight: 48 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9CA3AF'
              }}>{showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 24, marginTop: -8 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: '#6C3FF5', fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6B7280' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#6C3FF5', fontWeight: 700 }}>Sign Up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login