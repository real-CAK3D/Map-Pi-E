#!/usr/bin/env node
const base = process.env.MAP_PI_BASE_URL || 'http://127.0.0.1:4317';
const checks = [
  ['app html', '/', ['Map-Pi Trail Buddy', '/src/main.jsx']],
  ['manifest', '/manifest.webmanifest', ['Map-Pi Trail Buddy', 'standalone', '/icon.svg']],
  ['service worker', '/sw.js', ['CACHE_NAME', 'grafton-speck-osm.geojson']],
  ['geojson', '/trails/grafton-speck-osm.geojson', ['FeatureCollection', 'OpenStreetMap']],
  ['gpx', '/trails/grafton-speck-osm.gpx', ['<gpx', '<trkpt']],
  ['source', '/src/main.jsx', ['FieldKit', 'registerServiceWorker', 'gpxTextToGeoJson', 'Export active GPX', 'Supabase-ready schema', 'OpenTopoMap']],
];
let failed = 0;
for (const [name, path, needles] of checks) {
  const url = base + path;
  const res = await fetch(url);
  const text = await res.text();
  const missing = needles.filter((needle) => !text.includes(needle));
  if (!res.ok || missing.length) {
    failed += 1;
    console.error(`FAIL ${name}: HTTP ${res.status}; missing ${missing.join(', ')}`);
  } else {
    console.log(`PASS ${name}: HTTP ${res.status}; ${text.length} bytes`);
  }
}
if (failed) process.exit(1);
console.log('Map-Pi smoke checks passed.');
