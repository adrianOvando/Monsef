import { useEffect, useRef } from 'react';

// Fallback formula to compute bearing (heading) between two coordinates in degrees
function computeHeadingManual(p1, p2) {
  const lat1 = p1.lat() * Math.PI / 180;
  const lat2 = p2.lat() * Math.PI / 180;
  const lng1 = p1.lng() * Math.PI / 180;
  const lng2 = p2.lng() * Math.PI / 180;
  
  const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

export default function SimulacionCamion({
  map,
  puntosRuta,
  isPlaying,
  speed = 80,
  onProgress,
  onFinished,
  cachedPath,
  onCachePath
}) {
  const markerRef = useRef(null);
  const intervalRef = useRef(null);
  const pathRef = useRef([]);
  const indexRef = useRef(0);

  // Initialize Route Path & Directions
  useEffect(() => {
    if (!map || !puntosRuta || puntosRuta.length < 2) return;

    // SVG path string representing the truck icon for Google Maps Symbol
    const TRUCK_SVG_PATH = "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z";

    const startAnimation = (pathCoords) => {
      pathRef.current = pathCoords;
      indexRef.current = 0;

      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Initial heading
      let initialHeading = 0;
      if (pathCoords.length > 1) {
        if (window.google?.maps?.geometry?.spherical?.computeHeading) {
          initialHeading = window.google.maps.geometry.spherical.computeHeading(pathCoords[0], pathCoords[1]);
        } else {
          initialHeading = computeHeadingManual(pathCoords[0], pathCoords[1]);
        }
      }

      markerRef.current = new window.google.maps.Marker({
        map,
        position: pathCoords[0],
        icon: {
          path: TRUCK_SVG_PATH,
          fillColor: '#1B5E20',
          fillOpacity: 1,
          scale: 1.1,
          strokeWeight: 0,
          anchor: new window.google.maps.Point(12, 12),
          rotation: initialHeading
        },
        zIndex: 999
      });

      if (onProgress) {
        onProgress(0, pathCoords.length);
      }
    };

    if (cachedPath && cachedPath.length > 0) {
      startAnimation(cachedPath);
    } else {
      const directionsService = new window.google.maps.DirectionsService();
      const origin = { lat: parseFloat(puntosRuta[0].lat), lng: parseFloat(puntosRuta[0].lng) };
      const destination = { lat: parseFloat(puntosRuta[puntosRuta.length - 1].lat), lng: parseFloat(puntosRuta[puntosRuta.length - 1].lng) };
      const waypoints = puntosRuta.slice(1, -1).map(p => ({
        location: new window.google.maps.LatLng(parseFloat(p.lat), parseFloat(p.lng)),
        stopover: false
      }));

      directionsService.route({
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false
      }, (result, status) => {
        let pathCoords = [];
        if (status === 'OK') {
          pathCoords = result.routes[0].overview_path;
        } else {
          // Fallback: straight lines between plan points
          console.warn('Directions API returned status:', status, '- falling back to straight lines');
          pathCoords = puntosRuta.map(p => new window.google.maps.LatLng(parseFloat(p.lat), parseFloat(p.lng)));
        }

        if (onCachePath) {
          onCachePath(pathCoords);
        }
        startAnimation(pathCoords);
      });
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [map, puntosRuta, cachedPath]);

  // Handle Playback Interval
  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (pathRef.current.length === 0) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (indexRef.current >= pathRef.current.length - 1) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        if (onFinished) onFinished();
        return;
      }

      const prevPos = pathRef.current[indexRef.current];
      indexRef.current++;
      const nextPos = pathRef.current[indexRef.current];

      if (markerRef.current && window.google) {
        let heading = 0;
        if (window.google.maps.geometry?.spherical?.computeHeading) {
          heading = window.google.maps.geometry.spherical.computeHeading(prevPos, nextPos);
        } else {
          heading = computeHeadingManual(prevPos, nextPos);
        }

        markerRef.current.setPosition(nextPos);
        const icon = markerRef.current.getIcon();
        if (icon && typeof icon === 'object') {
          markerRef.current.setIcon({
            ...icon,
            rotation: heading
          });
        }

        map.panTo(nextPos);
      }

      if (onProgress) {
        onProgress(indexRef.current, pathRef.current.length);
      }
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, onProgress, onFinished, speed, map]);

  return null;
}
