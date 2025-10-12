import { useState } from 'react';

const API_URL = 'http://localhost:3001/api'; 

function Login({ onLogin }) {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestCode = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.endsWith('iitr.ac.in')) {
      setError('Please use your iitr.ac.in email');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/auth/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStep('verify');
        if (data.code) alert(`Dev Mode - Your verification code is: ${data.code}`);
      } else {
        setError(data.error || 'Failed to send code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3001/api/auth/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, name })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onLogin(data.token, data.user);
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🎯 WhereInIITR</h1>
        <p className="subtitle">Can you find these spots on campus?</p>

        {step === 'email' ? (
          <div>
            <input
              type="email"
              placeholder="your.name@..iitr.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
            {error && <div className="error">{error}</div>}
            <button onClick={requestCode} disabled={loading} className="btn-primary">
              {loading ? 'Sending...' : 'Get Verification Code'}
            </button>
          </div>
        ) : (
          <div>
            <p className="info">Code sent to {email}</p>
            <input
              type="text"
              placeholder="Your Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="input"
            />
            {error && <div className="error">{error}</div>}
            <button onClick={verifyCode} disabled={loading} className="btn-primary">
              {loading ? 'Verifying...' : 'Login'}
            </button>
            <button onClick={() => setStep('email')} className="btn-text">
              Use different email
            </button>
          </div>
        )}

        <div className="features">
          <div className="feature">📍 5 daily locations</div>
          <div className="feature">🏆 Compete for top spot</div>
          <div className="feature">📊 Daily & weekly rankings</div>
        </div>
      </div>
    </div>
  );
}

export default Login;