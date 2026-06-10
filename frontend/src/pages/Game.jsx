import { useState, useEffect } from 'react'
import MapPicker from '../components/MapPicker.jsx'
import ScoreCard from '../components/ScoreCard.jsx'

const API = 'http://localhost:3001'

export default function Game() {
  const [challenge, setChallenge] = useState(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [guesses, setGuesses] = useState({})
  const [lastResult, setLastResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pin, setPin] = useState(null)
  const [submittedPin, setSubmittedPin] = useState(null)
  const [showScore, setShowScore] = useState(false)

  const token = localStorage.getItem('wiir_token')

  useEffect(() => { fetchChallenge() }, [])

  async function fetchChallenge() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/challenge/today`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setChallenge(data)
      const existingGuesses = {}
      data.guesses.forEach(g => { existingGuesses[g.image_number] = g })
      setGuesses(existingGuesses)
      const next = [1,2,3,4,5].find(n => !existingGuesses[n])
      if (next) setCurrentImage(next - 1)
      else setShowScore(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function submitGuess() {
    if (!pin) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/api/challenge/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          challengeId: challenge.id,
          imageNumber: currentImage + 1,
          lat: pin.lat,
          lng: pin.lng
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubmittedPin(pin)
      setLastResult(data)
      setGuesses(prev => ({ ...prev, [currentImage + 1]: data }))
      setPin(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  function nextImage() {
    const next = currentImage + 1
    if (next >= 5) setShowScore(true)
    else {
      setCurrentImage(next)
      setLastResult(null)
      setSubmittedPin(null)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-[80vh] text-white/40">Loading today's challenge...</div>
  if (error === 'No challenge for today') return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-3">
      <div className="text-4xl">🏗️</div>
      <p className="text-white/60 text-sm">No challenge posted yet for today.</p>
      <p className="text-white/30 text-xs">Check back later or ask an admin to seed one.</p>
    </div>
  )
  if (error) return <div className="flex items-center justify-center h-[80vh] text-red-400 text-sm">{error}</div>
  if (showScore) return <ScoreCard guesses={Object.values(guesses)} />

  const imageUrl = challenge?.images[currentImage]
  const guessedThisRound = !!guesses[currentImage + 1]
  const TOPBAR = 48  // px height of each top bar
  const BOTTOMBAR = 48
  const NAV = 89

  return (
    <div style={{ display: 'flex', height: `calc(100vh - ${NAV}px)`, overflow: 'hidden' }}>

      {/* LEFT: image panel */}
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* top bar */}
        <div style={{ height: TOPBAR, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
            Location <strong style={{ color: 'white' }}>{currentImage + 1}</strong> / 5
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{
                width: 24, height: 6, borderRadius: 9999,
                background: guesses[i+1] ? '#4ade80' : i === currentImage ? 'white' : 'rgba(255,255,255,0.2)'
              }} />
            ))}
          </div>
        </div>
        {/* image */}
        <div style={{ flex: 1, minHeight: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {imageUrl
            ? <img
                src={imageUrl}
                alt="campus"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
              />
            : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>No image</span>
          }
        </div>
      </div>

      {/* RIGHT: map panel */}
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
        {/* top bar */}
        <div style={{ height: TOPBAR, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
            {guessedThisRound ? 'Your guess for this location' : 'Click the map to place your guess'}
          </span>
        </div>
        {/* map */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <MapPicker
            onPin={setPin}
            pin={pin}
            submittedPin={submittedPin}
            actualLocation={lastResult?.actualLocation}
            disabled={guessedThisRound}
          />
        </div>
        {/* bottom bar */}
        <div style={{ height: BOTTOMBAR, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {lastResult ? (
            <>
              <div style={{ fontSize: 14 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Distance: </span>
                <strong style={{ color: 'white' }}>{lastResult.distance}m</strong>
                <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 12 }}>Points: </span>
                <strong style={{ color: '#4ade80' }}>+{lastResult.points}</strong>
              </div>
              <button
                onClick={nextImage}
                style={{ background: 'white', color: 'black', border: 'none', borderRadius: 8, padding: '6px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                {currentImage === 4 ? 'See Results' : 'Next →'}
              </button>
            </>
          ) : (
            <button
              onClick={submitGuess}
              disabled={!pin || submitting}
              style={{ marginLeft: 'auto', background: 'white', color: 'black', border: 'none', borderRadius: 8, padding: '6px 20px', fontWeight: 600, fontSize: 14, cursor: pin ? 'pointer' : 'not-allowed', opacity: (!pin || submitting) ? 0.4 : 1 }}
            >
              {submitting ? 'Submitting...' : pin ? 'Submit Guess' : 'Place a pin first'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
