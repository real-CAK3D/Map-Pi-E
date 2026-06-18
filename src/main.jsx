import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AlertTriangle, Backpack, Bluetooth, Camera, Compass, Database, Download, Droplets, Flag, GitBranch, Home, Leaf, ListChecks, LocateFixed, Map, MapPin, Mountain, Navigation, Play, RotateCcw, Save, Send, Settings, ShieldAlert, Smartphone, Square, TentTree, ThermometerSun, Upload, Users, Wifi } from 'lucide-react';
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
      { id: 'springer', type: 'Start', name: 'Springer Mountain', mile: 0, lat: 34.6274, lon: -84.1933, detail: 'Southern terminus. Start plaque and baseline check.' },
      { id: 'stover', type: 'Water', name: 'Stover Creek', mile: 2.8, lat: 34.6512, lon: -84.1667, detail: 'Water/filter checkpoint.' },
      { id: 'hawk', type: 'Shelter', name: 'Hawk Mountain Shelter', mile: 8.1, lat: 34.6851, lon: -84.1103, detail: 'Camp/shelter waypoint.' },
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
      { id: 'rt26-grafton', type: 'Start/Road', name: 'Route 26 / Grafton Notch', mile: 0.0, lat: 44.5935, lon: -70.9466, detail: 'ME 26 trailhead/parking access. Good field-test start point.' },
      { id: 'eyebrow-jct', type: 'Junction', name: 'Eyebrow Trail junction area', mile: 1.1, lat: 44.5865, lon: -70.9498, detail: 'Approximate junction area; confirm with blazes/map on trail.' },
      { id: 'old-speck', type: 'Summit', name: 'Old Speck Mountain', mile: 3.5, lat: 44.5709, lon: -70.9536, detail: 'Major climb and weather/wind checkpoint.' },
      { id: 'mahoosuc-arm', type: 'Mountain', name: 'Mahoosuc Arm', mile: 5.1, lat: 44.5606, lon: -70.9781, detail: 'Steep approach near Speck Pond; take it slow.' },
      { id: 'speck-pond', type: 'Destination', name: 'Speck Pond', mile: 6.0, lat: 44.5637, lon: -70.9734, detail: 'Your near-term destination/test area. Pond/shelter coordinates from OSM/Nominatim.' },
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

