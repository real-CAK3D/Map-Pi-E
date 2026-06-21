#!/usr/bin/env node
const base = process.env.MAP_PI_BASE_URL || 'http://127.0.0.1:4317';
const checks = [
  ['app html', '/', ['Map-Pi-E Trail Planner', '/src/main.jsx']],
  ['service worker', '/sw.js', ['map-pi-prod-v2', 'shouldUseNetworkFirst']],
  ['geojson', '/trails/grafton-speck-osm.geojson', ['FeatureCollection', 'OpenStreetMap']],
  ['gpx', '/trails/grafton-speck-osm.gpx', ['<gpx', '<trkpt']],
  ['source flow', '/src/main.jsx', ['trail planning flow', 'PlanFlow', 'DirectionFlow', 'PrepFlow', 'HikeFlow', 'ReviewFlow', 'ProfileFlow']],
  ['source saves/weather/layers', '/src/main.jsx', ['Save profile', 'Refresh forecast', 'Save route', 'FEATURE_DEFINITIONS', 'WATER_REPORTS', 'ALT_ROUTE_LIBRARY', 'Show help indicators', 'fetchOpenMeteoForecast', 'saveCloudRecord', 'attributionControl: false']],
  ['styles flow/layers', '/src/styles.css', ['flow-grid', 'flow-tabs', 'save-toast', 'layer-panel', 'help-tip', 'direction-step', 'map-feature-icon', 'Map-Pi-E phone fit fixes', 'leaflet-control-attribution', '.real-map .leaflet-pane svg']],
];
let failed = 0;
for (const [name, path, needles] of checks) {
  const res = await fetch(base + path);
  const text = await res.text();
  const missing = needles.filter((needle) => !text.includes(needle));
  if (!res.ok || missing.length) { failed += 1; console.error(`FAIL ${name}: HTTP ${res.status}; missing ${missing.join(', ')}`); }
  else console.log(`PASS ${name}: HTTP ${res.status}; ${text.length} bytes`);
}
if (failed) process.exit(1);
console.log('Map-Pi flow-cleanup smoke checks passed.');
