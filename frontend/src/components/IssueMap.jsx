import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component for selecting location
const LocationMarker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null)

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      onLocationSelect(e.latlng)
    },
  })

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  )
}

const IssueMap = ({ issues, onLocationSelect, selectMode = false, center = [28.6139, 77.2090] }) => {
  const [map, setMap] = useState(null)

  useEffect(() => {
    if (map) {
      map.setView(center, 13)
    }
  }, [center, map])

  // Custom icons for issue status
  const getIssueIcon = (issue) => {
    let color, icon
    
    switch (issue.status) {
      case 'resolved':
        color = 'green'
        icon = 'check'
        break
      case 'in-progress':
      case 'under-review':
        color = 'orange'
        icon = 'tools'
        break
      default:
        color = 'red'
        icon = 'exclamation'
    }
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color}; 
          width: 30px; 
          height: 30px; 
          border-radius: 50%; 
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <i class="fas fa-${icon}" style="color: white; font-size: 12px;"></i>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      whenCreated={setMap}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Selecting mode */}
      {selectMode && <LocationMarker onLocationSelect={onLocationSelect} />}

      {/* Display all issues */}
      {!selectMode &&
        issues.map(issue => {
          if (
            !issue.location ||
            !issue.location.coordinates ||
            issue.location.coordinates.length < 2
          ) {
            return null
          }

          const [lng, lat] = issue.location.coordinates // GeoJSON format

          return (
            <Marker
              key={issue._id}
              position={[lat, lng]} // Leaflet wants [lat, lng]
              icon={getIssueIcon(issue)}
            >
              <Popup>
                <div style={{ padding: '8px', minWidth: '200px' }}>
                  <h3 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--dark)' }}>
                    {issue.title}
                  </h3>
                  <p style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--gray)' }}>
                    {issue.category}
                  </p>

                  <div style={{ 
                    display: 'inline-block', 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    background: issue.status === 'resolved' ? '#d1fae5' : 
                              issue.status === 'in-progress' ? '#dbeafe' : '#fef3c7',
                    color: issue.status === 'resolved' ? '#059669' : 
                          issue.status === 'in-progress' ? '#2563eb' : '#d97706'
                  }}>
                    {issue.status}
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <a 
                      href={`/issue/${issue._id}`}
                      style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        background: 'var(--primary)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })
      }
    </MapContainer>
  )
}

export default IssueMap
