import React from 'react'

const Loader = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#F8F9FE'
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '4px solid #E5E7EB',
        borderTop: '4px solid #6C63FF',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Loader