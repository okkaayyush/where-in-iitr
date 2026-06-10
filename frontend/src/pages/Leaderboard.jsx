import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function Leaderboard() {
  const [tab, setTab] = useState('daily')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('wiir_token')

  useEffect(() => {
    fetchLeaderboard()
  }, [tab])

  async function fetchLeaderboard() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/leaderboard/${tab}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(await res.json())
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Leaderboard</h2>

      <div className="flex gap-2 mb-6">
        {['daily', 'weekly'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm transition capitalize ${tab === t ? 'bg-white text-black font-semibold' : 'text-white/50 border border-white/10 hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-white/30 text-sm">Loading...</div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center text-white/30 text-sm">No scores yet</div>
        ) : data.map((row, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3 border-b border-white/5 last:border-0">
            <span className={`w-6 text-sm font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-white/60' : i === 2 ? 'text-orange-400' : 'text-white/30'}`}>
              {i + 1}
            </span>
            <span className="flex-1 text-white text-sm">{row.name}</span>
            <span className="text-white/40 text-xs">{row.email}</span>
            <span className="text-white font-semibold text-sm">{row.total_points}</span>
          </div>
        ))}
      </div>
    </div>
  )
}