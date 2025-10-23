import { useEffect, useMemo, useState } from 'react'
import { GeoJSON, MapContainer, Marker, Popup, TileLayer, useMapEvent } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import './App.css'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const LONDON_COORDINATES = [51.5074, -0.1278]
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

const SOURCE_LABEL = {
  database: 'Seeded dataset (nearest result)',
  'database-fallback': 'Seeded dataset (fallback example)',
  simulated: 'On-the-fly simulation',
}

const ClickHandler = ({ onClick }) => {
  useMapEvent('click', (event) => onClick(event.latlng))
  return null
}

const formatTimestamp = (isoString) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoString))

const toFeature = (zone) => ({
  type: 'Feature',
  properties: {
    id: zone.id,
    color: zone.color,
    name: zone.name,
  },
  geometry: zone.geometry,
})

const zoneStyle = (highlighted, color) => ({
  color,
  fillColor: color,
  weight: highlighted ? 3 : 1.5,
  fillOpacity: highlighted ? 0.2 : 0.08,
})

function App() {
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [zones, setZones] = useState([])
  const [zonesError, setZonesError] = useState('')
  const [selectedZoneId, setSelectedZoneId] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadZones = async () => {
      try {
        const response = await fetch(`${API_URL}/zones`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Unable to load showcase zones.')
        }

        const data = await response.json()
        setZones(data)
        if (data.length > 0) {
          setSelectedZoneId((current) => current || data[0].id)
        }
        setZonesError('')
      } catch (err) {
        if (err.name !== 'AbortError') {
          setZonesError(err.message)
        }
      }
    }

    loadZones()

    return () => controller.abort()
  }, [])

  const zoneFeatures = useMemo(
    () => zones.map((zone) => toFeature(zone)),
    [zones],
  )

  const activeZone = useMemo(
    () => zones.find((zone) => zone.id === selectedZoneId),
    [zones, selectedZoneId],
  )

  const handleMapClick = async ({ lat, lng }) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/property?lat=${lat.toFixed(6)}&lng=${lng.toFixed(6)}`,
      )

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.message ?? 'Unable to fetch property data.')
      }

      const data = await response.json()
      setProperty(data)
      if (data.zone?.id) {
        setSelectedZoneId(data.zone.id)
      }
    } catch (err) {
      setProperty(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="map-wrapper">
        <MapContainer
          center={LONDON_COORDINATES}
          zoom={12}
          scrollWheelZoom
          className="map"
        >
          <TileLayer
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {zoneFeatures.map((feature) => (
            <GeoJSON
              key={feature.properties.id}
              data={feature}
              style={() =>
                zoneStyle(
                  feature.properties.id === selectedZoneId,
                  feature.properties.color,
                )
              }
            />
          ))}
          <ClickHandler onClick={handleMapClick} />
          {property && (
            <Marker
              position={[property.coordinates.lat, property.coordinates.lng]}
            >
              <Popup>
                <div className="popup">
                  <h3>{property.name ?? 'Property Insight'}</h3>
                  {property.address && <p className="address">{property.address}</p>}
                  <p>
                    <strong>Coordinates:</strong>
                    <br />
                    {property.coordinates.lat.toFixed(5)},{' '}
                    {property.coordinates.lng.toFixed(5)}
                  </p>
                  {property.sizeSqm && (
                    <p>
                      <strong>Size:</strong> {property.sizeSqm} m²
                    </p>
                  )}
                  <p>
                    <strong>Valuation:</strong>{' '}
                    {currencyFormatter.format(property.valuationGBP)}
                  </p>
                  {property.rentPerMonth && (
                    <p>
                      <strong>Rent (pcm):</strong>{' '}
                      {currencyFormatter.format(property.rentPerMonth)}
                    </p>
                  )}
                  {property.rentalYield && (
                    <p>
                      <strong>Rental Yield:</strong> {property.rentalYield}%
                    </p>
                  )}
                  {property.zone && (
                    <p>
                      <strong>Zone:</strong> {property.zone.name}
                    </p>
                  )}
                  <p className="updated">Updated {formatTimestamp(property.lastUpdated)}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <aside className="panel">
        <h1>London Property Plotter</h1>
        <p>
          Click inside the highlighted Westminster & Soho showcase zone to reveal
          seeded examples, or explore other locations to see simulated data.
        </p>

        {zonesError && <p className="status error">{zonesError}</p>}

        {activeZone && (
          <section className="zone-card">
            <header>
              <span className="badge" style={{ backgroundColor: activeZone.color }} />
              <div>
                <h2>{activeZone.name}</h2>
                <p>{activeZone.description}</p>
              </div>
            </header>
            <dl>
              {activeZone.summary?.avgValuation && (
                <div>
                  <dt>Avg Valuation</dt>
                  <dd>{currencyFormatter.format(activeZone.summary.avgValuation)}</dd>
                </div>
              )}
              {activeZone.summary?.medianRent && (
                <div>
                  <dt>Median Rent (pcm)</dt>
                  <dd>{currencyFormatter.format(activeZone.summary.medianRent)}</dd>
                </div>
              )}
              {activeZone.summary?.annualTransactions && (
                <div>
                  <dt>Annual Transactions</dt>
                  <dd>{activeZone.summary.annualTransactions.toLocaleString()}</dd>
                </div>
              )}
              {activeZone.summary?.primaryPropertyType && (
                <div>
                  <dt>Typical Stock</dt>
                  <dd>{activeZone.summary.primaryPropertyType}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {loading && <p className="status">Fetching property details…</p>}
        {error && <p className="status error">{error}</p>}

        {property ? (
          <dl className="property-details">
            <div>
              <dt>Latitude</dt>
              <dd>{property.coordinates.lat.toFixed(5)}</dd>
            </div>
            <div>
              <dt>Longitude</dt>
              <dd>{property.coordinates.lng.toFixed(5)}</dd>
            </div>
            <div>
              <dt>Valuation</dt>
              <dd>{currencyFormatter.format(property.valuationGBP)}</dd>
            </div>
            {property.sizeSqm && (
              <div>
                <dt>Size</dt>
                <dd>{property.sizeSqm} m²</dd>
              </div>
            )}
            {property.rentPerMonth && (
              <div>
                <dt>Rent (pcm)</dt>
                <dd>{currencyFormatter.format(property.rentPerMonth)}</dd>
              </div>
            )}
            {property.rentalYield && (
              <div>
                <dt>Rental Yield</dt>
                <dd>{property.rentalYield}%</dd>
              </div>
            )}
            {property.propertyType && (
              <div>
                <dt>Property Type</dt>
                <dd>{property.propertyType}</dd>
              </div>
            )}
            {property.bedrooms && (
              <div>
                <dt>Bedrooms</dt>
                <dd>{property.bedrooms}</dd>
              </div>
            )}
            {property.bathrooms && (
              <div>
                <dt>Bathrooms</dt>
                <dd>{property.bathrooms}</dd>
              </div>
            )}
            {property.zone && (
              <div>
                <dt>Zone</dt>
                <dd>{property.zone.name}</dd>
              </div>
            )}
            {property.source && (
              <div>
                <dt>Source</dt>
                <dd>{SOURCE_LABEL[property.source] ?? property.source}</dd>
              </div>
            )}
            <div>
              <dt>Generated</dt>
              <dd>{formatTimestamp(property.lastUpdated)}</dd>
            </div>
          </dl>
        ) : (
          <p className="hint">No selection yet — tap the map to explore.</p>
        )}

        <p className="footnote">
          Seeded data showcases the Westminster & Soho zone; other areas fall
          back to on-the-fly simulations so you can compare behaviours during the
          interview demo.
        </p>
      </aside>
    </div>
  )
}

export default App
