import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AlertTriangle, Backpack, Bluetooth, Camera, Compass, Database, Download, Droplets, Eye, EyeOff, Fish, Flag, GitBranch, HelpCircle, Home, Leaf, ListChecks, LocateFixed, Map, MapPin, Mountain, Navigation, Play, RotateCcw, Route, Save, Send, Settings, ShieldAlert, Smartphone, Square, TentTree, ThermometerSun, Upload, Users, Waves, Wifi } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';

const AT_MILES = 2197.4;

const AREAS = {
  georgia: {
    label: 'Georgia starter route',
    trail: 'Appalachian Trail',
    description: 'Springer Mountain to Neel Gap shakedown stretch.',
    waypoints: [
      { id: 'springer', type: 'Summit', name: 'Springer Mountain', mile: 0, lat: 34.6274, lon: -84.1933, detail: 'Southern terminus. Start plaque and baseline check.', amenities: ['mountain'] },
      { id: 'stover', type: 'Water', name: 'Stover Creek', mile: 2.8, lat: 34.6512, lon: -84.1667, detail: 'Water/filter checkpoint.' },
      { id: 'hawk', type: 'Shelter', name: 'Hawk Mountain Shelter', mile: 8.1, lat: 34.6851, lon: -84.1103, detail: 'Camp/shelter waypoint.', amenities: ['camp'] },
      { id: 'hightower', type: 'Road', name: 'Hightower Gap', mile: 8.6, lat: 34.6898, lon: -84.1014, detail: 'Road crossing and bailout reference.' },
      { id: 'gooch', type: 'Shelter', name: 'Gooch Mountain Shelter', mile: 15.8, lat: 34.7294, lon: -84.0151, detail: 'Shelter and rest point.' },
      { id: 'woody', type: 'Road', name: 'Woody Gap', mile: 20.5, lat: 34.6776, lon: -83.9996, detail: 'Road crossing / possible pickup.' },
      { id: 'blood', type: 'Vista', name: 'Blood Mountain', mile: 29.7, lat: 34.7398, lon: -83.9361, detail: 'High point, weather caution.' },
      { id: 'neel', type: 'Town', name: 'Neel Gap', mile: 31.3, lat: 34.7354, lon: -83.9182, detail: 'Resupply and gear audit.' },
    ],
  },
  nc: {
    label: 'North Carolina approach',
    trail: 'Appalachian Trail',
    description: 'Georgia line to Franklin/Nantahala planning slice.',
    waypoints: [
      { id: 'bly', type: 'Border', name: 'GA/NC Line', mile: 78.2, lat: 34.9877, lon: -83.5606, detail: 'State line milestone.' },
      { id: 'muskrat', type: 'Shelter', name: 'Muskrat Creek Shelter', mile: 81.4, lat: 35.0181, lon: -83.5485, detail: 'Shelter after border climb.' },
      { id: 'standing', type: 'Mountain', name: 'Standing Indian', mile: 86.4, lat: 35.0340, lon: -83.5273, detail: 'Elevation/weather checkpoint.' },
      { id: 'rock-gap', type: 'Road', name: 'Rock Gap', mile: 105.5, lat: 35.0929, lon: -83.5015, detail: 'Road access near Franklin.' },
      { id: 'winding', type: 'Road', name: 'Winding Stair Gap', mile: 109.5, lat: 35.1216, lon: -83.5459, detail: 'Franklin shuttle/drop option.' },
    ],
  },
  smoky: {
    label: 'Smokies planning slice',
    trail: 'Appalachian Trail',
    description: 'Fontana Dam to Newfound Gap high-weather route.',
    waypoints: [
      { id: 'fontana', type: 'Dam', name: 'Fontana Dam', mile: 164.7, lat: 35.4500, lon: -83.8051, detail: 'Permit/weather prep.' },
      { id: 'mollies', type: 'Shelter', name: 'Mollies Ridge Shelter', mile: 176.7, lat: 35.5741, lon: -83.7481, detail: 'Shelter and bear protocol.' },
      { id: 'derrick', type: 'Shelter', name: 'Derrick Knob Shelter', mile: 189.1, lat: 35.6205, lon: -83.6504, detail: 'High ridge sleep option.' },
      { id: 'clingmans', type: 'Summit', name: 'Clingmans Dome', mile: 199.6, lat: 35.5629, lon: -83.4985, detail: 'Major altitude/weather point.' },
      { id: 'newfound', type: 'Road', name: 'Newfound Gap', mile: 207.7, lat: 35.6118, lon: -83.4249, detail: 'Road crossing and exit option.' },
    ],
  },
  nhMaine: {
    label: 'New Hampshire → Katahdin overview',
    trail: 'Appalachian Trail',
    description: 'High-level NH and Maine route spine for northbound planning.',
    waypoints: [
      { id: 'hanover', type: 'Town', name: 'Hanover, NH', mile: 1749.0, lat: 43.7048, lon: -72.2297, detail: 'NH entry trail town and resupply.' },
      { id: 'moosilauke', type: 'Summit', name: 'Mount Moosilauke', mile: 1793.0, lat: 44.0245, lon: -71.8309, detail: 'Major White Mountains climb; weather check.' },
      { id: 'kinsman-notch', type: 'Road', name: 'Kinsman Notch / NH 112', mile: 1803.0, lat: 44.0437, lon: -71.7926, detail: 'Road crossing and access point.' },
      { id: 'franconia', type: 'Notch', name: 'Franconia Notch', mile: 1820.0, lat: 44.1444, lon: -71.6910, detail: 'Major road/access corridor.' },
      { id: 'garfield', type: 'Shelter', name: 'Garfield Ridge area', mile: 1831.0, lat: 44.1876, lon: -71.6102, detail: 'Ridge shelter area; exposed weather.' },
      { id: 'crawford', type: 'Road', name: 'Crawford Notch', mile: 1850.0, lat: 44.2170, lon: -71.4110, detail: 'Road crossing and exit option.' },
      { id: 'mt-washington', type: 'Summit', name: 'Mount Washington', mile: 1859.0, lat: 44.2705, lon: -71.3033, detail: 'Extreme weather checkpoint.' },
      { id: 'pinkham', type: 'Visitor Center', name: 'Pinkham Notch', mile: 1874.0, lat: 44.2576, lon: -71.2537, detail: 'Visitor center/resupply access.' },
      { id: 'gorham', type: 'Town', name: 'Gorham / Rattle River', mile: 1891.0, lat: 44.4580, lon: -71.0844, detail: 'Town access before Mahoosucs.' },
      { id: 'maine-border', type: 'Border', name: 'NH / Maine border', mile: 1906.0, lat: 44.4980, lon: -71.0050, detail: 'State line into the Mahoosuc range.' },
      { id: 'mahoosuc-notch', type: 'Notch', name: 'Mahoosuc Notch', mile: 1910.0, lat: 44.5385, lon: -70.9892, detail: 'Slow boulder notch; plan extra time.' },
      { id: 'speck-pond-overview', type: 'Pond/Shelter', name: 'Speck Pond', mile: 1917.0, lat: 44.5637, lon: -70.9734, detail: 'Pond/shelter area near Old Speck.' },
      { id: 'grafton-26-overview', type: 'Road', name: 'Route 26 / Grafton Notch', mile: 1923.0, lat: 44.5935, lon: -70.9466, detail: 'ME 26 road crossing and parking/access.' },
      { id: 'rangeley', type: 'Town Access', name: 'Rangeley area', mile: 1970.0, lat: 44.8480, lon: -70.6826, detail: 'Maine town/resupply access region.' },
      { id: 'monson', type: 'Town', name: 'Monson', mile: 2075.0, lat: 45.2978, lon: -69.5409, detail: 'Last major trail town before the 100-Mile Wilderness.' },
      { id: 'katahdin', type: 'Terminus', name: 'Katahdin / Baxter Peak', mile: 2197.4, lat: 45.9044, lon: -68.9213, detail: 'Northern terminus.' },
    ],
  },
  graftonSpeck: {
    label: 'Route 26 → Speck Pond field test',
    trail: 'Appalachian Trail / Grafton Notch',
    description: 'Short Maine test route for ME 26 / Grafton Notch to Old Speck and Speck Pond.',
    waypoints: [
      { id: 'rt26-grafton', type: 'Road/Trailhead', name: 'Route 26 / Grafton Notch', mile: 0.0, lat: 44.5935, lon: -70.9466, detail: 'ME 26 trailhead/parking access. Good field-test start point.' },
      { id: 'eyebrow-jct', type: 'Junction', name: 'Eyebrow Trail junction area', mile: 1.1, lat: 44.5865, lon: -70.9498, detail: 'Approximate junction area; confirm with blazes/map on trail.', amenities: ['alternate-route'] },
      { id: 'old-speck', type: 'Summit', name: 'Old Speck Mountain', mile: 3.5, lat: 44.5709, lon: -70.9536, detail: 'Major climb and weather/wind checkpoint.', amenities: ['mountain'] },
      { id: 'mahoosuc-arm', type: 'Mountain', name: 'Mahoosuc Arm', mile: 5.1, lat: 44.5606, lon: -70.9781, detail: 'Steep approach near Speck Pond; take it slow.', amenities: ['mountain'] },
      { id: 'speck-pond', type: 'Pond/Shelter', name: 'Speck Pond', mile: 6.0, lat: 44.5637, lon: -70.9734, detail: 'Your near-term destination/test area. Pond/shelter coordinates from OSM/Nominatim.', amenities: ['water', 'camp', 'fishing-reported'] },
      { id: 'mahoosuc-notch-local', type: 'Notch', name: 'Mahoosuc Notch', mile: 7.4, lat: 44.5385, lon: -70.9892, detail: 'Optional beyond-Speck reference; slow boulder travel.' },
    ],
  },
  maineNorth: {
    label: 'Maine northbound to Katahdin',
    trail: 'Appalachian Trail',
    description: 'Maine-wide planning spine from Grafton Notch toward Baxter Peak.',
    waypoints: [
      { id: 'grafton-26-me', type: 'Road', name: 'Route 26 / Grafton Notch', mile: 1923.0, lat: 44.5935, lon: -70.9466, detail: 'ME 26 access after Speck/Old Speck area.' },
      { id: 'andover', type: 'Town Access', name: 'Andover access area', mile: 1940.0, lat: 44.6348, lon: -70.7509, detail: 'Town access/resupply region.' },
      { id: 'rangeley-me', type: 'Town Access', name: 'Rangeley area', mile: 1970.0, lat: 44.8480, lon: -70.6826, detail: 'Rangeley resupply/road access region.' },
      { id: 'caratunk', type: 'Town Access', name: 'Caratunk / Kennebec crossing', mile: 2037.0, lat: 45.2306, lon: -69.9894, detail: 'Kennebec ferry/logistics checkpoint.' },
      { id: 'monson-me', type: 'Town', name: 'Monson', mile: 2075.0, lat: 45.2978, lon: -69.5409, detail: 'Final major town before the 100-Mile Wilderness.' },
      { id: 'abol-bridge', type: 'Camp/Store', name: 'Abol Bridge area', mile: 2182.0, lat: 45.8350, lon: -68.9910, detail: 'Baxter approach logistics.' },
      { id: 'baxter-peak', type: 'Terminus', name: 'Katahdin / Baxter Peak', mile: 2197.4, lat: 45.9044, lon: -68.9213, detail: 'Northern terminus.' },
    ],
  },
};

