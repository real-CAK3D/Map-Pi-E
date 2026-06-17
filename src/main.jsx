import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, Bluetooth, Camera, Compass, Database, GitBranch, MapPin, Mountain, Navigation, RadioTower, Route, Satellite, Send, ShieldAlert, TentTree, ThermometerSun, Upload, Users, Wifi, Droplets, Flame, Leaf, LocateFixed } from 'lucide-react';
import './styles.css';

const waypoints = [
  { type: 'Start', name: 'Springer Mountain', mile: 0, detail: 'Southern terminus — shake down gear, set baseline.' },
  { type: 'Water', name: 'Stover Creek', mile: 2.8, detail: 'Early water check + filter routine.' },
  { type: 'Shelter', name: 'Hawk Mountain Shelter', mile: 8.1, detail: 'First camp / shelter waypoint.' },
  { type: 'Road', name: 'Hightower Gap', mile: 8.6, detail: 'Road crossing / rescue reference.' },
  { type: 'Vista', name: 'Blood Mountain', mile: 29.7, detail: 'Elevation/weather caution zone.' },
  { type: 'Town', name: 'Neel Gap', mile: 31.3, detail: 'Resupply and gear audit.' },
];

const manuals = [
  { icon: TentTree, title: 'Fast Camp Setup', text: 'Pick high, durable ground. Check widowmakers, water flow, and wind before pitching.' },
  { icon: Flame, title: 'Safe Fire Routine', text: 'Use existing rings, clear duff, keep water nearby, cold-out before sleep. Follow local bans.' },
  { icon: Droplets, title: 'Water Discipline', text: 'Log source, filter method, liters carried, next known source, and backup purification.' },
  { icon: Leaf, title: 'Plant ID Guardrail', text: 'AI can assist, not certify. Never eat a plant from model output alone. Confirm with field guide.' },
];

const dataFeeds = [
  ['GPS module', 'pending hardware', Satellite],
  ['Phone geolocation', 'available now', LocateFixed],
  ['Supabase sync', 'planned', Database],
  ['GitHub repo', 'planned', GitBranch],
  ['Ollama helper', 'remote/local-network preferred', RadioTower],
  ['Bluetooth sensors', 'optional later', Bluetooth],
];

const plantSources = [
  'Phone camera/photo upload over hotspot or Tailscale web UI',
  'Offline guide pack: USDA PLANTS / Wikidata / GBIF taxonomy candidates',
  'Poison and edible warnings require multiple-source confirmation',
  'Ollama vision should run on stronger local hardware when possible',
];

const dropLocations = [
  { name: 'Neel Gap supply window', mile: 31.3, status: 'Open for requests', supplies: 'Food, socks, water tabs', eta: 'Signal queued until online' },
  { name: 'Hiawassee shuttle board', mile: 69.2, status: 'Trail-hand planned', supplies: 'Fuel can, battery bank, first-aid', eta: 'Request drafts offline' },
  { name: 'Franklin road crossing', mile: 109.5, status: 'Needs confirmation', supplies: 'Meal drop, dry bag swap', eta: 'Send when service returns' },
];

function useTrailStats(position) {
  return useMemo(() => {
    const totalMiles = 2197.4;
    const simulatedMiles = position ? 0.2 : 14.6;
    const percent = Math.min(100, (simulatedMiles / totalMiles) * 100);
    return {
      totalMiles,
      traveled: simulatedMiles,
      remaining: totalMiles - simulatedMiles,
      percent,
      elevation: position ? 'GPS altitude pending' : '3,782 ft mock',
      temp: '61°F mock',
      weather: 'Clear window · watch ridge wind',
    };
  }, [position]);
}

