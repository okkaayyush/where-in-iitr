import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function Admin() {
  const [files, setFiles] = useState([])
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function handleUpload() {
    if (!password) { setError('Enter admin password'); return }
    if (files.length !== 5) { setError('Select exactly 5 images'); return }
    setError('')
    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      Array.from(files).forEach(f => formData.append('images', f))

      const res = await fetch(`${API}/api/admin/upload-challenge`, {
        method: 'POST',
        headers: { 'x-admin-password': password },
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-white/40 text-sm mt-1">Upload today's 5 challenge images</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">

          {/* Password */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-widest mb-1 block">Admin Password</label>
            <input
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-white/30 transition"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {/* File picker */}
          <div
            className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-white/40 transition"
            onClick={() => document.getElementById('fileInput').click()}
          >
            <div className="text-3xl mb-2">📸</div>
            {files.length === 0 ? (
              <p className="text-white/40 text-sm">Click to select 5 iPhone photos</p>
            ) : (
              <div className="flex flex-col gap-1">
                {Array.from(files).map((f, i) => (
                  <p key={i} className="text-white/70 text-xs truncate">{f.name}</p>
                ))}
              </div>
            )}
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => setFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && files.length !== 5 && (
            <p className="text-yellow-400 text-xs text-center">
              {files.length}/5 images selected — need exactly 5
            </p>
          )}

          <button
            onClick={handleUpload}
            disabled={loading || files.length !== 5 || !password}
            className="w-full bg-white text-black font-semibold py-2.5 rounded-lg text-sm hover:bg-white/90 transition disabled:opacity-40"
          >
            {loading ? 'Uploading & extracting GPS...' : "Create Today's Challenge"}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
              <p className="text-green-400 text-sm font-semibold mb-2">✓ Challenge created!</p>
              {result.locations.map((l, i) => (
                <p key={i} className="text-green-400/70 text-xs">
                  Location {i + 1}: {l.lat.toFixed(5)}, {l.lng.toFixed(5)}
                </p>
              ))}
            </div>
          )}
        </div>

        <p className="text-white/20 text-xs text-center mt-4">
          Images must have iPhone GPS data. Make sure Location Services was on when photos were taken.
        </p>
      </div>
    </div>
  )
}
