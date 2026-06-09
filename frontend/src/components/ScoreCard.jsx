export default function ScoreCard({ guesses }) {
  const total = guesses.reduce((sum, g) => sum + (g.points || 0), 0)
  const maxScore = 5000

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">
            {total >= 4000 ? '🏆' : total >= 2500 ? '🎯' : '📍'}
          </div>
          <h2 className="text-3xl font-bold text-white">Today's Score</h2>
          <p className="text-6xl font-black text-white mt-2">{total}</p>
          <p className="text-white/30 text-sm mt-1">out of {maxScore}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {guesses.map((g, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-white/5 last:border-0">
              <span className="text-white/50 text-sm">Location {i + 1}</span>
              <div className="flex items-center gap-4">
                <span className="text-white/40 text-xs">{g.distance ? `${Math.round(g.distance)}m` : '—'}</span>
                <span className={`text-sm font-semibold ${(g.points || 0) >= 800 ? 'text-green-400' : (g.points || 0) >= 400 ? 'text-yellow-400' : 'text-red-400'}`}>
                  +{g.points || 0}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">Come back tomorrow for a new challenge 👋</p>
      </div>
    </div>
  )
}