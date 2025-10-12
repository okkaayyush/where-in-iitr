import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import ImageChallenge from './components/ImageChallenge';
import Map from './components/Map';
import Leaderboard from './components/Leaderboard';

const API_URL = '/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (token) {
      fetchChallenge();
    }
  }, [token]);

  const fetchChallenge = async () => {
    try {
      const res = await fetch(`${API_URL}/challenge/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setChallenge(data);
      
      // Find first unguessed image
      const unguessedIndex = data.guesses.length;
      setCurrentImage(Math.min(unguessedIndex, 4));
    } catch (error) {
      console.error('Error fetching challenge:', error);
    }
  };

  const handleLogin = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const handleGuess = async (lat, lng) => {
    try {
      const res = await fetch(`${API_URL}/challenge/guess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          challengeId: challenge.id,
          imageNumber: currentImage + 1,
          lat,
          lng
        })
      });
      
      const data = await res.json();
      setResult(data);
      
      // Refresh challenge after 3 seconds
      setTimeout(() => {
        setResult(null);
        fetchChallenge();
        if (currentImage < 4) {
          setCurrentImage(currentImage + 1);
        }
      }, 3000);
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  if (showLeaderboard) {
    return (
      <div className="app">
        <header>
          <h1>🎯 WhereInIITR</h1>
          <button onClick={() => setShowLeaderboard(false)} className="btn-secondary">
            Back to Game
          </button>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </header>
        <Leaderboard token={token} />
      </div>
    );
  }

  if (!challenge) {
    return <div className="loading">Loading challenge...</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>🎯 WhereInIITR</h1>
        <div className="header-actions">
          <button onClick={() => setShowLeaderboard(true)} className="btn-secondary">
            🏆 Leaderboard
          </button>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <div className="game-container">
        <div className="progress-bar">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`progress-dot ${
                challenge.guesses.find(g => g.image_number === i + 1) ? 'completed' : 
                i === currentImage ? 'active' : ''
              }`}
            />
          ))}
        </div>

        <ImageChallenge
          imageUrl={challenge.images[currentImage]}
          imageNumber={currentImage + 1}
          isCompleted={!!challenge.guesses.find(g => g.image_number === currentImage + 1)}
        />

        <Map
          onGuess={handleGuess}
          result={result}
          disabled={!!challenge.guesses.find(g => g.image_number === currentImage + 1)}
        />

        {challenge.completed && (
          <div className="completion-message">
            <h2>🎉 Challenge Completed!</h2>
            <p>Check the leaderboard to see your ranking!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;