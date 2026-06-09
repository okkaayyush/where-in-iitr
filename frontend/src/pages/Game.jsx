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

  useEffect(() => {
    fetchChallenge()
  }, [])

  async function fetchChallenge() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/challenge/today`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setChallenge(data)

      // restore progress
      const existingGuesses = {}
      data.guesses.forEach(g => { existingGuesses[g.image_number] = g })
      setGuesses(existingGuesses)

      // go to first unguessed image
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

    setSubmittedPin(pin)  // save pin before clearing
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
  if (next >= 5) {
    setShowScore(true)
  } else {
    setCurrentImage(next)
    setLastResult(null)
    setSubmittedPin(null)  // clear for next round
  }
}

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh] text-white/40">Loading today's challenge...</div>
  )

  if (error === 'No challenge for today') return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-3">
      <div className="text-4xl">🏗️</div>
      <p className="text-white/60 text-sm">No challenge posted yet for today.</p>
      <p className="text-white/30 text-xs">Check back later or ask an admin to seed one.</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-[80vh] text-red-400 text-sm">{error}</div>
  )

  if (showScore) return <ScoreCard guesses={Object.values(guesses)} />

  const imageUrl = challenge?.images[currentImage]
  const guessedThisRound = !!guesses[currentImage + 1]

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)]">
      {/* Left: image */}
      <div className="lg:w-1/2 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-white/50 text-sm">
            Location <span className="text-white font-semibold">{currentImage + 1}</span> / 5
          </span>
          <div className="flex gap-1.5">
            {[0,1,2,3,4].map(i => (
              <div key={i} className={`w-6 h-1.5 rounded-full transition ${
                guesses[i+1] ? 'bg-green-400' : i === currentImage ? 'bg-white' : 'bg-white/20'
              }`} />
            ))}
          </div>
        </div>
        <div className="flex-1 relative bg-black">
          {imageUrl
            ? <img src={imageUrl} alt="campus" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">No image available</div>
          }
        </div>
      </div>

      {/* Right: map */}
      <div className="lg:w-1/2 flex flex-col border-l border-white/10">
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-white/50 text-sm">
            {guessedThisRound ? 'Your guess for this location' : 'Click the map to place your guess'}
          </p>
        </div>
        <div className="flex-1 min-h-0" style={{ height: 'calc(100vh - 180px)' }}>
          <MapPicker
  onPin={setPin}
  pin={pin}
  submittedPin={submittedPin}
  actualLocation={lastResult?.actualLocation}
  disabled={guessedThisRound}
/>
        </div>
        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between gap-4">
          {lastResult ? (
            <>
              <div className="text-sm">
                <span className="text-white/50">Distance: </span>
                <span className="text-white font-semibold">{lastResult.distance}m</span>
                <span className="text-white/50 ml-3">Points: </span>
                <span className="text-green-400 font-semibold">+{lastResult.points}</span>
              </div>
              <button
                onClick={nextImage}
                className="bg-white text-black text-sm font-semibold px-5 py-2 rounded-lg hover:bg-white/90 transition"
              >
                {currentImage === 4 ? 'See Results' : 'Next →'}
              </button>
            </>
          ) : (
            <button
              onClick={submitGuess}
              disabled={!pin || submitting}
              className="ml-auto bg-white text-black text-sm font-semibold px-5 py-2 rounded-lg hover:bg-white/90 transition disabled:opacity-40"
            >
              {submitting ? 'Submitting...' : pin ? 'Submit Guess' : 'Place a pin first'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}