import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const actualIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
})

function ClickHandler({ onPin, disabled }) {
  useMapEvents({
    click(e) {
      if (!disabled) onPin(e.latlng)
    }
  })
  return null
}

function FitBounds({ pin, actualLocation }) {
  const map = useMap()

  useEffect(() => {
    if (pin && actualLocation) {
      // Fit map to show both markers with padding
      const bounds = L.latLngBounds(
        [pin.lat, pin.lng],
        [actualLocation.lat, actualLocation.lng]
      )
      map.fitBounds(bounds, { padding: [60, 60] })
    } else if (pin && !actualLocation) {
      // Just pan to pin
      map.setView([pin.lat, pin.lng], map.getZoom())
    }
  }, [actualLocation]) // only trigger when actual location is revealed

  return null
}

export default function MapPicker({ onPin, pin, submittedPin, actualLocation, disabled }) {
  const center = [29.8643, 77.8961]

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <ClickHandler onPin={onPin} disabled={disabled} />
        <FitBounds pin={submittedPin} actualLocation={actualLocation} />

        {/* Live pin while guessing */}
        {pin && <Marker position={pin} />}

        {/* Submitted pin — stays visible after guess */}
        {submittedPin && <Marker position={submittedPin} />}

        {/* Actual location + line */}
        {actualLocation && (
          <>
            <Marker position={[actualLocation.lat, actualLocation.lng]} icon={actualIcon} />
            {submittedPin && (
              <Polyline
                positions={[[submittedPin.lat, submittedPin.lng], [actualLocation.lat, actualLocation.lng]]}
                color="#f97316"
                weight={2}
                dashArray="6"
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  )
}