const plantSources = [
  'Phone camera/photo upload over hotspot or Tailscale web UI',
  'Offline guide pack candidates: USDA PLANTS, GBIF taxonomy, Wikidata facts, curated local notes',
  'Poison and edible warnings require multiple-source confirmation',
  'Ollama vision should run on stronger local hardware when possible; Pi Zero can queue and display results',
];

const defaultDrops = [
  { id: 'drop-neel', name: 'Neel Gap supply window', mile: 31.3, lat: 34.7354, lon: -83.9182, status: 'Open for requests', supplies: 'Food, socks, water tabs', eta: 'Signal queued until online' },
  { id: 'drop-hiawassee', name: 'Hiawassee shuttle board', mile: 69.2, lat: 34.9496, lon: -83.7577, status: 'Trail-hand planned', supplies: 'Fuel can, battery bank, first-aid', eta: 'Request drafts offline' },
  { id: 'drop-franklin', name: 'Franklin road crossing', mile: 109.5, lat: 35.1216, lon: -83.5459, status: 'Needs confirmation', supplies: 'Meal drop, dry bag swap', eta: 'Send when service returns' },
];

const manualCards = [
  { icon: TentTree, title: 'Fast Camp Setup', text: 'Pick high, durable ground. Check widowmakers, water flow, wind, and local rules before pitching.' },
  { icon: FlameIcon, title: 'Safe Fire Routine', text: 'Use existing rings, clear duff, keep water nearby, follow bans, and cold-out before sleep.' },
  { icon: Droplets, title: 'Water Discipline', text: 'Log source, filter method, liters carried, next known source, and backup purification.' },
  { icon: Leaf, title: 'Plant ID Guardrail', text: 'AI can assist, not certify. Never eat a plant from model output alone.' },
];

function FlameIcon(props) {
  return <span className="emoji-icon" {...props}>🔥</span>;
}

function useStoredState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

