import React, { useEffect, useRef } from 'react';

export default function CapaGeocercas({ map, geocercas = [], visible = true }) {
  const polygonsRef = useRef([]);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    if (!map || !window.google) return;
    polygonsRef.current.forEach(p => p.setMap(null));
    polygonsRef.current = [];

    if (!visible) return;

    geocercas.forEach((geocerca) => {
      let coords = geocerca.poligono_json;
      if (typeof coords === 'string') {
        try { coords = JSON.parse(coords); } catch { return; }
      }
      if (!Array.isArray(coords) || coords.length < 3) return;

      const paths = coords.map(c => ({ lat: parseFloat(c.lat), lng: parseFloat(c.lng) }));

      const polygon = new window.google.maps.Polygon({
        paths,
        map,
        fillColor: '#E65100',
        fillOpacity: 0.15,
        strokeColor: '#E65100',
        strokeWeight: 2,
        strokeOpacity: 0.8,
      });

      polygon.addListener('click', (e) => {
        if (infoWindowRef.current) infoWindowRef.current.close();
        const iw = new window.google.maps.InfoWindow({
          content: `<div style="font-family:Arial,sans-serif;padding:8px;max-width:220px">
            <strong style="color:#E65100">${geocerca.nombre}</strong><br/>
            <small><b>Ruta:</b> ${geocerca.ruta_nombre || '—'}</small><br/>
            <small><b>Radio:</b> ${geocerca.radio_metros || 100}m</small>
          </div>`,
          position: e.latLng,
        });
        iw.open(map);
        infoWindowRef.current = iw;
      });

      polygonsRef.current.push(polygon);
    });

    return () => {
      polygonsRef.current.forEach(p => p.setMap(null));
      polygonsRef.current = [];
    };
  }, [map, geocercas, visible]);

  return null;
}
