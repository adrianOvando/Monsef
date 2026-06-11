import React, { useEffect, useState, useRef } from 'react';

const COLORES_RUTA = ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#4CAF50'];

export default function CapaRutas({ map, rutas = [], recorridos = [] }) {
  const polylinesRef = useRef([]);
  const recorridosRef = useRef([]);
  const infoWindowRef = useRef(null);

  // Cache resolved street-following paths keyed by route ID
  const [resolvedPaths, setResolvedPaths] = useState({});
  const fetchingRef = useRef({});

  useEffect(() => {
    if (!map || !window.google) return;

    // Clean up previous polylines
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    rutas.forEach((ruta, idx) => {
      if (!ruta.activa || !ruta.puntos || ruta.puntos.length < 2) return;

      const drawPolyline = (pathCoords) => {
        const isActual = ruta.tipo === 'actual';
        const polylineOptions = {
          path: pathCoords,
          map,
          geodesic: true,
        };

        if (isActual) {
          polylineOptions.strokeColor = '#E65100';
          polylineOptions.strokeWeight = 4;
          polylineOptions.strokeOpacity = 0;
          polylineOptions.icons = [{
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 1,
              scale: 2.5,
              strokeColor: '#E65100',
              strokeWeight: 4
            },
            offset: '0',
            repeat: '15px'
          }];
        } else {
          polylineOptions.strokeColor = ruta.color || COLORES_RUTA[idx % COLORES_RUTA.length];
          polylineOptions.strokeWeight = 4;
          polylineOptions.strokeOpacity = 1;
        }

        const polyline = new window.google.maps.Polyline(polylineOptions);

        polyline.addListener('click', (e) => {
          if (infoWindowRef.current) infoWindowRef.current.close();
          const iw = new window.google.maps.InfoWindow({
            content: `<div style="font-family:Arial,sans-serif;padding:8px;max-width:220px">
              <strong style="color:#1B5E20">${ruta.nombre}</strong><br/>
              <small>Zona: ${ruta.zona_nombre || '—'}</small><br/>
              <small>Frecuencia: ${ruta.frecuencia || '—'}</small><br/>
              <small>Horario: ${ruta.horario_estimado || '—'}</small><br/>
              <small>Distancia: ${ruta.distancia_km ? ruta.distancia_km + ' km' : '—'}</small>
            </div>`,
            position: e.latLng,
          });
          iw.open(map);
          infoWindowRef.current = iw;
        });

        polylinesRef.current.push(polyline);
      };

      if (resolvedPaths[ruta.id]) {
        drawPolyline(resolvedPaths[ruta.id]);
      } else {
        // Draw straight line fallback immediately
        const fallbackPath = ruta.puntos.map(p => ({ lat: parseFloat(p.lat), lng: parseFloat(p.lng) }));
        drawPolyline(fallbackPath);

        // Fetch driving path from Directions API if not currently fetching
        if (!fetchingRef.current[ruta.id]) {
          fetchingRef.current[ruta.id] = true;

          const directionsService = new window.google.maps.DirectionsService();
          const origin = { lat: parseFloat(ruta.puntos[0].lat), lng: parseFloat(ruta.puntos[0].lng) };
          const destination = { lat: parseFloat(ruta.puntos[ruta.puntos.length - 1].lat), lng: parseFloat(ruta.puntos[ruta.puntos.length - 1].lng) };
          const waypoints = ruta.puntos.slice(1, -1).map(p => ({
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
              pathCoords = result.routes[0].overview_path.map(p => ({ lat: p.lat(), lng: p.lng() }));
            } else {
              // Fallback: straight lines
              pathCoords = fallbackPath;
            }

            setResolvedPaths(prev => ({ ...prev, [ruta.id]: pathCoords }));
          });
        }
      }
    });

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, rutas, resolvedPaths]);

  useEffect(() => {
    if (!map || !window.google) return;
    recorridosRef.current.forEach(p => p.setMap(null));
    recorridosRef.current = [];

    recorridos.forEach((rec) => {
      if (!rec.coordenadas || rec.coordenadas.length < 2) return;
      const path = rec.coordenadas.map(c => ({ lat: parseFloat(c.lat), lng: parseFloat(c.lng) }));
      const poly = new window.google.maps.Polyline({
        path,
        map,
        strokeColor: '#1565C0',
        strokeWeight: 3,
        strokeOpacity: 0.8,
        icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 }, offset: '0', repeat: '12px' }],
      });
      recorridosRef.current.push(poly);
    });

    return () => {
      recorridosRef.current.forEach(p => p.setMap(null));
      recorridosRef.current = [];
    };
  }, [map, recorridos]);

  return null;
}