function toRad(deg) { return (deg * Math.PI) / 180; }
function haversineMiles(a, b) {
  if (!a || !b || Number.isNaN(a.lat) || Number.isNaN(a.lon) || Number.isNaN(b.lat) || Number.isNaN(b.lon)) return null;
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat/2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
function fmtMiles(value, units = 'miles') {
  if (value == null) return '—';
  if (units === 'km') return `${(value * 1.60934).toFixed(2)} km`;
  return `${value.toFixed(2)} mi`;
}
function parseCoord(text) {
  const parts = text.split(',').map(v => Number(v.trim()));
  if (parts.length !== 2 || parts.some(Number.isNaN)) return null;
  return { lat: parts[0], lon: parts[1] };
}
function routeDistance(waypoints) {
  return waypoints.slice(1).reduce((sum, wp, i) => sum + (haversineMiles(waypoints[i], wp) || 0), 0);
}

function formatDuration(ms) {
  if (ms == null || Number.isNaN(ms)) return '—';
  const total = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}
function getTrailSegments(trailGeometry) {
  return (trailGeometry?.features || []).map(f => f.geometry?.coordinates || []).filter(c => c.length > 1);
}
function getTrailPoints(trailGeometry) {
  return getTrailSegments(trailGeometry).flat();
}
function getTrailMeta(trailGeometry) {
  const points = getTrailPoints(trailGeometry);
  const cumulative = [0];
  for (let i = 1; i < points.length; i += 1) {
    cumulative[i] = cumulative[i - 1] + (haversineMiles({ lon: points[i - 1][0], lat: points[i - 1][1] }, { lon: points[i][0], lat: points[i][1] }) || 0);
  }
  return { points, cumulative, totalMiles: cumulative.at(-1) || 0 };
}
function nearestTrailPoint(point, trailMeta) {
  if (!point || !trailMeta?.points?.length) return null;
  let best = { distance: Infinity, index: -1, coord: null, milesFromStart: 0 };
  trailMeta.points.forEach((coord, index) => {
    const distance = haversineMiles(point, { lon: coord[0], lat: coord[1] });
    if (distance != null && distance < best.distance) best = { distance, index, coord, milesFromStart: trailMeta.cumulative[index] || 0 };
  });
  return best.index >= 0 ? best : null;
}
function snapWaypointToTrail(wp, trailMeta) {
  const snap = nearestTrailPoint(wp, trailMeta);
  if (!snap) return { ...wp, snap: null, displayLat: wp.lat, displayLon: wp.lon };
  return { ...wp, snap, displayLat: snap.coord[1], displayLon: snap.coord[0] };
}
function buildEmergencyText({ settings, current, snappedCurrent, destination, sosMarker }) {
  const loc = sosMarker || current;
  const maps = loc ? `https://maps.google.com/?q=${loc.lat.toFixed(6)},${loc.lon.toFixed(6)}` : 'No location available';
  return `SOS / help marker from ${settings.hikerName || 'Map-Pi user'}\nLocation: ${loc ? `${loc.lat.toFixed(6)}, ${loc.lon.toFixed(6)}` : 'unknown'}\nMap: ${maps}\nDestination: ${destination?.name || 'unknown'}\nTrail snap: ${snappedCurrent ? `${snappedCurrent.distance.toFixed(2)} mi off route, ${snappedCurrent.milesFromStart.toFixed(2)} mi from route start` : 'unavailable'}\nTime: ${new Date().toLocaleString()}\nNote: Map-Pi local SOS marker; live broadcast needs Supabase/backend or cell/satellite relay.`;
}

function registerServiceWorker(setPwaStatus) {
  if (!('serviceWorker' in navigator)) return setPwaStatus('Service worker not supported in this browser.');
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      setPwaStatus(`Offline shell ready · scope ${registration.scope}`);
      registration.update?.();
    })
    .catch((error) => setPwaStatus(`Offline shell registration failed: ${error.message}`));
}
function geoJsonToGpx(featureCollection, name = 'Map-Pi exported route') {
  const segments = (featureCollection?.features || []).map((feature) => feature.geometry?.coordinates || []).filter(coords => coords.length > 1);
  const trksegs = segments.map(coords => `    <trkseg>\n${coords.map(([lon, lat]) => `      <trkpt lat="${Number(lat).toFixed(7)}" lon="${Number(lon).toFixed(7)}" />`).join('\n')}\n    </trkseg>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Map-Pi Trail Buddy" xmlns="http://www.topografix.com/GPX/1/1">\n  <metadata><name>${name}</name></metadata>\n  <trk><name>${name}</name>\n${trksegs}\n  </trk>\n</gpx>\n`;
}
function gpxTextToGeoJson(text, name = 'Imported GPX route') {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) throw new Error('Invalid GPX XML');
  const segments = [...doc.querySelectorAll('trkseg')].map(seg => [...seg.querySelectorAll('trkpt')].map(pt => [Number(pt.getAttribute('lon')), Number(pt.getAttribute('lat'))]).filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat))).filter(coords => coords.length > 1);
  const fallback = [...doc.querySelectorAll('trkpt')].map(pt => [Number(pt.getAttribute('lon')), Number(pt.getAttribute('lat'))]).filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat));
  const finalSegments = segments.length ? segments : (fallback.length > 1 ? [fallback] : []);
  if (!finalSegments.length) throw new Error('No GPX track points found');
  return { type: 'FeatureCollection', name, properties: { source: 'Imported GPX', importedAt: new Date().toISOString() }, features: finalSegments.map((coords, i) => ({ type: 'Feature', properties: { name: `${name} segment ${i + 1}` }, geometry: { type: 'LineString', coordinates: coords } })) };
}
function downloadText(filename, content, type = 'application/gpx+xml') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function calcSunTimes(date, lat, lon) {
  const rad = Math.PI / 180;
  const zenith = 90.833;
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const start = new Date(date.getFullYear(), 0, 0);
  const N = Math.floor((dayStart - start) / 86400000);
  const lngHour = lon / 15;
  const compute = (isRise) => {
    const t = N + (((isRise ? 6 : 18) - lngHour) / 24);
    const M = (0.9856 * t) - 3.289;
    let L = M + (1.916 * Math.sin(rad * M)) + (0.020 * Math.sin(rad * 2 * M)) + 282.634;
    L = (L + 360) % 360;
    let RA = Math.atan(0.91764 * Math.tan(rad * L)) / rad;
    RA = (RA + 360) % 360;
    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = (RA + (Lquadrant - RAquadrant)) / 15;
    const sinDec = 0.39782 * Math.sin(rad * L);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.cos(rad * zenith) - (sinDec * Math.sin(rad * lat))) / (cosDec * Math.cos(rad * lat));
    if (cosH > 1 || cosH < -1) return null;
    let H = isRise ? 360 - (Math.acos(cosH) / rad) : (Math.acos(cosH) / rad);
    H /= 15;
    const T = H + RA - (0.06571 * t) - 6.622;
    const UT = (T - lngHour + 24) % 24;
    const out = new Date(dayStart);
    out.setUTCHours(Math.floor(UT), Math.round((UT % 1) * 60), 0, 0);
    return out;
  };
  const sunrise = compute(true);
  const sunset = compute(false);
  const next = sunrise && date < sunrise ? { label: 'sunrise', time: sunrise } : sunset && date < sunset ? { label: 'sunset', time: sunset } : sunrise ? { label: 'tomorrow sunrise', time: new Date(sunrise.getTime() + 86400000) } : null;
  return { sunrise, sunset, next };
}



const FEATURE_DEFINITIONS = {
  mountains: { label: 'Mountains/summits', icon: '⛰️', color: '#d9d2c3', matches: ['Mountain', 'Summit', 'Terminus', 'mountain'] },
  camps: { label: 'Camp/shelter', icon: '⛺', color: '#e2a241', matches: ['Shelter', 'Camp', 'Pond/Shelter', 'camp'] },
  water: { label: 'Water/streams', icon: '💧', color: '#64d7ff', matches: ['Water', 'Pond', 'Dam', 'Stream', 'water'] },
  fishing: { label: 'Fishing reported', icon: '🐟', color: '#7ee06f', matches: ['fishing-reported'] },
  trailheads: { label: 'Roads/trailheads', icon: '🅿️', color: '#cbd5e1', matches: ['Road', 'Start', 'Trailhead', 'Visitor Center', 'Town Access'] },
  alternates: { label: 'Alternate trails', icon: '↔️', color: '#ff8c42', matches: ['Junction', 'alternate-route'] },
};
const DEFAULT_VISIBILITY = Object.fromEntries(Object.keys(FEATURE_DEFINITIONS).map((key) => [key, true]));
const ROUTE_COLORS = ['#3cff73', '#ffdb77', '#52c7ff', '#ff8c42', '#d47bff', '#ff6f61'];
const WATER_REPORTS = [
  { id: 'bear-river', name: 'Bear River crossing', type: 'Stream', lat: 44.5912, lon: -70.9486, detail: 'Treat/filter. Seasonal flow changes after rain.', amenities: ['water'] },
  { id: 'speck-pond-water', name: 'Speck Pond outlet', type: 'Pond', lat: 44.5634, lon: -70.9731, detail: 'Water present near pond/shelter. Fishing reported; verify local rules and current regulations before casting.', amenities: ['water', 'fishing-reported'] },
  { id: 'cascade-brook', name: 'Cascade Brook area', type: 'Stream', lat: 44.5851, lon: -70.9519, detail: 'Likely water on the approach; confirm in field.', amenities: ['water'] },
];
const ALT_ROUTE_LIBRARY = [
  { id: 'at-main', areaId: 'graftonSpeck', name: 'AT main line', color: ROUTE_COLORS[0], kind: 'Primary', waypointIds: ['rt26-grafton', 'eyebrow-jct', 'old-speck', 'mahoosuc-arm', 'speck-pond'] },
  { id: 'eyebrow-loop', areaId: 'graftonSpeck', name: 'Eyebrow side option', color: ROUTE_COLORS[3], kind: 'Alternate', points: [[44.5935, -70.9466], [44.5891, -70.9447], [44.5842, -70.9476], [44.5865, -70.9498]], note: 'Visible route variation only; verify blaze/signage before using.' },
  { id: 'speck-to-notch', areaId: 'graftonSpeck', name: 'Beyond Speck to Mahoosuc Notch', color: ROUTE_COLORS[2], kind: 'Extension', waypointIds: ['speck-pond', 'mahoosuc-notch-local'] },
];
const FLOW_DIRECTIONS = [
  { title: '1. Pick a route', text: 'Choose area, direction, start, and end. Save the route before field prep so it stays on the device.' },
  { title: '2. Turn layers on/off', text: 'Use map layer toggles for mountains, camp/shelter, water, fishing reports, trailheads, and alternate routes.' },
  { title: '3. Prep offline', text: 'Open Prep, update the device, export GPX/emergency JSON, and confirm weather/vitality before leaving service.' },
  { title: '4. Start hike', text: 'Use Hike view for GPS, next checkpoints, manual position fallback, markers, and SOS marker draft.' },
  { title: '5. Review and adjust', text: 'End/log the hike, review mileage/calories, then update route notes for the next pass.' },
];
function waypointFeatureKeys(item) { const haystack = `${item.type || ''} ${(item.amenities || []).join(' ')}`.toLowerCase(); return Object.entries(FEATURE_DEFINITIONS).filter(([, def]) => def.matches.some(match => haystack.includes(match.toLowerCase()))).map(([key]) => key); }
function featureVisible(item, visibility = DEFAULT_VISIBILITY) { const keys = waypointFeatureKeys(item); return !keys.length || keys.some(key => visibility[key] !== false); }
function featureIcon(item) { const key = waypointFeatureKeys(item)[0]; return FEATURE_DEFINITIONS[key]?.icon || '•'; }
function featureColor(item, fallback = '#bfe0a9') { const key = waypointFeatureKeys(item)[0]; return FEATURE_DEFINITIONS[key]?.color || fallback; }
function routeVariantsForArea(area, route) { const areaId = Object.entries(AREAS).find(([, a]) => a === area)?.[0]; return ALT_ROUTE_LIBRARY.filter(v => v.areaId === areaId).map((variant, idx) => ({ ...variant, color: variant.color || ROUTE_COLORS[idx % ROUTE_COLORS.length], points: variant.points || (variant.waypointIds || []).map(id => route.find(w => w.id === id) || area.waypoints.find(w => w.id === id)).filter(Boolean).map(w => [w.displayLat || w.lat, w.displayLon || w.lon]) })); }
function HelpTip({ enabled, children }) { return enabled ? <p className="help-tip"><HelpCircle size={15}/> {children}</p> : null; }