function App() {
  const [position, setPosition] = useState(null);
  const [geoStatus, setGeoStatus] = useState('Idle — use phone browser location for early testing.');
  const [plantPhoto, setPlantPhoto] = useState(null);
  const [queuedRequest, setQueuedRequest] = useState('');
  const stats = useTrailStats(position);

  const handlePlantPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPlantPhoto({ name: file.name, size: `${Math.round(file.size / 1024)} KB`, type: file.type || 'photo' });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Browser geolocation is not available on this device.');
      return;
    }
    setGeoStatus('Requesting phone GPS permission…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          timestamp: new Date(pos.timestamp).toLocaleTimeString(),
        });
        setGeoStatus('Live phone location locked. Pi GPS module can plug into this same data model later.');
      },
      (err) => setGeoStatus(`Location unavailable: ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  return (
    <main className="app-shell">
      <section className="hero glass">
        <div>
          <p className="eyebrow"><MapPin size={16}/> CAK3D Appalachian Trail System</p>
          <h1>Map-Pi Trail Buddy</h1>
          <p className="hero-copy">A phone-first, Pi-ready trail command center for miles, camps, water, weather, GPS, and field notes — built to grow into the Raspberry Pi Zero 2 WH kit.</p>
          <div className="hero-actions">
            <button onClick={getLocation}><Navigation size={18}/> Lock phone GPS</button>
            <span><Wifi size={16}/> Tailscale / hotspot display path</span>
          </div>
        </div>
        <div className="compass-card">
          <Compass size={52}/>
          <strong>Northbound Mode</strong>
          <span>Prototype v0.1</span>
        </div>
      </section>

      <section className="status-grid">
        <Metric icon={Route} label="Miles traveled" value={`${stats.traveled.toFixed(1)} mi`} sub={`${stats.remaining.toFixed(1)} mi remaining`} />
        <Metric icon={Mountain} label="AT progress" value={`${stats.percent.toFixed(2)}%`} sub="Springer → Katahdin" />
        <Metric icon={ThermometerSun} label="Temp / weather" value={stats.temp} sub={stats.weather} />
        <Metric icon={Satellite} label="Altitude" value={stats.elevation} sub="GPS + elevation API later" />
      </section>

      <section className="main-grid">
        <div className="trail-map glass">
          <div className="section-title"><Route/> Trail ribbon</div>
          <svg viewBox="0 0 320 520" role="img" aria-label="Stylized Appalachian Trail route">
            <path className="terrain" d="M36 486 C88 430,58 384,124 334 C196 278,96 230,184 164 C232 128,206 74,284 34" />
            {waypoints.map((w, i) => {
              const pts = [[36,486],[84,420],[122,334],[166,256],[184,164],[236,92]];
              const [x,y] = pts[i];
              return <g key={w.name} className="pin"><circle cx={x} cy={y} r="8"/><text x={x+14} y={y+4}>{w.mile} mi · {w.name}</text></g>
            })}
          </svg>
          <div className="progress"><span style={{width: `${Math.max(4, stats.percent)}%`}} /></div>
        </div>

        <div className="panel glass">
          <div className="section-title"><LocateFixed/> Live location</div>
          <p className="muted">{geoStatus}</p>
          {position ? <div className="location-readout">
            <code>lat: {position.lat.toFixed(6)}</code>
            <code>lon: {position.lon.toFixed(6)}</code>
            <code>accuracy: ±{Math.round(position.accuracy)}m</code>
            <code>time: {position.timestamp}</code>
          </div> : <div className="placeholder-sensor">Waiting for phone GPS or future Pi serial GPS feed…</div>}
        </div>

        <div className="panel glass waypoints">
          <div className="section-title"><MapPin/> Waypoints</div>
          {waypoints.map(w => <article key={w.name}><strong>{w.type}: {w.name}</strong><span>Mile {w.mile} — {w.detail}</span></article>)}
        </div>

        <div className="panel glass">
          <div className="section-title"><ShieldAlert/> Camp + safety manuals</div>
          <div className="manual-grid">{manuals.map(({icon: Icon, title, text}) => <article key={title}><Icon/><strong>{title}</strong><p>{text}</p></article>)}</div>
        </div>
      </section>

      <section className="field-grid">
        <div className="panel glass plant-lab">
          <div className="section-title"><Camera/> Plant photo triage</div>
          <p className="muted">Upload from the phone camera over the app/hotspot first. Bluetooth file transfer can be a fallback, but the web upload path will be cleaner for trail use.</p>
          <label className="upload-box">
            <Upload/>
            <span>{plantPhoto ? `${plantPhoto.name} · ${plantPhoto.size}` : 'Choose a plant photo'}</span>
            <input type="file" accept="image/*" capture="environment" onChange={handlePlantPhoto} />
          </label>
          <div className="safety-callout"><AlertTriangle/> Never eat from AI output alone. Map-Pi will return confidence, lookalikes, poisonous warnings, and “do not consume” by default when uncertain.</div>
          <ul>{plantSources.map(source => <li key={source}>{source}</li>)}</ul>
        </div>

        <div className="panel glass drops-panel">
          <div className="section-title"><Users/> Trail-hand supply drops</div>
          <p className="muted">Meet-up spots can be visible on the hike. Requests should queue offline and send later through cellular/Wi-Fi/Supabase when service returns.</p>
          <div className="request-row">
            <input value={queuedRequest} onChange={(e) => setQueuedRequest(e.target.value)} placeholder="Request food, fuel, socks, water tabs…" />
            <button><Send size={16}/> Queue</button>
          </div>
          {dropLocations.map(drop => <article className="drop-card" key={drop.name}>
            <strong>{drop.name}</strong>
            <span>Mile {drop.mile} · {drop.status}</span>
            <p>{drop.supplies}</p>
            <small>{drop.eta}</small>
          </article>)}
        </div>
      </section>

      <section className="feeds glass">
        <div className="section-title"><RadioTower/> Architecture-ready feeds</div>
        <div className="feed-grid">{dataFeeds.map(([name,status,Icon]) => <div className="feed" key={name}><Icon size={20}/><strong>{name}</strong><span>{status}</span></div>)}</div>
      </section>

      <footer>Map-Pi runs as a web app first: phone screen now, Pi display later. Bluetooth can join the hike after Wi-Fi does the heavy lifting.</footer>
    </main>
  );
}

function Metric({icon: Icon, label, value, sub}) {
  return <article className="metric glass"><Icon/><span>{label}</span><strong>{value}</strong><small>{sub}</small></article>;
}

createRoot(document.getElementById('root')).render(<App />);
