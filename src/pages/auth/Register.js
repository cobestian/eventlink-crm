import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../../services/authService'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'organizer', label: 'Event Organizer', icon: '🎯', desc: 'Create and manage events', color: '#6C3FF5' },
  { value: 'agency', label: 'Ushering Agency', icon: '👔', desc: 'Get hired for events', color: '#FF6B6B' },
  { value: 'attendee', label: 'Event Attendee', icon: '🎉', desc: 'Discover and attend events', color: '#00C896' },
]

const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    role: '', phone: '', organizationName: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await registerUser(form)
      toast.success('Account created successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #6C3FF5 0%, #9B59B6 60%, #5530D4 100%)' }}>
      <div style={{ padding: '48px 24px 24px', color: 'white' }}>
        {step === 2 && (
          <button onClick={() => setStep(1)} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
            borderRadius: 10, padding: '8px 14px', cursor: 'pointer', marginBottom: 16, fontSize: 14
          }}>← Back</button>
        )}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{step === 1 ? '🚀' : '📝'}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>{step === 1 ? 'Create Account' : 'Your Details'}</h1>
          <p style={{ opacity: 0.75, marginTop: 6, fontSize: 14 }}>
            {step === 1 ? 'Choose your role to get started' : `Registering as ${ROLES.find(r => r.value === form.role)?.label}`}
          </p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '28px 28px 0 0', padding: '28px 24px 40px', minHeight: '65vh' }}>
        {step === 1 ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              {ROLES.map(role => (
                <button key={role.value} onClick={() => { setForm({ ...form, role: role.value }); setStep(2) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px',
                    borderRadius: 16, border: '2px solid #E8EAFF', background: 'white',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                  }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    backgroundColor: `${role.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26
                  }}>{role.icon}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#1A1A2E' }}>{role.label}</p>
                    <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{role.desc}</p>
                  </div>
                  <span style={{ marginLeft: 'auto', color: '#9CA3AF' }}>→</span>
                </button>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#6C3FF5', fontWeight: 700 }}>Sign In</Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Full Name</label>
              <input placeholder="Cecilia Quansah" value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            {(form.role === 'organizer' || form.role === 'agency') && (
              <div className="input-group">
                <label>{form.role === 'organizer' ? 'Organization Name' : 'Agency Name'}</label>
                <input placeholder="e.g. Accra Events Ltd" value={form.organizationName}
                  onChange={e => setForm({ ...form, organizationName: e.target.value })} />
              </div>
            )}
            <div className="input-group">
              <label>Phone Number</label>
              <input placeholder="0244000000" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="Min. 6 characters" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Register