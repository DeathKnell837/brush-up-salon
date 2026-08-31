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
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tile layer with dark luxury theme filter (100% Free, zero watermark)
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

      // Custom Luxury Gold DivIcon (Clean SVG without emojis)
      const customIcon = L.divIcon({
        className: 'luxury-map-marker-wrapper',
        html: `
          <div class="luxury-map-pin ${isSelected ? 'selected' : ''}" id="map-pin-${salon.id}">
            <div class="pin-pulse"></div>
            <div class="pin-body">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
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

      // Custom Dark Luxury Popup Card (Zero Emojis, Pure SVG & Typography)
      const popupContent = document.createElement('div');
      popupContent.className = 'luxury-map-popup-card';
      popupContent.innerHTML = `
        <div class="map-popup-img-wrap">
          <img src="${salon.image || '/images/elegant.webp'}" alt="${salon.name}" class="map-popup-img" />
          <div class="map-popup-img-overlay">
            <span class="map-popup-service-count">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
                <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>
              </svg>
              ${salon.services?.length || 0} Services
            </span>
          </div>
        </div>
        <div class="map-popup-body">
          <h4 class="map-popup-title">${salon.name}</h4>
          <p class="map-popup-desc">${salon.description || ''}</p>
          <div class="map-popup-meta">
            <div class="map-popup-meta-row">
              <span class="map-popup-rating">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#c9a84c" stroke="#c9a84c" style="vertical-align: -1px; margin-right: 3px;">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                ${salon.avgRating || '5.0'} 
                <small>(${salon.reviewsCount || (salon.reviews ? salon.reviews.length : 0)} reviews)</small>
              </span>
            </div>
            <div class="map-popup-meta-row">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span class="map-popup-address">${salon.address || 'Midsayap, Cotabato'}</span>
            </div>
            ${salon.hours ? `
              <div class="map-popup-meta-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span class="map-popup-hours">${salon.hours}</span>
              </div>
            ` : ''}
          </div>
          <div class="map-popup-actions">
            <button type="button" class="btn small map-popup-btn" id="btn-view-${salon.id}">
              <span>View Salon & Book</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${salon.coordinates.lat},${salon.coordinates.lng}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="map-popup-dir-link" 
               title="Get Directions on Google Maps">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              Directions
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
            href={`https://www.google.com/maps/search/?api=1&query=${salons[0].coordinates.lat},${salons[0].coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn small map-directions-top-btn"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Open in Google Maps
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
