import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

// API конфигурация - используем Netlify Functions для обхода CORS
const API_BASE = '/api/blitzortung'
const FALLBACK_TO_DEMO = true

// Sound effect for lightning
const thunderSound = new Audio('/thunder.mp3')
thunderSound.volume = 0.3

function App() {
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const [lightnings, setLightnings] = useState([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [alertRadius, setAlertRadius] = useState(50)
  const [lastLightningTime, setLastLightningTime] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Ваш браузер не поддерживает уведомления')
      return
    }
    
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setNotificationsEnabled(true)
      new Notification('✅ Уведомления включены!', {
        body: 'Вы будете получать оповещения о молниях рядом с вами',
        icon: '/favicon.svg'
      })
    } else {
      alert('Уведомления не разрешены')
    }
  }

  // Get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(loc)
          if (mapRef.current) {
            mapRef.current.setView([loc.lat, loc.lng], 6)
            L.marker([loc.lat, loc.lng], {
              icon: L.divIcon({
                className: 'user-location-marker',
                html: '<div style="background-color: #4285f4; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(66, 133, 244, 0.8);"></div>',
                iconSize: [20, 20]
              })
            }).addTo(mapRef.current).bindPopup('Ваше местоположение').openPopup()
          }
        },
        (error) => {
          console.error('Ошибка получения местоположения:', error)
        }
      )
    }
  }, [])

  // Send notification
  const sendNotification = useCallback((lightning) => {
    if (notificationsEnabled && 'Notification' in window) {
      const distance = userLocation ? calculateDistance(
        userLocation.lat, userLocation.lng,
        lightning.lat, lightning.lng
      ) : null
      
      new Notification('⚡ Удар молнии!', {
        body: distance 
          ? `Молния ударила в ${distance.toFixed(1)} км от вас`
          : 'Зафиксирован удар молнии поблизости',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200],
        requireInteraction: true
      })
    }
  }, [notificationsEnabled, userLocation])

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Play thunder sound
  const playThunderSound = useCallback(() => {
    if (soundEnabled && thunderSound) {
      thunderSound.currentTime = 0
      thunderSound.play().catch(err => console.log('Sound play error:', err))
    }
  }, [soundEnabled])

  // Generate demo lightning for testing
  const generateDemoLightnings = useCallback(() => {
    const russiaBounds = {
      lat: [41, 77],
      lng: [27, 169]
    }
    
    const count = Math.floor(Math.random() * 5) + 3
    const demoLightnings = []
    
    for (let i = 0; i < count; i++) {
      demoLightnings.push({
        id: `demo-${Date.now()}-${i}`,
        lat: russiaBounds.lat[0] + Math.random() * (russiaBounds.lat[1] - russiaBounds.lat[0]),
        lng: russiaBounds.lng[0] + Math.random() * (russiaBounds.lng[1] - russiaBounds.lng[0]),
        time: Date.now(),
        strength: Math.floor(Math.random() * 50) + 10,
        isDemo: true
      })
    }
    
    return demoLightnings
  }, [])

  // Fetch lightning data from Blitzortung via Netlify Function
  const fetchLightningData = useCallback(async () => {
    try {
      const now = Date.now()
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(API_BASE, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      })
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const data = await response.json()
      
      if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
        const newLightnings = data.features.map((feature, index) => {
          const coords = feature.geometry?.coordinates
          if (!coords) return null
          const props = feature.properties || {}
          return {
            id: `blitz-${now}-${index}`,
            lat: coords[1],
            lng: coords[0],
            time: props.time ? props.time * 1000 : now,
            strength: props.intensity || Math.abs(props.strength) || 0
          }
        }).filter(Boolean)
        
        setLightnings(prev => {
          const filtered = prev.filter(l => now - l.time < 5 * 60 * 1000)
          const unique = [...filtered]
          
          let hasNewStrike = false
          newLightnings.forEach(newL => {
            if (!unique.find(l => l.id === newL.id)) {
              unique.push(newL)
              hasNewStrike = true
              
              if (userLocation) {
                const distance = calculateDistance(
                  userLocation.lat, userLocation.lng,
                  newL.lat, newL.lng
                )
                
                if (distance <= alertRadius) {
                  sendNotification(newL)
                  playThunderSound()
                }
              } else {
                playThunderSound()
              }
            }
          })
          
          if (hasNewStrike) setLastLightningTime(now)
          return unique.slice(-100)
        })
      }
    } catch (err) {
      console.error('API Error:', err.message)
      setError(err.message)
      
      if (FALLBACK_TO_DEMO) {
        const demoLightnings = generateDemoLightnings()
        setLightnings(prev => {
          const now = Date.now()
          const filtered = prev.filter(l => now - l.time < 5 * 60 * 1000)
          const unique = [...filtered]
          
          demoLightnings.forEach(newL => {
            if (!unique.find(l => l.id === newL.id)) {
              unique.push(newL)
              
              if (userLocation) {
                const distance = calculateDistance(
                  userLocation.lat, userLocation.lng,
                  newL.lat, newL.lng
                )
                
                if (distance <= alertRadius) {
                  sendNotification(newL)
                  playThunderSound()
                }
              } else {
                playThunderSound()
              }
            }
          })
          
          setLastLightningTime(now)
          return unique.slice(-100)
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [userLocation, alertRadius, sendNotification, playThunderSound, generateDemoLightnings])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([60, 90], 4)
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors | © Blitzortung.org',
        maxZoom: 10,
        minZoom: 3
      }).addTo(mapRef.current)
    }
  }, [])

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
    
    // Add new markers
    lightnings.forEach(lightning => {
      const age = Date.now() - lightning.time
      const opacity = Math.max(0.3, 1 - age / (5 * 60 * 1000))
      
      const color = lightning.isDemo ? '#ff9800' : '#ffeb3b'
      const size = Math.min(20, Math.max(8, lightning.strength / 3))
      
      const marker = L.circleMarker([lightning.lat, lightning.lng], {
        radius: size,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: opacity
      }).addTo(mapRef.current)
      
      marker.bindPopup(`
        <strong>⚡ Молния</strong><br/>
        Время: ${new Date(lightning.time).toLocaleTimeString()}<br/>
        Сила: ${lightning.strength}<br/>
        ${lightning.isDemo ? '(Демо)' : '(Реальные данные)'}
      `)
      
      markersRef.current.push(marker)
    })
  }, [lightnings])

  // Poll for new data
  useEffect(() => {
    fetchLightningData()
    const interval = setInterval(fetchLightningData, 10000)
    return () => clearInterval(interval)
  }, [fetchLightningData])

  // Stats
  const recentLightnings = lightnings.filter(l => Date.now() - l.time < 5 * 60 * 1000)
  const demoCount = recentLightnings.filter(l => l.isDemo).length
  const realCount = recentLightnings.length - demoCount

  return (
    <div className="app">
      <div id="map"></div>
      
      <div className="controls">
        <h1>⚡ Карта Молний России</h1>
        
        <div className="stats">
          <div className="stat">
            <span className="stat-value">{recentLightnings.length}</span>
            <span className="stat-label">Ударов за 5 мин</span>
          </div>
          {realCount > 0 && (
            <div className="stat">
              <span className="stat-value real">{realCount}</span>
              <span className="stat-label">Реальных</span>
            </div>
          )}
          {demoCount > 0 && (
            <div className="stat">
              <span className="stat-value demo">{demoCount}</span>
              <span className="stat-label">Демо</span>
            </div>
          )}
        </div>

        {isLoading && <div className="loading">📡 Загрузка данных...</div>}
        {error && <div className="error">⚠️ {error} (режим демо)</div>}
        
        <div className="control-group">
          <button onClick={requestNotificationPermission} className={!notificationsEnabled ? 'inactive' : ''}>
            🔔 Уведомления {notificationsEnabled ? '✅' : '❌'}
          </button>
          
          <button onClick={() => setSoundEnabled(!soundEnabled)} className={!soundEnabled ? 'inactive' : ''}>
            🔊 Звук {soundEnabled ? '✅' : '❌'}
          </button>
        </div>

        <div className="control-group">
          <label>
            📍 Радиус оповещения: {alertRadius} км
            <input
              type="range"
              min="10"
              max="200"
              value={alertRadius}
              onChange={(e) => setAlertRadius(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="info">
          <p>🗺️ Данные: <a href="https://blitzortung.org" target="_blank" rel="noopener noreferrer">Blitzortung.org</a></p>
          <p>🔄 Обновление: каждые 10 секунд</p>
          {userLocation ? (
            <p>📍 Вы: {userLocation.lat.toFixed(2)}, {userLocation.lng.toFixed(2)}</p>
          ) : (
            <p>📍 Местоположение не определено</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
