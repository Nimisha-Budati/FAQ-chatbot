import React, { useState } from 'react';
export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { email, password, name };
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication processing failure.');
      }
      if (isLogin) {
        onAuthSuccess(data.token, data.user);
      } else {
        alert('Registration successful! Please login.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-fullscreen-viewport" style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: '#0f0f12', color: '#fff', padding: '1rem'
    }}>
      <div className="auth-card-panel" style={{
        background: '#1a1a22', padding: '2.5rem', borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)', width: '100%', maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: '600' }}>
          {isLogin ? '✨ Welcome Back' : '🚀 Create Account'}
        </h2>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#0f0f12', color: '#fff', outline: 'none' }}
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#0f0f12', color: '#fff', outline: 'none' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#0f0f12', color: '#fff', outline: 'none' }}
          />
          <button type="submit" disabled={loading} style={{
            padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#4f46e5',
            color: '#fff', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s'
          }}>
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#aaa' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: '500' }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}