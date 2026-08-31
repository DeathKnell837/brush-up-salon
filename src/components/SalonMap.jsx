import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Default center of Midsayap, Cotabato
const MIDSAYAP_CENTER = [7.1905, 124.5295];
const DEFAULT_ZOOM = 15;

export default function SalonMap({
  salons = [],
  selectedSalonId = null,
  onSelectSalon = null,
  height = '460px',
  mode = 'multi', // 'multi' or 'single'
  showDirectionsBtn = false
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double initialization

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: MIDSAYAP_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false, // We'll add zoom control at a custom position
      attributionControl: false,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tile layer with dark luxury CSS theme (100% Free, zero watermark)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'luxury-dark-map-tiles',
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Add luxury zoom control in bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add minimal attribution in bottom-left
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('Map data &copy; <a href="https://openstreetmap.org" target="_blank" rel="noreferrer">OpenStreetMap</a>')
      .addTo(map);

    mapInstanceRef.current = map;

    // Handle resize
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
  }, []);

  // Update Markers & Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !salons || salons.length === 0) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    const bounds = L.latLngBounds([]);

    salons.forEach(salon => {
      if (!salon.coordinates || !salon.coordinates.lat || !salon.coordinates.lng) return;

      const latLng = [salon.coordinates.lat, salon.coordinates.lng];
      bounds.extend(latLng);

      const isSelected = selectedSalonId === salon.id;

      // Custom Luxury Gold DivIcon
      const customIcon = L.divIcon({
        className: 'luxury-map-marker-wrapper',
        html: `
          <div class="luxury-map-pin ${isSelected ? 'selected' : ''}" id="map-pin-${salon.id}">
            <div class="pin-pulse"></div>
            <div class="pin-body">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div class="pin-tip"></div>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 48],
        popupAnchor: [0, -48]
      });

      const marker = L.marker(latLng, { icon: customIcon }).addTo(map);

      // Custom Popup HTML
      const popupContent = document.createElement('div');
      popupContent.className = 'luxury-map-popup-card';
      popupContent.innerHTML = `
        <div class="map-popup-img-wrap">
          <img src="${salon.image || '/images/elegant.webp'}" alt="${salon.name}" class="map-popup-img" />
          <div class="map-popup-img-overlay">
            <span class="map-popup-service-count">✂ ${salon.services?.length || 0} Services</span>
          </div>
        </div>
        <div class="map-popup-body">
          <h4 class="map-popup-title">${salon.name}</h4>
          <p class="map-popup-desc">${salon.description || ''}</p>
          <div class="map-popup-meta">
            <span class="map-popup-rating">★ ${salon.avgRating || '5.0'} <small>(${salon.reviewsCount || (salon.reviews ? salon.reviews.length : 0)} reviews)</small></span>
            <span class="map-popup-address">📍 ${salon.address || 'Midsayap, Cotabato'}</span>
            ${salon.hours ? `<span class="map-popup-hours">🕐 ${salon.hours}</span>` : ''}
          </div>
          <div class="map-popup-actions">
            <button type="button" class="btn small map-popup-btn" id="btn-view-${salon.id}">
              View Salon & Book →
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${salon.coordinates.lat},${salon.coordinates.lng}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="map-popup-dir-link" 
               title="Get Directions on Google Maps">
              ↗ Directions
            </a>
          </div>
        </div>
      `;

      // Attach click handler to the View Salon button
      const viewBtn = popupContent.querySelector(`#btn-view-${salon.id}`);
      if (viewBtn && onSelectSalon) {
        viewBtn.addEventListener('click', (e) => {
          e.preventDefault();
          onSelectSalon(salon.id);
        });
      }

      marker.bindPopup(popupContent, {
        maxWidth: 290,
        className: 'luxury-leaflet-popup',
        closeButton: true
      });

      markersRef.current[salon.id] = marker;
    });

    // Auto-fit or pan
    if (mode === 'single' && salons.length === 1 && salons[0].coordinates) {
      map.setView([salons[0].coordinates.lat, salons[0].coordinates.lng], 16, { animate: true });
      if (markersRef.current[salons[0].id]) {
        markersRef.current[salons[0].id].openPopup();
      }
    } else if (selectedSalonId && markersRef.current[selectedSalonId]) {
      const selectedSalon = salons.find(s => s.id === selectedSalonId);
      if (selectedSalon && selectedSalon.coordinates) {
        map.flyTo([selectedSalon.coordinates.lat, selectedSalon.coordinates.lng], 16, { duration: 1 });
        markersRef.current[selectedSalonId].openPopup();
      }
    } else if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [salons, selectedSalonId, mode, onSelectSalon]);

  return (
    <div className="luxury-map-wrapper" style={{ height, width: '100%', position: 'relative' }}>
      <div 
        ref={mapContainerRef} 
        style={{ height: '100%', width: '100%', borderRadius: '16px', overflow: 'hidden' }} 
      />
      {showDirectionsBtn && salons.length === 1 && salons[0]?.coordinates && (
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${salons[0].coordinates.lat},${salons[0].coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn small"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(14, 17, 24, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              color: 'var(--gold)',
              fontSize: '12px',
              padding: '8px 14px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
            }}
          >
            📍 Open in Google Maps ↗
          </a>
        </div>
      )}
    </div>
  );
}
