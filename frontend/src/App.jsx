import { useState, useEffect } from 'react'
import Login from './pages/Login.jsx'
import Game from './pages/Game.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('game')

  useEffect(() => {
    const stored = localStorage.getItem('wiir_user')
    const token = localStorage.getItem('wiir_token')
    if (stored && token) setUser(JSON.parse(stored))

    // Secret admin route — only accessible via yoursite.com/#admin
    if (window.location.hash === '#admin') setPage('admin')
  }, [])

  function handleLogin(userData, token) {
    localStorage.setItem('wiir_user', JSON.stringify(userData))
    localStorage.setItem('wiir_token', token)
    setUser(userData)
  }

  function handleLogout() {
    localStorage.removeItem('wiir_user')
    localStorage.removeItem('wiir_token')
    setUser(null)
  }

  if (!user && page !== 'admin') return <Login onLogin={handleLogin} />

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Nav — no admin button, admin is accessed via /#admin */}
      {page !== 'admin' && (
        <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <span className="text-xl font-bold tracking-tight text-white">
            📍 WhereInIITR
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage('game')}
              className={`text-sm px-3 py-1 rounded-full transition ${page === 'game' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'}`}
            >
              Play
            </button>
            <button
              onClick={() => setPage('leaderboard')}
              className={`text-sm px-3 py-1 rounded-full transition ${page === 'leaderboard' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'}`}
            >
              Leaderboard
            </button>
            <span className="text-white/40 text-sm">{user?.name}</span>
            <button onClick={handleLogout} className="text-sm text-white/40 hover:text-white transition">
              Logout
            </button>
          </div>
        </nav>
      )}

      {page === 'game' && <Game />}
      {page === 'leaderboard' && <Leaderboard />}
      {page === 'admin' && <Admin />}
    </div>
  )
}