const ROUTE_LIBRARY_VERSION = 'hiker-map-layers-20260621';
const DEFAULT_WEATHER = { tempF: 72, humidity: 58, airQualityIndex: 38, windMph: 8, condition: 'Partly cloudy', elevationGainFt: 2400, source: 'manual estimate', updatedAt: null };
const DEFAULT_PROFILE = { displayName: 'CAK3D', weightLb: 185, heightIn: 70, age: 35, packWeightLb: 24, restingHeartRate: 68 };
function uid(prefix = 'id') { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function areaRoute(area, planner) { const ordered = planner.direction === 'southbound' ? [...area.waypoints].reverse() : area.waypoints; const startIdx = Math.max(0, ordered.findIndex(w => w.id === planner.startId)); const endIdxRaw = ordered.findIndex(w => w.id === planner.endId); const endIdx = endIdxRaw >= 0 ? endIdxRaw : ordered.length - 1; return { ordered, route: ordered.slice(Math.min(startIdx, endIdx), Math.max(startIdx, endIdx) + 1) }; }
function makeRoutePlan({ planner, area, route, navigation, visibility = 'private' }) { return { id: uid('route'), name: planner.planName || `${area.label} plan`, areaId: planner.area, areaLabel: area.label, direction: planner.direction, startId: planner.startId, endId: planner.endId, destinationId: planner.destinationId, selectedMapId: planner.selectedMapId, destinationMode: planner.destinationMode, destinationName: planner.destinationName, coordText: planner.coordText, visibility, notes: planner.notes || '', status: 'planned', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), estimatedMiles: Number((navigation?.routeMiles || routeDistance(route) || 0).toFixed(2)), waypointCount: route.length }; }
function planToPlanner(plan) { return { area: plan.areaId, direction: plan.direction, startId: plan.startId, endId: plan.endId, destinationMode: plan.destinationMode || 'dropdown', destinationId: plan.destinationId || plan.endId, destinationName: plan.destinationName || '', coordText: plan.coordText || '', notes: plan.notes || '', selectedMapId: plan.selectedMapId || plan.destinationId || plan.endId, planName: plan.name || '', visibility: plan.visibility || 'private' }; }
function estimateWeather(current, manual = DEFAULT_WEATHER) { const tempF = Number(manual.tempF || 65); const humidity = Number(manual.humidity || 50); const windMph = Number(manual.windMph || 0); const aqi = Number(manual.airQualityIndex || 25); const mountainCooling = Math.round((Number(manual.elevationGainFt || 0) / 1000) * 3.2); const heatIndex = tempF >= 80 ? -42.379 + 2.04901523 * tempF + 10.14333127 * humidity - 0.22475541 * tempF * humidity - 0.00683783 * tempF * tempF - 0.05481717 * humidity * humidity + 0.00122874 * tempF * tempF * humidity + 0.00085282 * tempF * humidity * humidity - 0.00000199 * tempF * tempF * humidity * humidity : tempF; const feelsLike = Math.round((tempF >= 80 ? heatIndex : tempF) - Math.min(8, windMph * 0.25) - mountainCooling); const vitality = clamp(100 - Math.max(0, tempF - 72) * 1.4 - Math.max(0, humidity - 55) * 0.32 - Math.max(0, aqi - 50) * 0.28 - Math.max(0, windMph - 15) * 0.5, 35, 100); const risk = vitality > 82 ? 'green' : vitality > 65 ? 'yellow' : 'red'; return { ...manual, lat: current?.lat, lon: current?.lon, feelsLike, vitality: Math.round(vitality), risk, summary: `${manual.condition || 'Field estimate'} · feels ${feelsLike}°F · AQI ${aqi}`, updatedAt: manual.updatedAt || new Date().toISOString() }; }
function estimateCalories({ miles, profile, weather, paceMph }) { const weight = Number(profile.weightLb || 180); const pack = Number(profile.packWeightLb || 0); const base = miles * weight * 0.53; return Math.round(base * (1 + Math.min(0.32, pack / 120)) * (1 + Math.max(0, (Number(weather?.feelsLike || 70) - 70) * 0.006)) * (1 + Math.max(0, Number(paceMph || 2.2) - 2.2) * 0.08)); }
function summarizeStats(hikeLog, activeRouteId) { const completed = hikeLog.filter(h => h.completed !== false); const totalMiles = completed.reduce((sum, h) => sum + Number(h.miles || 0), 0); const totalCalories = completed.reduce((sum, h) => sum + Number(h.calories || 0), 0); const routeMiles = completed.filter(h => h.routeId === activeRouteId).reduce((sum, h) => sum + Number(h.miles || 0), 0); const last = completed.at(-1); return { hikes: completed.length, totalMiles, totalCalories, routeMiles, lastMiles: Number(last?.miles || 0), lastAt: last?.endedAt || last?.createdAt }; }

