import { useRef, useState, useCallback } from 'react';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
let scriptLoaded = false;
let scriptLoading = false;
const callbacks = [];

function loadScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) { resolve(); return; }
    if (scriptLoaded) { resolve(); return; }
    callbacks.push({ resolve, reject });
    if (scriptLoading) return;
    scriptLoading = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      callbacks.forEach(cb => cb.resolve());
      callbacks.length = 0;
    };
    script.onerror = (e) => {
      scriptLoading = false;
      callbacks.forEach(cb => cb.reject(e));
      callbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

export function useMapa() {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const initMap = useCallback(async (element, options = {}) => {
    if (!element) return;
    try {
      await loadScript();
      const defaultOptions = {
        center: { lat: -19.060, lng: -65.262 },
        zoom: 15,
        mapTypeId: 'roadmap',
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ],
      };
      const map = new window.google.maps.Map(element, { ...defaultOptions, ...options });
      mapRef.current = map;
      setMapInstance(map);
      setIsLoaded(true);
      return map;
    } catch (err) {
      console.error('Error cargando Google Maps:', err);
    }
  }, []);

  return { mapRef, mapInstance, isLoaded, initMap };
}
