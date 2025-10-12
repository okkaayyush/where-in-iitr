import { useState, useEffect } from 'react';

function Map({ onGuess, result, disabled }) {
  const [guessMarker, setGuessMarker] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    // Dynamically load Leaflet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = initMap;
    document.body.appendChild(script);
  }, []);

  const initMap = () => {
    const L = window.L;
    
    const mapInstance = L.map('map').setView([29.8667, 77.8950], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    // IIT Roorkee boundary (approximate)
    const bounds = [
      [29.8550, 77.8850],
      [29.8750, 77.9050]
    ];
    
    L.rectangle(bounds, {
      color: '#3388ff',
      weight: 2,
      fillOpacity: 0.1
    }).addTo(mapInstance);

    mapInstance.on('click', (e) => {
      if (disabled) return;
      
      if (guessMarker) {
        mapInstance.removeLayer(guessMarker);
      }
      
      const marker = L.marker(e.latlng).addTo(mapInstance);
      setGuessMarker(marker);
    });

    setMap(mapInstance);
  };

  const submitGuess = () => {
    if (guessMarker && onGuess) {
      const pos = guessMarker.getLatLng();
      onGuess(pos.lat, pos.lng);
    }
  };

  useEffect(() => {
    if (result && map) {
      const L = window.L;
      
      // Show actual location
      L.circleMarker([result.actualLocation.lat, result.actualLocation.lng], {
        radius: 8,
        color: '#00ff00',
        fillColor: '#00ff00',
        fillOpacity: 0.8
      }).addTo(map).bindPopup('Actual Location').openPopup();

      // Draw line between guess and actual
      if (guessMarker) {
        const guessPos = guessMarker.getLatLng();
        L.polyline([
          [guessPos.lat, guessPos.lng],
          [result.actualLocation.lat, result.actualLocation.lng]
        ], { color: 'red', dashArray: '5, 10' }).addTo(map);
      }
    }
  }, [result, map]);

  return (
    <div className="map-container">
      <div id="map" style={{ height: '400px', width: '100%' }}></div>
      
      {result && (
        <div className="result-popup">
          <h3>🎯 {result.points} Points!</h3>
          <p>Distance: {result.distance}m</p>
        </div>
      )}
      
      {!disabled && guessMarker && !result && (
        <button onClick={submitGuess} className="btn-primary btn-submit">
          Submit Guess
        </button>
      )}
    </div>
  );
}
export default Map;