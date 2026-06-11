/**
 * MonitoreoRS Sucre — geocerca.js
 * Algoritmo ray-casting point-in-polygon para verificación de geocercas
 */

/**
 * Determina si un punto (lat, lng) está dentro de un polígono.
 * @param {number} lat - Latitud del punto
 * @param {number} lng - Longitud del punto
 * @param {Array<{lat:number, lng:number}>} poligono - Array de vértices del polígono
 * @returns {boolean}
 */
function puntoEnPoligono(lat, lng, poligono) {
  let dentro = false;
  const n = poligono.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = poligono[i].lat;
    const yi = poligono[i].lng;
    const xj = poligono[j].lat;
    const yj = poligono[j].lng;
    const intersecta =
      (yi > lng) !== (yj > lng) &&
      lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersecta) dentro = !dentro;
  }
  return dentro;
}

/**
 * Calcula el porcentaje de cumplimiento de un recorrido respecto a una geocerca.
 * @param {Array<{lat:number, lng:number}>} coordenadasRecorrido
 * @param {Array<{lat:number, lng:number}>} poligonoGeocerca
 * @returns {{ porcentaje: number, dentroCount: number, total: number, detalles: Array }}
 */
function calcularCumplimiento(coordenadasRecorrido, poligonoGeocerca) {
  const total = coordenadasRecorrido.length;
  if (total === 0) return { porcentaje: 0, dentroCount: 0, total: 0, detalles: [] };

  const detalles = coordenadasRecorrido.map((c, idx) => {
    const dentro = puntoEnPoligono(c.lat, c.lng, poligonoGeocerca);
    return { orden: idx + 1, lat: c.lat, lng: c.lng, dentro_geocerca: dentro };
  });

  const dentroCount = detalles.filter(d => d.dentro_geocerca).length;
  const porcentaje = Math.round((dentroCount / total) * 100 * 100) / 100;

  return { porcentaje, dentroCount, total, detalles };
}

module.exports = { puntoEnPoligono, calcularCumplimiento };