function App() {
  const [activeTab, setActiveTab] = useStoredState('mapPi.activeTab', 'dashboard');
  const [settings, setSettings] = useStoredState('mapPi.settings', {
    units: 'miles', paceMph: 2.2, autoEndRadiusMiles: 0.12, theme: 'forest', gpsSource: 'phone', hikerName: 'CAK3D', offlineMode: true, mapLayer: 'terrain', fitMode: 'trail', showCurrentWhenFar: false,
  });
  const [planner, setPlanner] = useStoredState('mapPi.planner', {
    area: 'graftonSpeck', direction: 'northbound', startId: 'rt26-grafton', endId: 'speck-pond', destinationMode: 'dropdown', destinationId: 'speck-pond', destinationName: '', coordText: '44.5637, -70.9734', notes: 'Field test: Route 26 / Grafton Notch to Speck Pond.', selectedMapId: 'speck-pond',
  });
  const [hike, setHike] = useStoredState('mapPi.hike', { active: false, startedAt: null, endedAt: null, completed: false, requestQueue: [] });
  const [manualPosition, setManualPosition] = useStoredState('mapPi.manualPosition', { lat: 44.5935, lon: -70.9466, label: 'Route 26 / Grafton Notch manual start' });
  const [position, setPosition] = useState(null);
  const [geoStatus, setGeoStatus] = useState('Idle — use phone GPS or manual coordinates.');
  const [plantPhoto, setPlantPhoto] = useState(null);
  const [queuedRequest, setQueuedRequest] = useState('');
  const [trailGeometry, setTrailGeometry] = useState(null);
  const [trailGeometryStatus, setTrailGeometryStatus] = useState('Loading OSM trail geometry…');
  const [lastKnownLocation, setLastKnownLocation] = useStoredState('mapPi.lastKnownLocation', null);
  const [sosMarker, setSosMarker] = useStoredState('mapPi.sosMarker', null);
  const [geoWatchId, setGeoWatchId] = useState(null);
  const [emergencyStatus, setEmergencyStatus] = useState('SOS marker is local until Supabase/backend sync is wired.');
  const [pwaStatus, setPwaStatus] = useState('Offline shell not registered yet.');
  const [importedTrailGeometry, setImportedTrailGeometry] = useStoredState('mapPi.importedTrailGeometry', null);

  useEffect(() => { registerServiceWorker(setPwaStatus); }, []);

  useEffect(() => {
    fetch('/trails/grafton-speck-osm.geojson')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const featureCount = data?.features?.length || 0;
        const pointCount = (data?.features || []).reduce((sum, feature) => sum + (feature.geometry?.coordinates?.length || 0), 0);
        setTrailGeometry(data);
        setTrailGeometryStatus(`Loaded real OSM trail geometry: ${featureCount} segments / ${pointCount} points.`);
      })
      .catch((error) => setTrailGeometryStatus(`Trail geometry unavailable: ${error.message}`));
  }, []);

  useEffect(() => {
    const routePackVersion = 'nh-me-2026-06-17';
    if (localStorage.getItem('mapPi.routePackVersion') === routePackVersion) return;
    setPlanner({
      area: 'graftonSpeck', direction: 'northbound', startId: 'rt26-grafton', endId: 'speck-pond', destinationMode: 'dropdown', destinationId: 'speck-pond', destinationName: '', coordText: '44.5637, -70.9734', notes: 'Field test: Route 26 / Grafton Notch to Speck Pond.', selectedMapId: 'speck-pond',
    });
    setManualPosition({ lat: 44.5935, lon: -70.9466, label: 'Route 26 / Grafton Notch manual start' });
    localStorage.setItem('mapPi.routePackVersion', routePackVersion);
  }, [setPlanner, setManualPosition]);

  const activeTrailGeometry = importedTrailGeometry || trailGeometry;
  const area = AREAS[planner.area] || AREAS.graftonSpeck;
  const ordered = planner.direction === 'southbound' ? [...area.waypoints].reverse() : area.waypoints;
  const startIdx = Math.max(0, ordered.findIndex(w => w.id === planner.startId));
  const endIdxRaw = ordered.findIndex(w => w.id === planner.endId);
  const endIdx = endIdxRaw >= 0 ? endIdxRaw : ordered.length - 1;
  const low = Math.min(startIdx, endIdx);
  const high = Math.max(startIdx, endIdx);
  const route = ordered.slice(low, high + 1);
  const current = position || lastKnownLocation || manualPosition;
  const trailMeta = useMemo(() => getTrailMeta(activeTrailGeometry), [activeTrailGeometry]);
  const snappedRoute = useMemo(() => planner.area === 'graftonSpeck' ? route.map(w => snapWaypointToTrail(w, trailMeta)) : route, [route, trailMeta, planner.area]);
  const snappedCurrent = useMemo(() => nearestTrailPoint(current, trailMeta), [current, trailMeta]);
  const sunInfo = useMemo(() => calcSunTimes(new Date(), current.lat, current.lon), [current.lat, current.lon]);
  const destination = useMemo(() => {
    if (planner.destinationMode === 'coords') return parseCoord(planner.coordText) ? { ...parseCoord(planner.coordText), name: planner.destinationName || 'Custom coordinate destination', type: 'Custom' } : null;
    if (planner.destinationMode === 'map') return area.waypoints.find(w => w.id === planner.selectedMapId) || route.at(-1);
    if (planner.destinationMode === 'name') {
      const match = area.waypoints.find(w => w.name.toLowerCase().includes(planner.destinationName.toLowerCase()));
      return match || (planner.destinationName ? { name: planner.destinationName, lat: current.lat, lon: current.lon, type: 'Named note' } : route.at(-1));
    }
    return area.waypoints.find(w => w.id === planner.destinationId) || route.at(-1);
  }, [planner, area.waypoints, route, current]);

  const navigation = useMemo(() => {
    const distances = snappedRoute.map(w => ({ ...w, distance: haversineMiles(current, { lat: w.displayLat || w.lat, lon: w.displayLon || w.lon }) ?? Infinity }));
    const nearest = distances.reduce((best, item, idx) => item.distance < best.distance ? { ...item, idx } : best, { distance: Infinity, idx: 0 });
    const next = distances.find((_, idx) => idx > nearest.idx) || distances.at(-1);
    const last = [...distances].reverse().find((_, rIdx) => (distances.length - 1 - rIdx) < nearest.idx) || distances[0];
    const toDestination = haversineMiles(current, destination);
    const routeMiles = trailMeta.totalMiles || routeDistance(snappedRoute);
    const completedByMile = Math.max(0, ((nearest.mile || route[0]?.mile || 0) - (route[0]?.mile || 0)));
    const routeTrailMiles = Math.max(0.01, trailMeta.totalMiles || Math.abs((snappedRoute.at(-1)?.mile || 0) - (snappedRoute[0]?.mile || 0)));
    const progress = Math.min(100, Math.max(0, (completedByMile / routeTrailMiles) * 100));
    return { nearest, next, last, toDestination, routeMiles, progress, snappedCurrent };
  }, [snappedRoute, current, destination]);

  useEffect(() => {
    if (hike.active && destination && navigation.toDestination != null && navigation.toDestination <= Number(settings.autoEndRadiusMiles)) {
      setHike(h => ({ ...h, active: false, endedAt: new Date().toISOString(), completed: true }));
      setGeoStatus(`Destination reached within ${settings.autoEndRadiusMiles} mi. Hike auto-ended.`);
    }
  }, [navigation.toDestination, destination, hike.active, settings.autoEndRadiusMiles, setHike]);

  const setPlannerPatch = (patch) => setPlanner(prev => ({ ...prev, ...patch }));
  const setSettingsPatch = (patch) => setSettings(prev => ({ ...prev, ...patch }));

  const getLocation = () => {
    if (!navigator.geolocation) return setGeoStatus('Browser geolocation is not available on this device.');
    setGeoStatus('Starting high-accuracy live GPS watch…');
    if (geoWatchId != null) navigator.geolocation.clearWatch(geoWatchId);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const live = { lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy, label: 'Live phone GPS', timestamp: new Date(pos.timestamp).toLocaleString() };
        setPosition(live);
        setLastKnownLocation(live);
        setGeoStatus(`Live GPS tracking · ±${Math.round(pos.coords.accuracy || 0)}m · ${live.timestamp}`);
      },
      (err) => setGeoStatus(`Location unavailable: ${err.message}`),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 }
    );
    setGeoWatchId(watchId);
  };
  const stopLiveTracking = () => {
    if (geoWatchId != null && navigator.geolocation) navigator.geolocation.clearWatch(geoWatchId);
    setGeoWatchId(null);
    setGeoStatus('Live GPS watch stopped. Last known location remains available.');
  };
  const raiseSOS = async () => {
    const marker = { ...current, createdAt: new Date().toLocaleString(), status: 'HELP REQUESTED' };
    setSosMarker(marker);
    const text = buildEmergencyText({ settings, current, snappedCurrent, destination, sosMarker: marker });
    try {
      if (navigator.share) await navigator.share({ title: 'Map-Pi SOS marker', text });
      else if (navigator.clipboard) await navigator.clipboard.writeText(text);
      setEmergencyStatus('SOS marker saved locally and emergency text shared/copied. Shared map visibility still needs backend sync.');
    } catch (error) {
      setEmergencyStatus(`SOS marker saved locally. Share/copy skipped: ${error.message}`);
    }
  };
  const clearSOS = () => { setSosMarker(null); setEmergencyStatus('SOS marker cleared locally.'); };
  const useManualCoords = () => {
    const parsed = parseCoord(planner.coordText);
    if (!parsed) return setGeoStatus('Manual coordinate format should be: 34.6274, -84.1933');
    setManualPosition({ ...parsed, label: planner.destinationName || 'Manual coordinate' });
    setPosition(null);
    setGeoStatus('Manual coordinates set as current position.');
  };
  const startHike = () => setHike(h => ({ ...h, active: true, startedAt: new Date().toISOString(), endedAt: null, completed: false }));
  const endHike = () => setHike(h => ({ ...h, active: false, endedAt: new Date().toISOString(), completed: false }));
  const resetHike = () => setHike(h => ({ ...h, active: false, startedAt: null, endedAt: null, completed: false }));
  const handlePlantPhoto = (event) => {
    const file = event.target.files?.[0];
    if (file) setPlantPhoto({ name: file.name, size: `${Math.round(file.size / 1024)} KB`, type: file.type || 'photo' });
  };
  const queueSupplyRequest = () => {
    if (!queuedRequest.trim()) return;
    setHike(h => ({ ...h, requestQueue: [...(h.requestQueue || []), { id: Date.now(), text: queuedRequest.trim(), destination: destination?.name || 'Current route', createdAt: new Date().toLocaleString(), status: 'Queued offline' }] }));
    setQueuedRequest('');
  };
  const exportActiveGpx = () => downloadText('map-pi-active-route.gpx', geoJsonToGpx(activeTrailGeometry, area.label));
  const exportEmergencyJson = () => downloadText('map-pi-emergency-state.json', JSON.stringify({ planner, hike, current, lastKnownLocation, sosMarker, destination, exportedAt: new Date().toISOString() }, null, 2), 'application/json');
  const importGpxFile = async (file) => {
    if (!file) return;
    const text = await file.text();
    const geo = gpxTextToGeoJson(text, file.name.replace(/\.gpx$/i, ''));
    setImportedTrailGeometry(geo);
    setTrailGeometryStatus(`Imported GPX route: ${geo.features.length} segment(s), ${getTrailPoints(geo).length} points.`);
  };
  const clearImportedRoute = () => { setImportedTrailGeometry(null); setTrailGeometryStatus('Using bundled OSM Route 26 / Speck Pond geometry.'); };

  const tabs = [
    ['dashboard', 'Dashboard', Activity], ['planner', 'Planner', Map], ['navigate', 'Navigate', Navigation], ['waypoints', 'Waypoints', ListChecks], ['drops', 'Drops', Users], ['plant', 'Plant ID', Leaf], ['field', 'Field Kit', Smartphone], ['settings', 'Settings', Settings],
  ];

  return <main className={`app-shell theme-${settings.theme} ${settings.fieldMode ? 'field-mode' : ''}`}>
    <header className="app-header glass">
      <div><p className="eyebrow"><MapPin size={16}/> Map-Pi Appalachian Trail System</p><h1>Trail Buddy</h1><p>{area.label} · {planner.direction} · {hike.active ? 'Hike active' : hike.completed ? 'Destination reached' : 'Planning mode'}</p></div>
      <div className="status-pill"><Wifi size={16}/> Tailscale ready</div>
    </header>

    <nav className="tab-bar glass">{tabs.map(([id, label, Icon]) => <button key={id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}><Icon size={17}/><span>{label}</span></button>)}</nav>

    {activeTab === 'dashboard' && <Dashboard settings={settings} area={area} route={snappedRoute} hike={hike} current={current} destination={destination} navigation={navigation} setActiveTab={setActiveTab} trailGeometry={activeTrailGeometry} trailGeometryStatus={trailGeometryStatus} sosMarker={sosMarker} sunInfo={sunInfo} />}
    {activeTab === 'planner' && <Planner area={area} ordered={ordered} route={snappedRoute} planner={planner} setPlannerPatch={setPlannerPatch} destination={destination} navigation={navigation} useManualCoords={useManualCoords} trailGeometry={activeTrailGeometry} sosMarker={sosMarker} />}
    {activeTab === 'navigate' && <Navigate settings={settings} route={snappedRoute} hike={hike} current={current} destination={destination} navigation={navigation} geoStatus={geoStatus} getLocation={getLocation} stopLiveTracking={stopLiveTracking} geoWatchId={geoWatchId} startHike={startHike} endHike={endHike} resetHike={resetHike} setManualPosition={setManualPosition} lastKnownLocation={lastKnownLocation} sunInfo={sunInfo} raiseSOS={raiseSOS} clearSOS={clearSOS} sosMarker={sosMarker} emergencyStatus={emergencyStatus} trailGeometry={activeTrailGeometry} />}
    {activeTab === 'waypoints' && <Waypoints settings={settings} route={snappedRoute} current={current} navigation={navigation} setPlannerPatch={setPlannerPatch} setManualPosition={setManualPosition} setActiveTab={setActiveTab} />}
    {activeTab === 'drops' && <Drops drops={defaultDrops} queuedRequest={queuedRequest} setQueuedRequest={setQueuedRequest} queueSupplyRequest={queueSupplyRequest} requestQueue={hike.requestQueue || []} destination={destination} />}
    {activeTab === 'plant' && <Plant plantPhoto={plantPhoto} handlePlantPhoto={handlePlantPhoto} />}
    {activeTab === 'field' && <FieldKit pwaStatus={pwaStatus} settings={settings} setSettingsPatch={setSettingsPatch} trailGeometry={activeTrailGeometry} importedTrailGeometry={importedTrailGeometry} importGpxFile={importGpxFile} clearImportedRoute={clearImportedRoute} exportActiveGpx={exportActiveGpx} exportEmergencyJson={exportEmergencyJson} current={current} destination={destination} />}
    {activeTab === 'settings' && <SettingsPage settings={settings} setSettingsPatch={setSettingsPatch} planner={planner} setPlannerPatch={setPlannerPatch} hike={hike} setHike={setHike} />}

    <footer>Installable PWA shell, GPX tools, terrain map, and local safety state. Shared live/SOS sync needs backend credentials.</footer>
  </main>;
}

