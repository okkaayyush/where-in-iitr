import { useState } from 'react'

const API = 'http://localhost:3001'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email') // 'email' | 'code'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function requestCode() {
    setError('')
    if (!email.endsWith('@iitr.ac.in')) {
      setError('Only @iitr.ac.in emails allowed')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStep('code')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, name })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onLogin(data.user, data.token)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-5xl mb-3">📍</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">WhereInIITR</h1>
          <p className="text-white/40 mt-2 text-sm">Daily campus location challenge</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
          {step === 'email' ? (
            <>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest mb-1 block">Your Name</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-white/30 transition"
                  placeholder="e.g. Aayush"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest mb-1 block">IITR Email</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-white/30 transition"
                  placeholder="you@iitr.ac.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && requestCode()}
                />
              </div>
              <button
                onClick={requestCode}
                disabled={loading}
                className="w-full bg-white text-black font-semibold py-2.5 rounded-lg text-sm hover:bg-white/90 transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Code'}
              </button>
              <p className="text-white/30 text-xs text-center">
                Since email is mocked, check the backend terminal for your OTP
              </p>
            </>
          ) : (
            <>
              <p className="text-white/50 text-sm">Code sent to <span className="text-white">{email}</span>. Check the backend terminal.</p>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-widest mb-1 block">6-digit Code</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-white/30 transition tracking-widest text-center text-lg"
                  placeholder="000000"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && verifyCode()}
                  maxLength={6}
                />
              </div>
              <button
                onClick={verifyCode}
                disabled={loading}
                className="w-full bg-white text-black font-semibold py-2.5 rounded-lg text-sm hover:bg-white/90 transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Play'}
              </button>
              <button onClick={() => { setStep('email'); setError('') }} className="text-white/30 text-xs text-center hover:text-white/60 transition">
                ← Use different email
              </button>
            </>
          )}

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        </div>
      </div>
    </div>
  )
}