function App() {
  const [activeTab, setActiveTab] = useStoredState('mapPi.activeTab', 'plan');
  const [saveStatus, setSaveStatus] = useState('');
  const [settings, setSettings] = useStoredState('mapPi.settings', { units: 'miles', paceMph: 2.2, autoEndRadiusMiles: 0.12, theme: 'forest', hikerName: 'CAK3D', mapLayer: 'osm', fitMode: 'trail', showCurrentWhenFar: false, fieldMode: false, helpEnabled: true, mapFeatureVisibility: DEFAULT_VISIBILITY, routePalette: ROUTE_COLORS });
  const [planner, setPlanner] = useStoredState('mapPi.planner', { area: 'graftonSpeck', direction: 'northbound', startId: 'rt26-grafton', endId: 'speck-pond', destinationMode: 'dropdown', destinationId: 'speck-pond', destinationName: '', coordText: '44.5637, -70.9734', notes: 'Field test: Route 26 / Grafton Notch to Speck Pond.', selectedMapId: 'speck-pond', planName: 'Route 26 to Speck Pond field plan', visibility: 'private' });
  const [routePlans, setRoutePlans] = useStoredState('mapPi.routePlans', []);
  const [activeRoutePlanId, setActiveRoutePlanId] = useStoredState('mapPi.activeRoutePlanId', null);
  const [savedMarkers, setSavedMarkers] = useStoredState('mapPi.savedMarkers', []);
  const [userProfile, setUserProfile] = useStoredState('mapPi.userProfile', DEFAULT_PROFILE);
  const [weatherInput, setWeatherInput] = useStoredState('mapPi.weatherInput', DEFAULT_WEATHER);
  const [hikeLog, setHikeLog] = useStoredState('mapPi.hikeLog', []);
  const [hike, setHike] = useStoredState('mapPi.hike', { active: false, startedAt: null, endedAt: null, completed: false, requestQueue: [] });
  const [manualPosition, setManualPosition] = useStoredState('mapPi.manualPosition', { lat: 44.5935, lon: -70.9466, label: 'Route 26 / Grafton Notch manual start' });
  const [position, setPosition] = useState(null);
  const [trailGeometry, setTrailGeometry] = useState(null);
  const [trailGeometryStatus, setTrailGeometryStatus] = useState('Loading trail geometry…');
  const [lastKnownLocation, setLastKnownLocation] = useStoredState('mapPi.lastKnownLocation', null);
  const [sosMarker, setSosMarker] = useStoredState('mapPi.sosMarker', null);
  const [geoWatchId, setGeoWatchId] = useState(null);
  const [geoStatus, setGeoStatus] = useState('Idle — use phone GPS or manual coordinates.');
  const [pwaStatus, setPwaStatus] = useState('Offline shell not registered yet.');
  const [importedTrailGeometry, setImportedTrailGeometry] = useStoredState('mapPi.importedTrailGeometry', null);
  const [fieldKitStamp, setFieldKitStamp] = useStoredState('mapPi.fieldKitStamp', null);

  const flashSaved = (msg) => { setSaveStatus(msg); setTimeout(() => setSaveStatus(''), 3000); };
  useEffect(() => { registerServiceWorker(setPwaStatus); }, []);
  useEffect(() => { fetch('/trails/grafton-speck-osm.geojson').then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(data => { setTrailGeometry(data); setTrailGeometryStatus(`Loaded ${data?.features?.length || 0} OSM trail segment(s).`); }).catch(e => setTrailGeometryStatus(`Trail geometry unavailable: ${e.message}`)); }, []);

  const activeTrailGeometry = importedTrailGeometry || trailGeometry;
  const area = AREAS[planner.area] || AREAS.graftonSpeck;
  const { ordered, route } = areaRoute(area, planner);
  const current = position || lastKnownLocation || manualPosition;
  const trailMeta = useMemo(() => getTrailMeta(activeTrailGeometry), [activeTrailGeometry]);
  const snappedRoute = useMemo(() => planner.area === 'graftonSpeck' ? route.map(w => snapWaypointToTrail(w, trailMeta)) : route, [route, trailMeta, planner.area]);
  const snappedCurrent = useMemo(() => nearestTrailPoint(current, trailMeta), [current, trailMeta]);
  const weather = useMemo(() => estimateWeather(current, weatherInput), [current, weatherInput]);
  const sunInfo = useMemo(() => calcSunTimes(new Date(), current.lat, current.lon), [current.lat, current.lon]);
  const destination = useMemo(() => planner.destinationMode === 'coords' && parseCoord(planner.coordText) ? { ...parseCoord(planner.coordText), name: planner.destinationName || 'Custom coordinate', type: 'Custom' } : area.waypoints.find(w => w.id === (planner.destinationMode === 'map' ? planner.selectedMapId : planner.destinationId)) || route.at(-1), [planner, area.waypoints, route]);
  const navigation = useMemo(() => { const distances = snappedRoute.map(w => ({ ...w, distance: haversineMiles(current, { lat: w.displayLat || w.lat, lon: w.displayLon || w.lon }) ?? Infinity })); const nearest = distances.reduce((best, item, idx) => item.distance < best.distance ? { ...item, idx } : best, { distance: Infinity, idx: 0 }); const next = distances.find((_, idx) => idx > nearest.idx) || distances.at(-1); const toDestination = haversineMiles(current, destination); const routeMiles = trailMeta.totalMiles || routeDistance(snappedRoute); const progress = Math.min(100, Math.max(0, (((nearest.mile || route[0]?.mile || 0) - (route[0]?.mile || 0)) / Math.max(0.01, trailMeta.totalMiles || Math.abs((snappedRoute.at(-1)?.mile || 0) - (snappedRoute[0]?.mile || 0)))) * 100)); return { nearest, next, toDestination, routeMiles, progress, snappedCurrent, calories: estimateCalories({ miles: routeMiles, profile: userProfile, weather, paceMph: settings.paceMph }) }; }, [snappedRoute, current, destination, route, trailMeta, userProfile, weather, settings.paceMph]);
  const stats = useMemo(() => summarizeStats(hikeLog, activeRoutePlanId), [hikeLog, activeRoutePlanId]);

  const setPlannerPatch = (patch) => setPlanner(prev => ({ ...prev, ...patch }));
  const savePlan = (asNew = false) => { const existing = routePlans.find(r => r.id === activeRoutePlanId); const plan = makeRoutePlan({ planner, area, route: snappedRoute, navigation, visibility: planner.visibility || existing?.visibility || 'private' }); if (!asNew && existing) { plan.id = existing.id; plan.createdAt = existing.createdAt; setRoutePlans(prev => prev.map(r => r.id === existing.id ? plan : r)); setActiveRoutePlanId(existing.id); flashSaved('Route updated and saved on this device.'); } else { setRoutePlans(prev => [plan, ...prev]); setActiveRoutePlanId(plan.id); flashSaved('New route saved on this device.'); } };
  const loadPlan = (plan) => { setPlanner(planToPlanner(plan)); setActiveRoutePlanId(plan.id); setActiveTab('plan'); flashSaved(`Loaded ${plan.name}.`); };
  const saveProfile = () => flashSaved('Profile, settings, and weather saved on this device.');
  const refreshWeather = () => { setWeatherInput(w => ({ ...w, source: position ? 'live GPS + manual conditions' : 'last-known/manual conditions', updatedAt: new Date().toISOString() })); flashSaved('Weather refreshed from last-known/manual conditions.'); };
  const addMarker = (point, name = 'Saved marker') => { const marker = { id: uid('marker'), name, category: 'Scout later', visibility: 'private', lat: Number(point.displayLat || point.lat), lon: Number(point.displayLon || point.lon), note: '', createdAt: new Date().toISOString() }; setSavedMarkers(prev => [marker, ...prev]); flashSaved('Marker saved on this device.'); };
  const getLocation = () => { if (!navigator.geolocation) return setGeoStatus('Geolocation is not available.'); setGeoStatus('Starting live GPS watch…'); if (geoWatchId != null) navigator.geolocation.clearWatch(geoWatchId); const watchId = navigator.geolocation.watchPosition(pos => { const live = { lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy, label: 'Live phone GPS', timestamp: new Date(pos.timestamp).toLocaleString() }; setPosition(live); setLastKnownLocation(live); setGeoStatus(`Live GPS · ±${Math.round(pos.coords.accuracy || 0)}m · ${live.timestamp}`); setWeatherInput(w => ({ ...w, source: 'live GPS + manual conditions', updatedAt: new Date().toISOString() })); }, err => setGeoStatus(`Location unavailable: ${err.message}`), { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 }); setGeoWatchId(watchId); };
  const stopLiveTracking = () => { if (geoWatchId != null && navigator.geolocation) navigator.geolocation.clearWatch(geoWatchId); setGeoWatchId(null); setGeoStatus('Live GPS stopped. Last known location stays saved.'); };
  const startHike = () => { setHike(h => ({ ...h, active: true, startedAt: new Date().toISOString(), endedAt: null, completed: false, routeId: activeRoutePlanId, routeName: planner.planName || area.label })); setFieldKitStamp(new Date().toISOString()); setActiveTab('hike'); flashSaved('Hike initiated. Field view is live.'); };
  const endHike = () => { const endedAt = new Date().toISOString(); const miles = Number((navigation.progress > 0 ? navigation.routeMiles * (navigation.progress / 100) : navigation.routeMiles).toFixed(2)); const calories = estimateCalories({ miles, profile: userProfile, weather, paceMph: settings.paceMph }); setHike(h => ({ ...h, active: false, endedAt, completed: true })); setHikeLog(prev => [{ id: uid('hike'), routeId: activeRoutePlanId, routeName: planner.planName || area.label, miles, calories, startedAt: hike.startedAt || endedAt, endedAt, completed: true, weather, createdAt: endedAt }, ...prev]); setActiveTab('review'); flashSaved('Hike ended and logged.'); };
  const exportActiveGpx = () => downloadText('map-pi-active-route.gpx', geoJsonToGpx(activeTrailGeometry, area.label));
  const importGpxFile = async (file) => { if (!file) return; const geo = gpxTextToGeoJson(await file.text(), file.name.replace(/\.gpx$/i, '')); setImportedTrailGeometry(geo); flashSaved('GPX imported for this device.'); };
  const exportEmergencyJson = () => downloadText('map-pi-emergency-state.json', JSON.stringify({ planner, routePlans, savedMarkers, hike, current, destination, userProfile, weather, stats, exportedAt: new Date().toISOString() }, null, 2), 'application/json');
  const clearData = () => { localStorage.clear(); flashSaved('Local device data cleared. Refresh to reset fully.'); };
  const tabs = [['plan', 'Plan', Map], ['directions', 'Guide', Route], ['prep', 'Prep', Backpack], ['hike', 'Hike', Navigation], ['review', 'Review', Activity], ['profile', 'Profile', Settings]];

  return <main className={`app-shell flow-shell theme-${settings.theme} ${settings.fieldMode ? 'field-mode' : ''}`}>
    <header className="app-header glass"><div><p className="eyebrow"><MapPin size={16}/> Map-Pi controlled hike flow</p><h1>Trail Buddy</h1><p>{planner.planName || area.label} · {hike.active ? 'Hike active' : 'Plan ready'}</p></div><div className={`status-pill risk-${weather.risk}`}><Wifi size={16}/> {weather.summary}</div></header>
    {saveStatus && <div className="save-toast"><Save size={16}/> {saveStatus}</div>}
    <nav className="tab-bar flow-tabs glass">{tabs.map(([id, label, Icon]) => <button key={id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}><Icon size={17}/><span>{label}</span></button>)}</nav>
    {activeTab === 'plan' && <PlanFlow area={area} ordered={ordered} route={snappedRoute} planner={planner} setPlannerPatch={setPlannerPatch} destination={destination} navigation={navigation} trailGeometry={activeTrailGeometry} settings={settings} setSettings={setSettings} markers={savedMarkers} savePlan={savePlan} loadPlan={loadPlan} routePlans={routePlans} addMarker={addMarker} setActiveTab={setActiveTab} />}
    {activeTab === 'directions' && <DirectionFlow settings={settings} setActiveTab={setActiveTab} route={snappedRoute} planner={planner} weather={weather} navigation={navigation} />}
    {activeTab === 'prep' && <PrepFlow pwaStatus={pwaStatus} route={snappedRoute} planner={planner} destination={destination} weather={weather} stats={stats} markers={savedMarkers} fieldKitStamp={fieldKitStamp} setFieldKitStamp={setFieldKitStamp} importGpxFile={importGpxFile} exportActiveGpx={exportActiveGpx} exportEmergencyJson={exportEmergencyJson} setActiveTab={setActiveTab} savePlan={savePlan} startHike={startHike} trailGeometryStatus={trailGeometryStatus} />}
    {activeTab === 'hike' && <HikeFlow route={snappedRoute} current={current} destination={destination} navigation={navigation} settings={settings} trailGeometry={activeTrailGeometry} markers={savedMarkers} weather={weather} hike={hike} geoStatus={geoStatus} getLocation={getLocation} stopLiveTracking={stopLiveTracking} startHike={startHike} endHike={endHike} setManualPosition={setManualPosition} addMarker={addMarker} sosMarker={sosMarker} setSosMarker={setSosMarker} />}
    {activeTab === 'review' && <ReviewFlow stats={stats} hikeLog={hikeLog} setHikeLog={setHikeLog} routePlans={routePlans} markers={savedMarkers} loadPlan={loadPlan} settings={settings} />}
    {activeTab === 'profile' && <ProfileFlow settings={settings} setSettings={setSettings} profile={userProfile} setProfile={setUserProfile} weatherInput={weatherInput} setWeatherInput={setWeatherInput} weather={weather} refreshWeather={refreshWeather} saveProfile={saveProfile} clearData={clearData} />}
    <footer>Local-first. Public routes, markers, live weather, and sharing need backend/API approval later.</footer>
  </main>;
}