function Dashboard({ settings, area, route, hike, current, destination, navigation, setActiveTab, trailGeometry, trailGeometryStatus, sosMarker, sunInfo }) {
  return <section className="page-grid">
    <Metric icon={Flag} label="Selected route" value={`${route[0]?.name} → ${route.at(-1)?.name}`} sub={area.description} />
    <Metric icon={Navigation} label="To destination" value={fmtMiles(navigation.toDestination, settings.units)} sub={destination?.name || 'No destination'} />
    <Metric icon={MapPin} label="Next waypoint" value={navigation.next?.name || '—'} sub={fmtMiles(navigation.next?.distance, settings.units)} />
    <Metric icon={Home} label="Last waypoint" value={navigation.last?.name || '—'} sub={fmtMiles(navigation.last?.distance, settings.units)} />
    <Metric icon={ThermometerSun} label="Next light change" value={sunInfo.next ? sunInfo.next.label : '—'} sub={sunInfo.next ? `${sunInfo.next.time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · ${formatDuration(sunInfo.next.time - new Date())}` : 'Sun data unavailable'} />
    <section className="trail-map glass wide">
      <div className="section-title"><Map/> Route overview</div>
      <RouteMap route={route} current={current} destination={destination} onPick={(wp) => {}} trailGeometry={activeTrailGeometry} sosMarker={sosMarker} navigation={navigation} settings={settings} />
      <div className="source-note">{trailGeometryStatus} Source: OpenStreetMap contributors (ODbL). GPX copy: <code>/trails/grafton-speck-osm.gpx</code></div>
      <div className="progress"><span style={{ width: `${navigation.progress}%` }} /></div>
    </section>
    <section className="panel glass">
      <div className="section-title"><Compass/> Quick actions</div>
      <button className="primary" onClick={() => setActiveTab('planner')}>Plan destination</button>
      <button className="secondary" onClick={() => setActiveTab('navigate')}>Open navigation</button>
      <p className="muted">Hike state: {hike.active ? `Started ${new Date(hike.startedAt).toLocaleString()}` : hike.endedAt ? `Ended ${new Date(hike.endedAt).toLocaleString()}` : 'Not started'}</p>
    </section>
  </section>;
}

