import { useState, useEffect } from 'react';

const API_URL = '/api';

function Leaderboard({ token }) {
  const [tab, setTab] = useState('daily');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [tab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/leaderboard/${tab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
    setLoading(false);
  };

  return (
    <div className="leaderboard-container">
      <div className="tabs">
        <button
          className={tab === 'daily' ? 'tab active' : 'tab'}
          onClick={() => setTab('daily')}
        >
          Today
        </button>
        <button
          className={tab === 'weekly' ? 'tab active' : 'tab'}
          onClick={() => setTab('weekly')}
        >
          This Week
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="leaderboard-list">
          {data.length === 0 ? (
            <p className="empty">No scores yet. Be the first!</p>
          ) : (
            data.map((entry, index) => (
              <div key={index} className="leaderboard-item">
                <div className="rank">#{index + 1}</div>
                <div className="player-info">
                  <div className="player-name">{entry.name}</div>
                  <div className="player-email">{entry.email}</div>
                </div>
                <div className="score">{entry.total_points} pts</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
