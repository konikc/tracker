import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'
import './App.css'

// Blitzortung API через прокси для обхода CORS
// Используем несколько источников для надёжности
const API_SOURCES = [
  // Основной источник - данные Blitzortung через CORS proxy
  {
    name: 'Blitzortung Region 7 (Europe/Russia)',
    url: 'https://data.blitzortung.org/Data_Region_7/Processed/JSON/Lightning.GeoJSON',
    region: 7
  },
  // Альтернативный регион для Азии/Восточной России
  {
    name: 'Blitzortung Region 6 (Asia)',
    url: 'https://data.blitzortung.org/Data_Region_6/Processed/JSON/Lightning.GeoJSON',
    region: 6
  }
]

// CORS прокси для обхода ограничений (используем публичный proxy)
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

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
  const [alertRadius, setAlertRadius] = useState(50) // km
  const [lastLightningTime, setLastLightningTime] = useState(null)
  const animationFrameRef = useRef(null)

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Ваш браузер не поддерживает уведомления')
      return
    }
    
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setNotificationsEnabled(true)
      new Notification('Уведомления включены', {
        body: 'Вы будете получать уведомления о молниях рядом с вами',
        icon: '/favicon.svg'
      })
    }
  }

  // Get user location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
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
    const R = 6371 // Earth's radius in km
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

  // Fetch lightning data from Blitzortung
  // Используем несколько источников API для надёжности
  const fetchLightningData = useCallback(async () => {
    try {
      const now = Date.now()
      let allLightnings = []
      
      // Пробуем каждый источник API
      for (const source of API_SOURCES) {
        try {
          // Используем CORS proxy для обхода ограничений
          const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(source.url)}&_t=${now}`
          
          const response = await axios.get(proxiedUrl, {
            timeout: 8000,
            headers: {
              'Accept': 'application/json'
            }
          })

          if (response.data && response.data.features) {
            const sourceLightnings = response.data.features.map((feature, index) => {
              const coords = feature.geometry?.coordinates
              if (!coords) return null
              const props = feature.properties || {}
              return {
                id: `${source.region}-${props.id || now}-${index}`,
                lat: coords[1], // GeoJSON: [longitude, latitude]
                lng: coords[0],
                time: props.time ? props.time * 1000 : now, // Blitzortung использует Unix timestamp в секундах
                strength: props.intensity || Math.abs(props.strength) || 0
              }
            }).filter(Boolean) // Убираем null
            
            allLightnings = [...allLightnings, ...sourceLightnings]
          }
        } catch (sourceError) {
          console.warn(`Source ${source.name} failed:`, sourceError.message)
          // Продолжаем с другими источниками
        }
      }

      if (allLightnings.length > 0) {
        setLightnings(prev => {
          const filtered = prev.filter(l => now - l.time < 5 * 60 * 1000)
          const unique = [...filtered]
          
          allLightnings.forEach(newL => {
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
      } else if (lightnings.length === 0) {
        // Если нет данных из API, используем демо-режим
        console.log('No lightning data from API, using demo mode')
      }
    } catch (error) {
      console.error('Error fetching lightning data:', error)
      if (lightnings.length === 0) {
        generateDemoLightning()
      }
    }
  }, [userLocation, alertRadius, sendNotification, playThunderSound, lightnings.length])

  // Generate demo lightning for testing
  const generateDemoLightning = useCallback(() => {
    const russiaBounds = {
      lat: [41, 77],
      lng: [27, 169]
    }
    
    const demoLightning = {
      id: `demo-${Date.now()}`,
      lat: russiaBounds.lat[0] + Math.random() * (russiaBounds.lat[1] - russiaBounds.lat[0]),
      lng: russiaBounds.lng[0] + Math.random() * (russiaBounds.lng[1] - russiaBounds.lng[0]),
      time: Date.now(),
      strength: (Math.random() * 100 - 50).toFixed(1)
    }

    setLightnings(prev => {
      const updated = [...prev, demoLightning].slice(-100)
      
      if (userLocation) {
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          demoLightning.lat, demoLightning.lng
        )
        
        if (distance <= alertRadius) {
          sendNotification(demoLightning)
          playThunderSound()
        }
      } else {
        playThunderSound()
      }
      
      return updated
    })
  }, [userLocation, alertRadius, sendNotification, playThunderSound])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([60, 90], 5)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors | Lightning data: Blitzortung.org',
        maxZoom: 18
      }).addTo(mapRef.current)

      L.control.scale({ imperial: false, metric: true }).addTo(mapRef.current)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Update markers when lightnings change
  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    lightnings.forEach(lightning => {
      const age = Date.now() - lightning.time
      const opacity = Math.max(0.3, 1 - age / (5 * 60 * 1000))
      
      const color = lightning.strength > 0 ? '#ff6b6b' : '#4ecdc4'
      
      const circle = L.circleMarker([lightning.lat, lightning.lng], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: opacity
      }).addTo(mapRef.current)

      circle.bindPopup(`
        <strong>⚡ Удар молнии</strong><br/>
        Время: ${new Date(lightning.time).toLocaleTimeString()}<br/>
        Сила: ${lightning.strength} kA<br/>
        Координаты: ${lightning.lat.toFixed(4)}, ${lightning.lng.toFixed(4)}
      `)

      markersRef.current.push(circle)
    })
  }, [lightnings])

  // Poll for new lightning data
  useEffect(() => {
    fetchLightningData()
    const interval = setInterval(fetchLightningData, 10000)
    return () => clearInterval(interval)
  }, [fetchLightningData])

  // Demo mode - generate random lightning
  useEffect(() => {
    const demoInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        generateDemoLightning()
      }
    }, 3000)
    
    return () => clearInterval(demoInterval)
  }, [generateDemoLightning])

  return (
    <div className="app">
      <div id="map"></div>
      
      <div className="controls-panel">
        <h1>⚡ Карта Молний России</h1>
        <p className="subtitle">Real-time отслеживание ударов молний через Blitzortung</p>
        
        <div className="stats">
          <div className="stat-item">
            <span className="stat-value">{lightnings.length}</span>
            <span className="stat-label">Ударов за 5 мин</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {lastLightningTime 
                ? new Date(lastLightningTime).toLocaleTimeString() 
                : '--:--'}
            </span>
            <span className="stat-label">Последний удар</span>
          </div>
        </div>

        <div className="controls">
          <button 
            onClick={requestNotificationPermission}
            className={`control-btn ${notificationsEnabled ? 'active' : ''}`}
          >
            🔔 Уведомления {notificationsEnabled ? '✓' : ''}
          </button>
          
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`control-btn ${soundEnabled ? 'active' : ''}`}
          >
            🔊 Звук {soundEnabled ? '✓' : ''}
          </button>
          
          <button 
            onClick={getUserLocation}
            className="control-btn"
          >
            📍 Моё место
          </button>
        </div>

        {userLocation && (
          <div className="alert-settings">
            <label>
              Радиус оповещения: {alertRadius} км
              <input
                type="range"
                min="10"
                max="200"
                value={alertRadius}
                onChange={(e) => setAlertRadius(Number(e.target.value))}
              />
            </label>
          </div>
        )}

        <div className="info-panel">
          <h3>ℹ️ О проекте</h3>
          <p>
            Данные предоставляются API <a href="https://blitzortung.org" target="_blank">Blitzortung.org</a>
          </p>
          <p>
            Для работы уведомлений разрешите доступ к геолокации и уведомлениям в браузере.
          </p>
          <p className="note">
            ⚠️ В демо-режиме генерируются случайные молнии для тестирования.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