function PlanFlow({ area, ordered, route, planner, setPlannerPatch, destination, navigation, trailGeometry, settings, setSettings, markers, savePlan, loadPlan, routePlans, addMarker, setActiveTab }) {
  return <section className="flow-grid"><section className="panel glass flow-card"><div className="section-title"><Map/> 1 · Set route</div><label>Plan name<input value={planner.planName || ''} onChange={e => setPlannerPatch({ planName: e.target.value })} /></label><div className="compact-grid"><label>Area<select value={planner.area} onChange={e => setPlannerPatch({ area: e.target.value, startId: AREAS[e.target.value].waypoints[0].id, endId: AREAS[e.target.value].waypoints.at(-1).id, destinationId: AREAS[e.target.value].waypoints.at(-1).id })}>{Object.entries(AREAS).map(([id, a]) => <option key={id} value={id}>{a.label}</option>)}</select></label><label>Direction<select value={planner.direction} onChange={e => setPlannerPatch({ direction: e.target.value })}><option value="northbound">Northbound</option><option value="southbound">Southbound</option></select></label><label>Start<select value={planner.startId} onChange={e => setPlannerPatch({ startId: e.target.value })}>{ordered.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label><label>End<select value={planner.endId} onChange={e => setPlannerPatch({ endId: e.target.value, destinationId: e.target.value })}>{ordered.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label></div><textarea value={planner.notes || ''} onChange={e => setPlannerPatch({ notes: e.target.value })} placeholder="Parking, water, bailouts, gear notes…" /><div className="button-row"><button className="primary" onClick={() => savePlan(false)}><Save size={16}/> Save route</button><button className="secondary" onClick={() => savePlan(true)}>Save copy</button><button className="secondary" onClick={() => setActiveTab('prep')}>Prep hike →</button></div></section><section className="panel glass flow-card"><div className="section-title"><ListChecks/> Checkpoints</div><div className="chip-row">{route.map((w, idx) => <button key={w.id} onClick={() => setPlannerPatch({ destinationId: w.id })}>{idx + 1}. {w.name}</button>)}</div><div className="mini-stats"><span>{route.length} checkpoints</span><span>{fmtMiles(navigation.routeMiles)}</span><span>{navigation.calories} cal est.</span></div><HelpTip enabled={settings.helpEnabled}>Waypoints become the visible route sequence. Save extra places as markers so later backend sync can choose private/public visibility.</HelpTip><p className="muted">Waypoints are the route checkpoints. Custom pins go on the map as markers.</p></section><section className="trail-map glass flow-map"><div className="section-title"><MapPin/> Map + route pins</div><MapLayerControls settings={settings} setSettings={setSettings} /><HelpTip enabled={settings.helpEnabled}>Tap map pins for details. Use eye toggles to hide clutter when you only need the next decision point.</HelpTip><RouteMap area={area} route={route} current={null} destination={destination} onPick={(wp) => setPlannerPatch({ selectedMapId: wp.id, destinationMode: 'map', destinationId: wp.id })} trailGeometry={trailGeometry} settings={settings} markers={markers} /><div className="button-row"><button onClick={() => destination && addMarker(destination, destination.name)}>Save destination marker</button></div></section><section className="panel glass flow-card"><div className="section-title"><GitBranch/> Saved routes</div>{routePlans.slice(0, 4).map(plan => <article className="compact-row" key={plan.id}><span><strong>{plan.name}</strong><small>{plan.estimatedMiles} mi · {plan.waypointCount} stops</small></span><button onClick={() => loadPlan(plan)}>Load</button></article>)}{!routePlans.length && <p className="muted">Save this route to start your route list.</p>}</section></section>;
}
function MapLayerControls({ settings, setSettings }) { const visibility = { ...DEFAULT_VISIBILITY, ...(settings.mapFeatureVisibility || {}) }; const toggle = (key) => setSettings(prev => ({ ...prev, mapFeatureVisibility: { ...DEFAULT_VISIBILITY, ...(prev.mapFeatureVisibility || {}), [key]: visibility[key] === false } })); return <div className="layer-panel"><strong>Visible map icons</strong><div className="layer-grid">{Object.entries(FEATURE_DEFINITIONS).map(([key, def]) => <button type="button" key={key} className={visibility[key] === false ? 'off' : 'on'} onClick={() => toggle(key)}>{visibility[key] === false ? <EyeOff size={14}/> : <Eye size={14}/>} <span>{def.icon}</span> {def.label}</button>)}</div></div>; }
function DirectionFlow({ settings, setActiveTab, route, planner, weather, navigation }) { return <section className="flow-grid"><section className="panel glass flow-card"><div className="section-title"><Route/> Direction sequence</div><HelpTip enabled={settings.helpEnabled}>This tab is the plain-language order of operations for a hiker. It stays separate from the map so field mode can be quick and readable.</HelpTip>{FLOW_DIRECTIONS.map((step, idx) => <article className="direction-step" key={step.title}><strong>{step.title}</strong><p>{step.text}</p>{idx === 0 && <small>Current plan: {planner.planName || 'unnamed route'} · {route[0]?.name} to {route.at(-1)?.name}</small>}{idx === 2 && <small>Current field estimate: {weather.summary}</small>}</article>)}<div className="button-row"><button className="primary" onClick={() => setActiveTab('prep')}>Go to prep</button><button className="secondary" onClick={() => setActiveTab('plan')}>Back to map</button></div></section><section className="panel glass flow-card"><div className="section-title"><ListChecks/> Route order</div>{route.map((w, idx) => <article className="compact-row" key={w.id}><span><strong>{idx + 1}. {w.name}</strong><small>{featureIcon(w)} {w.type} · mile {w.mile} · {w.detail}</small></span></article>)}<p className="muted">Estimated route: {fmtMiles(navigation.routeMiles, settings.units)} · {navigation.calories} cal. Map-Pi assists; still carry offline maps, compass, and emergency tools.</p></section></section>; }
function PrepFlow({ pwaStatus, route, planner, destination, weather, stats, markers, fieldKitStamp, setFieldKitStamp, importGpxFile, exportActiveGpx, exportEmergencyJson, setActiveTab, savePlan, startHike, trailGeometryStatus }) { const updateDevice = () => { setFieldKitStamp(new Date().toISOString()); savePlan(false); }; return <section className="flow-grid"><section className="panel glass flow-card"><div className="section-title"><Smartphone/> 2 · Device prep</div><p className="muted">{pwaStatus}</p><div className="mini-stats"><span>Last update: {fieldKitStamp ? new Date(fieldKitStamp).toLocaleString() : 'never'}</span><span>{markers.length} markers</span><span>{route.length} checkpoints</span></div><button className="primary" onClick={updateDevice}>Save/update this device</button></section><section className="panel glass flow-card"><div className="section-title"><Flag/> Active hike recap</div><ul className="info-list"><li>{planner.planName}</li><li>{route[0]?.name} → {route.at(-1)?.name}</li><li>Destination: {destination?.name}</li><li>{weather.summary} · vitality {weather.vitality}%</li><li>{trailGeometryStatus}</li></ul></section><section className="panel glass flow-card"><div className="section-title"><GitBranch/> Import/export</div><label className="upload-box compact"><Upload/><span>Import GPX</span><input type="file" accept=".gpx,application/gpx+xml,text/xml" onChange={e => importGpxFile(e.target.files?.[0])} /></label><div className="button-row"><button onClick={exportActiveGpx}>Export GPX</button><button onClick={exportEmergencyJson}>Export emergency JSON</button></div></section><section className="panel glass flow-card"><div className="section-title"><Play/> Ready?</div><p className="muted">This is the launch pad: update the device, check the recap, then start the hike.</p><button className="primary big-action" onClick={startHike}>Initiate hike</button><button className="secondary" onClick={() => setActiveTab('plan')}>Back to plan</button><p className="muted">All-time: {fmtMiles(stats.totalMiles)} · {stats.hikes} hikes logged.</p></section></section>; }
function HikeFlow({ route, current, destination, navigation, settings, trailGeometry, markers, weather, hike, geoStatus, getLocation, stopLiveTracking, startHike, endHike, setManualPosition, addMarker, sosMarker, setSosMarker }) { return <section className="flow-grid"><section className="trail-map glass flow-map"><div className="section-title"><Navigation/> 3 · Hike view</div><RouteMap area={null} route={route} current={current} destination={destination} onPick={(wp) => setManualPosition({ lat: wp.displayLat || wp.lat, lon: wp.displayLon || wp.lon, label: wp.name })} trailGeometry={trailGeometry} navigation={navigation} settings={settings} markers={markers} sosMarker={sosMarker} /></section><section className="panel glass flow-card"><div className="section-title"><Activity/> Controls</div><div className="mini-stats"><span>{fmtMiles(navigation.toDestination, settings.units)} to destination</span><span>{navigation.calories} cal est.</span><span>Vitality {weather.vitality}%</span></div><p className="muted">{geoStatus}</p><div className="button-row"><button className="primary" onClick={getLocation}>Start GPS</button><button onClick={stopLiveTracking}>Stop GPS</button>{hike.active ? <button className="danger" onClick={endHike}>End + log hike</button> : <button className="primary" onClick={startHike}>Start hike</button>}<button onClick={() => addMarker(current, 'Current spot')}>Mark spot</button><button className="danger" onClick={() => setSosMarker({ ...current, createdAt: new Date().toLocaleString() })}>SOS marker</button></div></section><section className="panel glass flow-card"><div className="section-title"><ListChecks/> Next checkpoints</div>{route.slice(0, 6).map(w => <button className="waypoint-button" key={w.id} onClick={() => setManualPosition({ lat: w.displayLat || w.lat, lon: w.displayLon || w.lon, label: w.name })}><strong>{w.name}</strong><span>{w.type} · {fmtMiles(haversineMiles(current, { lat: w.displayLat || w.lat, lon: w.displayLon || w.lon }), settings.units)}</span></button>)}</section></section>; }
function ReviewFlow({ stats, hikeLog, setHikeLog, routePlans, markers, loadPlan, settings }) { return <section className="flow-grid"><section className="panel glass flow-card"><div className="section-title"><Activity/> 4 · Review</div><div className="mini-stats"><span>All-time {fmtMiles(stats.totalMiles, settings.units)}</span><span>Last {fmtMiles(stats.lastMiles, settings.units)}</span><span>{stats.totalCalories} cal</span><span>{markers.length} markers</span></div>{hikeLog.slice(0, 5).map(h => <article className="compact-row" key={h.id}><span><strong>{h.routeName}</strong><small>{h.miles} mi · {h.calories} cal</small></span></article>)}<button className="danger" onClick={() => setHikeLog([])}>Clear hike log</button></section><section className="panel glass flow-card"><div className="section-title"><GitBranch/> Route list</div>{routePlans.slice(0, 6).map(plan => <article className="compact-row" key={plan.id}><span><strong>{plan.name}</strong><small>{plan.estimatedMiles} mi · {plan.visibility}</small></span><button onClick={() => loadPlan(plan)}>Plan again</button></article>)}</section></section>; }
function ProfileFlow({ settings, setSettings, profile, setProfile, weatherInput, setWeatherInput, weather, refreshWeather, saveProfile, clearData }) { const patchSettings = p => setSettings(prev => ({ ...prev, ...p })); const patchProfile = p => setProfile(prev => ({ ...prev, ...p })); const patchWeather = p => setWeatherInput(prev => ({ ...prev, ...p })); return <section className="flow-grid"><section className="panel glass flow-card"><div className="section-title"><Settings/> 5 · User profile</div><div className="compact-grid"><label>Name<input value={profile.displayName} onChange={e => patchProfile({ displayName: e.target.value })} /></label><label>Weight lb<input type="number" value={profile.weightLb} onChange={e => patchProfile({ weightLb: Number(e.target.value) })} /></label><label>Height in<input type="number" value={profile.heightIn} onChange={e => patchProfile({ heightIn: Number(e.target.value) })} /></label><label>Age<input type="number" value={profile.age} onChange={e => patchProfile({ age: Number(e.target.value) })} /></label><label>Pack lb<input type="number" value={profile.packWeightLb} onChange={e => patchProfile({ packWeightLb: Number(e.target.value) })} /></label><label>Pace mph<input type="number" step="0.1" value={settings.paceMph} onChange={e => patchSettings({ paceMph: Number(e.target.value) })} /></label></div><button className="primary" onClick={saveProfile}><Save size={16}/> Save profile</button></section><section className="panel glass flow-card"><div className="section-title"><ThermometerSun/> Weather · live/last-known</div><p className={`vitality risk-${weather.risk}`}>{weather.summary} · vitality {weather.vitality}%</p><small>Last updated: {weatherInput.updatedAt ? new Date(weatherInput.updatedAt).toLocaleString() : 'manual default'} · {weatherInput.source || 'manual estimate'}</small><div className="compact-grid"><label>Condition<input value={weatherInput.condition} onChange={e => patchWeather({ condition: e.target.value })} /></label><label>Temp °F<input type="number" value={weatherInput.tempF} onChange={e => patchWeather({ tempF: Number(e.target.value) })} /></label><label>Humidity<input type="number" value={weatherInput.humidity} onChange={e => patchWeather({ humidity: Number(e.target.value) })} /></label><label>AQI<input type="number" value={weatherInput.airQualityIndex} onChange={e => patchWeather({ airQualityIndex: Number(e.target.value) })} /></label></div><button onClick={refreshWeather}>Refresh last-known weather</button></section><section className="panel glass flow-card"><div className="section-title"><Map/> App settings</div><div className="compact-grid"><label>Map<select value={settings.mapLayer || 'osm'} onChange={e => patchSettings({ mapLayer: e.target.value })}><option value="osm">Stable map</option><option value="terrain">Terrain</option><option value="satellite">Satellite</option></select></label><label>Units<select value={settings.units} onChange={e => patchSettings({ units: e.target.value })}><option value="miles">Miles</option><option value="km">Kilometers</option></select></label><label>Theme<select value={settings.theme} onChange={e => patchSettings({ theme: e.target.value })}><option value="forest">Forest</option><option value="ember">Ember</option><option value="night">Night</option></select></label><label className="checkbox-row"><input type="checkbox" checked={settings.helpEnabled !== false} onChange={e => patchSettings({ helpEnabled: e.target.checked })} /> Show help indicators</label></div><button className="primary" onClick={saveProfile}>Save settings</button><button className="danger" onClick={clearData}>Clear local device data</button></section></section>; }
function RouteMap({ area, route, current, destination, onPick, trailGeometry, sosMarker, navigation, settings = {}, markers = [] }) {
  const mapRef = useRef(null); const mapElRef = useRef(null); const layerRef = useRef(null); const tileRef = useRef(null);
  const trailSegments = getTrailSegments(trailGeometry); const trailPoints = getTrailPoints(trailGeometry);
  const visibility = { ...DEFAULT_VISIBILITY, ...(settings.mapFeatureVisibility || {}) };
  const routeVariants = area ? routeVariantsForArea(area, route) : [];
  const shouldShowCurrent = !!current && (settings.showCurrentWhenFar || settings.fitMode === 'include-current' || (navigation?.snappedCurrent && navigation.snappedCurrent.distance < 2));
  useEffect(() => { if (!mapElRef.current || mapRef.current) return; mapRef.current = L.map(mapElRef.current, { zoomControl: true, scrollWheelZoom: true, attributionControl: false }); setTimeout(() => mapRef.current?.invalidateSize(), 100); return () => { mapRef.current?.remove(); mapRef.current = null; }; }, []);
  useEffect(() => { if (!mapRef.current) return; const layers = { terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' }; if (tileRef.current) tileRef.current.remove(); tileRef.current = L.tileLayer(layers[settings.mapLayer || 'osm'] || layers.osm, { maxZoom: 18, attribution: '' }); tileRef.current.addTo(mapRef.current); }, [settings.mapLayer]);
  useEffect(() => {
    if (!mapRef.current) return; if (layerRef.current) layerRef.current.remove(); const group = L.layerGroup(); const bounds = [];
    trailSegments.forEach((coords, idx) => { const latLngs = coords.map(([lon, lat]) => [lat, lon]); L.polyline(latLngs, { color: ROUTE_COLORS[idx % ROUTE_COLORS.length], weight: 5, opacity: 0.92 }).bindPopup(`Trail segment ${idx + 1}`).addTo(group); bounds.push(...latLngs); });
    if (visibility.alternates !== false) routeVariants.forEach((variant) => { if ((variant.points || []).length > 1) { L.polyline(variant.points, { color: variant.color, weight: variant.kind === 'Primary' ? 6 : 4, opacity: variant.kind === 'Primary' ? 0.95 : 0.78, dashArray: variant.kind === 'Primary' ? null : '8 8' }).bindPopup(`<strong>${variant.name}</strong><br/>${variant.kind}<br/>${variant.note || 'Route variation for visual planning.'}`).addTo(group); bounds.push(...variant.points); } });
    [...route, ...WATER_REPORTS].filter(item => featureVisible(item, visibility)).forEach((w) => { const lat = w.displayLat || w.lat; const lon = w.displayLon || w.lon; if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) return; const isDest = destination?.id === w.id; const icon = L.divIcon({ className: 'map-feature-icon', html: `<span style="--pin:${featureColor(w, isDest ? '#ffdb77' : '#bfe0a9')}">${featureIcon(w)}</span>`, iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -10] }); const marker = L.marker([lat, lon], { icon }); marker.bindPopup(`<strong>${w.name}</strong><br/>${w.type || 'Marker'}${w.mile != null ? ` · mile ${w.mile}` : ''}<br/>${w.detail || ''}`); marker.on('click', () => onPick?.(w)); marker.addTo(group); bounds.push([lat, lon]); });
    markers.forEach(m => { if (!Number.isFinite(Number(m.lat)) || !Number.isFinite(Number(m.lon))) return; const saved = L.circleMarker([Number(m.lat), Number(m.lon)], { radius: 8, color: '#09140d', weight: 2, fillColor: m.visibility === 'public' ? '#52c7ff' : '#e2a241', fillOpacity: 0.95 }); saved.bindPopup(`<strong>${m.name}</strong><br/>${m.category || 'Marker'} · ${m.visibility || 'private'}`); saved.addTo(group); bounds.push([Number(m.lat), Number(m.lon)]); });
    if (shouldShowCurrent) { L.circleMarker([current.lat, current.lon], { radius: 9, color: '#e8f5ff', weight: 3, fillColor: '#399cff', fillOpacity: 0.95 }).bindPopup('Current/last-known position').addTo(group); if (settings.fitMode === 'include-current') bounds.push([current.lat, current.lon]); }
    if (sosMarker) { L.circleMarker([sosMarker.lat, sosMarker.lon], { radius: 13, color: '#ffe3dd', weight: 3, fillColor: '#ff4d3d', fillOpacity: 0.95 }).bindPopup('SOS marker draft').addTo(group); bounds.push([sosMarker.lat, sosMarker.lon]); }
    group.addTo(mapRef.current); layerRef.current = group; if (bounds.length) mapRef.current.fitBounds(bounds, { padding: [18, 18], maxZoom: 15 }); else mapRef.current.setView([44.57, -70.96], 13); setTimeout(() => mapRef.current?.invalidateSize(), 100);
  }, [trailGeometry, route, current, destination, sosMarker, shouldShowCurrent, settings.fitMode, settings.showCurrentWhenFar, markers, JSON.stringify(visibility), area]);
  const fitTrail = () => { const pts = trailPoints.map(([lon, lat]) => [lat, lon]); if (pts.length) mapRef.current?.fitBounds(pts, { padding: [18, 18], maxZoom: 15 }); };
  return <div className="map-choice real-map-wrap"><div className="real-map" ref={mapElRef} /><div className="map-toolbar"><button onClick={fitTrail}>Fit trail</button><span>Color-coded routes + selectable icons. Water/fishing reports are planning aids; verify in field and check local rules.</span></div></div>;
}
function Metric({ icon: Icon, label, value, sub }) { return <article className="metric glass"><Icon/><span>{label}</span><strong>{value}</strong><small>{sub}</small></article>; }
createRoot(document.getElementById('root')).render(<App />);