function Planner({ area, ordered, route, planner, setPlannerPatch, destination, navigation, useManualCoords, trailGeometry, sosMarker }) {
  return <section className="page-grid two-col">
    <section className="panel glass">
      <div className="section-title"><Map/> Route planner</div>
      <label>Selected area<select value={planner.area} onChange={e => setPlannerPatch({ area: e.target.value, startId: AREAS[e.target.value].waypoints[0].id, endId: AREAS[e.target.value].waypoints.at(-1).id, destinationId: AREAS[e.target.value].waypoints.at(-1).id, selectedMapId: AREAS[e.target.value].waypoints.at(-1).id })}>{Object.entries(AREAS).map(([id, a]) => <option key={id} value={id}>{a.label}</option>)}</select></label>
      <label>Direction<select value={planner.direction} onChange={e => setPlannerPatch({ direction: e.target.value })}><option value="northbound">Northbound</option><option value="southbound">Southbound</option></select></label>
      <label>Start waypoint<select value={planner.startId} onChange={e => setPlannerPatch({ startId: e.target.value })}>{ordered.map(w => <option key={w.id} value={w.id}>{w.mile} · {w.name}</option>)}</select></label>
      <label>End waypoint<select value={planner.endId} onChange={e => setPlannerPatch({ endId: e.target.value, destinationId: e.target.value })}>{ordered.map(w => <option key={w.id} value={w.id}>{w.mile} · {w.name}</option>)}</select></label>
      <div className="mini-stats"><span>Route points: {route.length}</span><span>Trail miles: {Math.abs((route.at(-1)?.mile || 0) - (route[0]?.mile || 0)).toFixed(1)}</span><span>GPS estimate: {fmtMiles(navigation.routeMiles)}</span></div>
    </section>
    <section className="panel glass">
      <div className="section-title"><Flag/> Destination input</div>
      <label>Destination mode<select value={planner.destinationMode} onChange={e => setPlannerPatch({ destinationMode: e.target.value })}><option value="dropdown">Dropdown waypoint</option><option value="coords">Coordinates</option><option value="name">Name search/note</option><option value="map">Choice on map</option></select></label>
      {planner.destinationMode === 'dropdown' && <label>Destination<select value={planner.destinationId} onChange={e => setPlannerPatch({ destinationId: e.target.value })}>{area.waypoints.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>}
      {(planner.destinationMode === 'coords' || planner.destinationMode === 'name') && <><label>Name<input value={planner.destinationName} onChange={e => setPlannerPatch({ destinationName: e.target.value })} placeholder="Camp, road, water source…" /></label>{planner.destinationMode === 'coords' && <label>Coordinates<input value={planner.coordText} onChange={e => setPlannerPatch({ coordText: e.target.value })} placeholder="34.6274, -84.1933" /></label>}<button className="secondary" onClick={useManualCoords}>Use coordinates as current position</button></>}
      <div className="chosen-destination"><strong>Chosen:</strong> {destination?.name || 'Invalid coordinate'} · {fmtMiles(navigation.toDestination)}</div>
    </section>
    <section className="trail-map glass full-row"><div className="section-title"><MapPin/> Choose on map</div><RouteMap route={route} current={null} destination={destination} onPick={(wp) => setPlannerPatch({ selectedMapId: wp.id, destinationMode: 'map' })} trailGeometry={activeTrailGeometry} sosMarker={sosMarker} settings={{ mapLayer: 'terrain', fitMode: 'trail' }} /></section>
  </section>;
}

function Navigate({ settings, route, hike, current, destination, navigation, geoStatus, getLocation, stopLiveTracking, geoWatchId, startHike, endHike, resetHike, setManualPosition, lastKnownLocation, sunInfo, raiseSOS, clearSOS, sosMarker, emergencyStatus, trailGeometry }) {
  const emergencyText = buildEmergencyText({ settings, current, snappedCurrent: navigation.snappedCurrent, destination, sosMarker });
  return <section className="page-grid">
    <Metric icon={LocateFixed} label="Current position" value={current.label || 'Manual/GPS'} sub={`${Number(current.lat).toFixed(4)}, ${Number(current.lon).toFixed(4)}`} />
    <Metric icon={Navigation} label="Distance to next" value={fmtMiles(navigation.next?.distance, settings.units)} sub={navigation.next?.name} />
    <Metric icon={Home} label="Distance to last" value={fmtMiles(navigation.last?.distance, settings.units)} sub={navigation.last?.name} />
    <Metric icon={Flag} label="Distance to destination" value={fmtMiles(navigation.toDestination, settings.units)} sub={destination?.name} />
    <Metric icon={ThermometerSun} label="Sunrise / sunset" value={sunInfo.sunrise ? sunInfo.sunrise.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '—'} sub={sunInfo.sunset ? `Sunset ${sunInfo.sunset.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · next ${sunInfo.next?.label || '—'} in ${sunInfo.next ? formatDuration(sunInfo.next.time - new Date()) : '—'}` : 'Sun data unavailable'} />
    <section className="panel glass wide"><div className="section-title"><Activity/> Hike controls</div><p className="muted">{geoStatus}</p><div className="button-row"><button className="primary" onClick={getLocation}><LocateFixed size={16}/> {geoWatchId == null ? 'Start live GPS' : 'Restart live GPS'}</button><button className="secondary" onClick={stopLiveTracking} disabled={geoWatchId == null}>Stop live GPS</button><button className="primary" onClick={startHike} disabled={hike.active}><Play size={16}/> Start hike</button><button className="danger" onClick={endHike} disabled={!hike.active}><Square size={16}/> End hike</button><button className="secondary" onClick={resetHike}><RotateCcw size={16}/> Reset</button></div></section>
    <section className="panel glass"><div className="section-title"><ListChecks/> Route queue</div>{route.map(w => <button className="waypoint-button" key={w.id} onClick={() => setManualPosition({ lat: w.displayLat || w.lat, lon: w.displayLon || w.lon, label: w.name })}><strong>{w.name}</strong><span>{w.type} · route snap {w.snap ? `${w.snap.distance.toFixed(2)} mi` : '—'}</span></button>)}</section>
    <section className="trail-map glass wide"><div className="section-title"><Map/> Live route map</div><RouteMap route={route} current={current} destination={destination} onPick={(wp) => setManualPosition({ lat: wp.displayLat || wp.lat, lon: wp.displayLon || wp.lon, label: wp.name })} trailGeometry={activeTrailGeometry} sosMarker={sosMarker} navigation={navigation} settings={settings} /></section><section className="panel glass wide emergency-panel"><div className="section-title"><ShieldAlert/> SOS / last known location</div><p className="muted">Last known: {lastKnownLocation ? `${lastKnownLocation.lat.toFixed(5)}, ${lastKnownLocation.lon.toFixed(5)} · ${lastKnownLocation.timestamp}` : 'No GPS fix yet.'}</p><p className="muted">{emergencyStatus}</p><div className="button-row"><button className="danger" onClick={raiseSOS}><ShieldAlert size={16}/> Drop SOS marker / share text</button><button className="secondary" onClick={clearSOS} disabled={!sosMarker}>Clear SOS marker</button></div><textarea readOnly value={emergencyText} /></section>
  </section>;
}

function Waypoints({ settings, route, current, navigation, setPlannerPatch, setManualPosition, setActiveTab }) {
  return <section className="panel glass"><div className="section-title"><ListChecks/> Waypoints</div><div className="waypoint-list">{route.map((w) => <article key={w.id} className={navigation.nearest?.id === w.id ? 'nearest waypoint-card' : 'waypoint-card'}><div><strong>{w.type}: {w.name}</strong><span>Mile {w.mile} · {w.detail}</span><small>From current: {fmtMiles(haversineMiles(current, { lat: w.displayLat || w.lat, lon: w.displayLon || w.lon }), settings.units)}</small></div><div className="card-actions"><button onClick={() => { setPlannerPatch({ destinationMode: 'dropdown', destinationId: w.id }); setActiveTab('navigate'); }}>Navigate</button><button onClick={() => setManualPosition({ lat: w.displayLat || w.lat, lon: w.displayLon || w.lon, label: w.name })}>Set current</button></div></article>)}</div></section>;
}

function Drops({ drops, queuedRequest, setQueuedRequest, queueSupplyRequest, requestQueue, destination }) {
  return <section className="page-grid two-col"><section className="panel glass"><div className="section-title"><Users/> Trail-hand supply drops</div><p className="muted">Requests queue offline and can sync to Supabase/SMS later when service returns.</p><div className="request-row"><input value={queuedRequest} onChange={(e) => setQueuedRequest(e.target.value)} placeholder={`Request supplies near ${destination?.name || 'destination'}…`} /><button onClick={queueSupplyRequest}><Send size={16}/> Queue</button></div>{drops.map(drop => <article className="drop-card" key={drop.id}><strong>{drop.name}</strong><span>Mile {drop.mile} · {drop.status}</span><p>{drop.supplies}</p><small>{drop.eta}</small></article>)}</section><section className="panel glass"><div className="section-title"><Backpack/> Queued requests</div>{requestQueue.length ? requestQueue.map(r => <article className="drop-card" key={r.id}><strong>{r.text}</strong><span>{r.destination}</span><small>{r.status} · {r.createdAt}</small></article>) : <p className="muted">No requests queued yet.</p>}</section></section>;
}

function Plant({ plantPhoto, handlePlantPhoto }) {
  return <section className="page-grid two-col"><section className="panel glass plant-lab"><div className="section-title"><Camera/> Plant photo triage</div><p className="muted">Upload from the phone camera over HTTPS/Tailscale or hotspot. Bluetooth file transfer can be a fallback later.</p><label className="upload-box"><Upload/><span>{plantPhoto ? `${plantPhoto.name} · ${plantPhoto.size}` : 'Choose a plant photo'}</span><input type="file" accept="image/*" capture="environment" onChange={handlePlantPhoto} /></label><div className="safety-callout"><AlertTriangle/> Never eat from AI output alone. Map-Pi will return confidence, lookalikes, poisonous warnings, and “do not consume” by default when uncertain.</div></section><section className="panel glass"><div className="section-title"><Database/> Free data strategy</div><ul className="info-list">{plantSources.map(source => <li key={source}>{source}</li>)}</ul></section></section>;
}


function FieldKit({ pwaStatus, settings, setSettingsPatch, trailGeometry, importedTrailGeometry, importGpxFile, clearImportedRoute, exportActiveGpx, exportEmergencyJson, current, destination }) {
  const pointCount = getTrailPoints(trailGeometry).length;
  const backendItems = [
    ['hike_sessions', 'active hike state, started/ended timestamps, selected route'],
    ['last_known_locations', 'latest GPS fix by user/session, accuracy, battery optional'],
    ['sos_markers', 'public/help marker with status and resolution notes'],
    ['route_notes', 'hazards, water, camp notes, visibility options'],
  ];
  return <section className="page-grid two-col">
    <section className="panel glass"><div className="section-title"><Smartphone/> Offline / install</div><p className="muted">{pwaStatus}</p><p className="muted">Use your browser menu → Add to Home Screen. The app shell and bundled Route 26/Speck Pond files cache for rough offline use; live map tiles still depend on tile availability/cache.</p><div className="mini-stats"><span>Field mode: {settings.fieldMode ? 'on' : 'off'}</span><span>Map layer: {settings.mapLayer}</span><span>Trail points: {pointCount}</span></div><label className="checkbox-row"><input type="checkbox" checked={!!settings.fieldMode} onChange={e => setSettingsPatch({ fieldMode: e.target.checked })} /> Field mode: larger controls / low clutter</label></section>
    <section className="panel glass"><div className="section-title"><GitBranch/> GPX route tools</div><p className="muted">Import a GPX to temporarily replace the bundled trail geometry. Export keeps the active geometry portable for Garmin/CalTopo/backup use.</p><label className="upload-box compact"><Upload/><span>Import GPX route</span><input type="file" accept=".gpx,application/gpx+xml,text/xml" onChange={e => importGpxFile(e.target.files?.[0])} /></label><div className="button-row"><button className="primary" onClick={exportActiveGpx}><Download size={16}/> Export active GPX</button><button className="secondary" onClick={clearImportedRoute} disabled={!importedTrailGeometry}>Use bundled route</button></div><p className="muted">Active source: {importedTrailGeometry ? importedTrailGeometry.name || 'Imported GPX' : 'Bundled OSM Route 26/Speck Pond'}</p></section>
    <section className="panel glass"><div className="section-title"><ShieldAlert/> Emergency packet</div><p className="muted">Download a no-network JSON snapshot of current state for handoff/debugging.</p><div className="button-row"><button className="danger" onClick={exportEmergencyJson}><Download size={16}/> Export emergency/state JSON</button></div><p className="muted">Current: {current ? `${current.lat.toFixed(5)}, ${current.lon.toFixed(5)}` : 'unknown'} · Destination: {destination?.name || 'unknown'}</p></section>
    <section className="panel glass"><div className="section-title"><Database/> Supabase-ready schema</div><p className="muted">Not wired until you add credentials. These are the tables/functions needed for public/live behavior.</p>{backendItems.map(([name, desc]) => <article className="drop-card" key={name}><strong>{name}</strong><span>{desc}</span></article>)}<p className="muted">Use RLS: public read only for unresolved SOS markers; owner/session write for location updates; service role only in Edge Functions.</p></section>
  </section>;
}

function SettingsPage({ settings, setSettingsPatch, planner, setPlannerPatch, hike, setHike }) {
  return <section className="page-grid two-col"><section className="panel glass"><div className="section-title"><Settings/> Preferences</div><label>Hiker name<input value={settings.hikerName} onChange={e => setSettingsPatch({ hikerName: e.target.value })} /></label><label>Units<select value={settings.units} onChange={e => setSettingsPatch({ units: e.target.value })}><option value="miles">Miles</option><option value="km">Kilometers</option></select></label><label>Expected pace mph<input type="number" step="0.1" value={settings.paceMph} onChange={e => setSettingsPatch({ paceMph: Number(e.target.value) })} /></label><label>Auto-end radius miles<input type="number" step="0.01" value={settings.autoEndRadiusMiles} onChange={e => setSettingsPatch({ autoEndRadiusMiles: Number(e.target.value) })} /></label><label>Theme<select value={settings.theme} onChange={e => setSettingsPatch({ theme: e.target.value })}><option value="forest">Forest</option><option value="ember">Ember</option><option value="night">Night</option></select></label><label>Map layer<select value={settings.mapLayer || 'terrain'} onChange={e => setSettingsPatch({ mapLayer: e.target.value })}><option value="terrain">Terrain / topo</option><option value="osm">Street map</option><option value="satellite">Satellite-ish Esri</option></select></label><label>Initial map fit<select value={settings.fitMode || 'trail'} onChange={e => setSettingsPatch({ fitMode: e.target.value })}><option value="trail">Trail only</option><option value="include-current">Include current location</option></select></label><label className="checkbox-row"><input type="checkbox" checked={!!settings.showCurrentWhenFar} onChange={e => setSettingsPatch({ showCurrentWhenFar: e.target.checked })} /> Show current marker even when far from route</label></section><section className="panel glass"><div className="section-title"><Save/> Local data</div><p className="muted">Settings, route, hike state, and queued requests persist in this browser with localStorage.</p><button className="danger" onClick={() => { localStorage.clear(); setHike({ active: false, startedAt: null, endedAt: null, completed: false, requestQueue: [] }); }}>Clear local app data</button><textarea value={planner.notes} onChange={e => setPlannerPatch({ notes: e.target.value })} placeholder="Trail notes, gear reminders, water reports…" /></section></section>;
}

function RouteMap({ route, current, destination, onPick, trailGeometry, sosMarker, navigation, settings = {} }) {
  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const layerRef = useRef(null);
  const tileRef = useRef(null);
  const trailSegments = getTrailSegments(trailGeometry);
  const trailPoints = getTrailPoints(trailGeometry);
  const isCurrentNearTrail = !!navigation?.snappedCurrent && navigation.snappedCurrent.distance < 2;
  const shouldShowCurrent = !!current && (settings.showCurrentWhenFar || isCurrentNearTrail || settings.fitMode === 'include-current');

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    mapRef.current = L.map(mapElRef.current, { zoomControl: true, scrollWheelZoom: true });
    setTimeout(() => mapRef.current?.invalidateSize(), 100);
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const layers = {
      terrain: { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: 'Map data © OpenStreetMap contributors, SRTM | OpenTopoMap CC-BY-SA' },
      osm: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '© OpenStreetMap contributors' },
      satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles © Esri — source data providers' },
    };
    const selected = layers[settings.mapLayer || 'terrain'] || layers.terrain;
    if (tileRef.current) tileRef.current.remove();
    tileRef.current = L.tileLayer(selected.url, { maxZoom: selected.url.includes('opentopomap') ? 17 : 19, attribution: selected.attribution });
    tileRef.current.addTo(mapRef.current);
  }, [settings.mapLayer]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (layerRef.current) layerRef.current.remove();
    const group = L.layerGroup();
    const bounds = [];

    trailSegments.forEach((coords) => {
      const latLngs = coords.map(([lon, lat]) => [lat, lon]);
      L.polyline(latLngs, { color: '#76ff6a', weight: 5, opacity: 0.95 }).bindPopup('Appalachian Trail geometry<br/>Source: OpenStreetMap / ODbL').addTo(group);
      bounds.push(...latLngs);
    });

    route.forEach((w) => {
      const lat = w.displayLat || w.lat;
      const lon = w.displayLon || w.lon;
      const marker = L.circleMarker([lat, lon], {
        radius: destination?.id === w.id || destination?.name === w.name ? 10 : 7,
        color: '#112317', weight: 2,
        fillColor: destination?.id === w.id || destination?.name === w.name ? '#ffdb77' : '#bfe0a9', fillOpacity: 0.96,
      });
      const dist = current ? fmtMiles(haversineMiles(current, { lat, lon }), settings.units) : '—';
      marker.bindPopup(`<strong>${w.name}</strong><br/>${w.type} · mile ${w.mile}<br/>From you: ${dist}<br/>Trail snap offset: ${w.snap ? fmtMiles(w.snap.distance, settings.units) : 'n/a'}<br/>${w.detail || ''}`);
      marker.on('click', () => onPick?.(w));
      marker.addTo(group);
      bounds.push([lat, lon]);
    });

    if (shouldShowCurrent) {
      const marker = L.circleMarker([current.lat, current.lon], { radius: 9, color: '#e8f5ff', weight: 3, fillColor: '#399cff', fillOpacity: 0.95 });
      marker.bindPopup(`<strong>You / last known</strong><br/>${current.lat.toFixed(5)}, ${current.lon.toFixed(5)}<br/>Accuracy: ${current.accuracy ? Math.round(current.accuracy) + 'm' : 'manual/unknown'}<br/>Off route: ${navigation?.snappedCurrent ? fmtMiles(navigation.snappedCurrent.distance, settings.units) : '—'}`);
      marker.addTo(group);
      if (settings.fitMode === 'include-current') bounds.push([current.lat, current.lon]);
    }

    if (sosMarker) {
      const sos = L.circleMarker([sosMarker.lat, sosMarker.lon], { radius: 13, color: '#ffe3dd', weight: 3, fillColor: '#ff4d3d', fillOpacity: 0.95 });
      sos.bindPopup(`<strong>SOS / help marker</strong><br/>${sosMarker.createdAt || ''}<br/>${sosMarker.lat.toFixed(5)}, ${sosMarker.lon.toFixed(5)}`);
      sos.addTo(group);
      bounds.push([sosMarker.lat, sosMarker.lon]);
    }

    group.addTo(mapRef.current);
    layerRef.current = group;
    if (bounds.length) mapRef.current.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
    else mapRef.current.setView([44.57, -70.96], 13);
    setTimeout(() => mapRef.current?.invalidateSize(), 100);
  }, [trailGeometry, route, current, destination, sosMarker, shouldShowCurrent, settings.fitMode, settings.showCurrentWhenFar, settings.units]);

  const fitTrail = () => {
    if (!mapRef.current) return;
    const pts = trailPoints.map(([lon, lat]) => [lat, lon]);
    if (pts.length) mapRef.current.fitBounds(pts, { padding: [24, 24], maxZoom: 15 });
  };
  const fitMe = () => current && mapRef.current?.setView([current.lat, current.lon], 14);
  const fitDestination = () => destination && mapRef.current?.setView([destination.displayLat || destination.lat, destination.displayLon || destination.lon], 15);
  const offRouteText = current && navigation?.snappedCurrent ? `${fmtMiles(navigation.snappedCurrent.distance, settings.units)} from mapped route` : 'Current location hidden unless near route or enabled in settings.';

  return <div className="map-choice real-map-wrap">
    <div className="real-map" ref={mapElRef} />
    <div className="map-toolbar">
      <button onClick={fitTrail}>Fit trail</button>
      <button onClick={fitDestination}>Destination</button>
      <button onClick={fitMe} disabled={!current}>My location</button>
      <span>{shouldShowCurrent ? `Current: ${offRouteText}` : `Current marker hidden: ${offRouteText}`}</span>
    </div>
    <div className="map-buttons">{route.map(w => <button key={w.id} onClick={() => onPick?.(w)}>{w.name}</button>)}</div>
  </div>;
}

function Metric({ icon: Icon, label, value, sub }) {
  return <article className="metric glass"><Icon/><span>{label}</span><strong>{value}</strong><small>{sub}</small></article>;
}

createRoot(document.getElementById('root')).render(<App />);
