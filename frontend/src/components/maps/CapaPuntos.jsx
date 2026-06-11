import React, { useEffect, useRef } from 'react';

const SVG_MARKER = (color) => ({
  path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
  fillColor: color,
  fillOpacity: 1,
  strokeColor: '#fff',
  strokeWeight: 2,
  scale: 10,
});

const NIVEL_COLOR = { alto: '#C62828', medio: '#E65100', bajo: '#F9A825' };
const TIPO_LABEL = {
  acumulacion: 'Acumulación',
  contenedor_desbordado: 'Contenedor desbordado',
  calle_sin_cobertura: 'Calle sin cobertura',
  otro: 'Otro'
};

export default function CapaPuntos({ map, puntos = [], visible = true }) {
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    if (!map || !window.google) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    if (!visible) return;

    puntos.forEach((punto) => {
      const color = NIVEL_COLOR[punto.nivel_criticidad] || '#9E9E9E';
      const marker = new window.google.maps.Marker({
        position: { lat: parseFloat(punto.lat), lng: parseFloat(punto.lng) },
        map,
        title: punto.nombre,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
          scale: 11,
        },
      });

      marker.addListener('click', () => {
        if (infoWindowRef.current) infoWindowRef.current.close();
        const iw = new window.google.maps.InfoWindow({
          content: `<div style="font-family:Arial,sans-serif;padding:8px;max-width:240px">
            <strong style="color:${color}">${punto.nombre}</strong><br/>
            <small><b>Tipo:</b> ${TIPO_LABEL[punto.tipo] || punto.tipo}</small><br/>
            <small><b>Nivel:</b> <span style="color:${color}">${punto.nivel_criticidad}</span></small><br/>
            <small><b>Zona:</b> ${punto.zona_nombre || '—'}</small><br/>
            <small><b>Fecha:</b> ${punto.fecha_registro || '—'}</small><br/>
            ${punto.descripcion ? `<small>${punto.descripcion}</small>` : ''}
          </div>`,
        });
        iw.open(map, marker);
        infoWindowRef.current = iw;
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
    };
  }, [map, puntos, visible]);

  return null;
}
