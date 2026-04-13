/**
 * Control Room — Command Center Dashboard
 * Desktop-first, 3-column layout for NMS Ahmedabad
 * Consumes simulation + Firebase Realtime Database
 */
import { getZoneDensity, simulateTick, ZONES } from '/src/simulation.js';
import {
    listenStaff, listenZones, listenInstructions,
    pushInstruction, pushNudge, writeZone,
    pushData
} from '/src/firebase.js';
import { logout } from '/src/auth.js';

/* ─── Constants ──────────────────────────────────────────────── */
const STAFF_ROSTER = [
    { id: 'N1', name: 'Ramesh',  zone: 'North Stand' },
    { id: 'N2', name: 'Priya',   zone: 'North Stand' },
    { id: 'N3', name: 'Vikram',  zone: 'North Stand' },
    { id: 'N4', name: 'Kavita',  zone: 'North Stand' },
    { id: 'S1', name: 'Anita',   zone: 'South Stand' },
    { id: 'S2', name: 'Deepak',  zone: 'South Stand' },
    { id: 'E1', name: 'Suresh',  zone: 'East Stand' },
    { id: 'E2', name: 'Meena',   zone: 'East Stand' },
    { id: 'W1', name: 'Rakesh',  zone: 'West Stand' },
    { id: 'W2', name: 'Sunita',  zone: 'West Stand' },
    { id: 'GA', name: 'Arun',    zone: 'Gate Area' },
    { id: 'GB', name: 'Neha',    zone: 'Gate Area' },
    { id: 'GC', name: 'Manoj',   zone: 'Gate Area' },
    { id: 'GD', name: 'Sonia',   zone: 'Gate Area' },
    { id: 'GE', name: 'Rajiv',   zone: 'Gate Area' },
    { id: 'GF', name: 'Lata',    zone: 'Gate Area' },
    { id: 'GG', name: 'Kiran',   zone: 'Gate Area' },
    { id: 'GH', name: 'Bindu',   zone: 'Gate Area' },
    { id: 'GI', name: 'Pankaj',  zone: 'Gate Area' },
    { id: 'P1', name: 'Hari',    zone: 'Parking Zone' },
    { id: 'P2', name: 'Jaya',    zone: 'Parking Zone' },
    { id: 'P3', name: 'Ravi',    zone: 'Parking Zone' },
    { id: 'P4', name: 'Seema',   zone: 'Parking Zone' },
    { id: 'NC', name: 'Amit',    zone: 'North Concourse' },
];

const QUICK_INSTRUCTIONS = [
    'Gate 9 band karo',
    'Gate 11 open karo',
    'Crowd redirect karo',
    'Medical team bulao',
    'PA announcement karo',
    'VIP area clear karo',
];

/* ─── State ──────────────────────────────────────────────────── */
let staffStatuses = {};   
let selectedZone = null;  
let simRunning = false;
let simSpeed = 1;
let simIntervalId = null;
let nudgesSent = 0;

/* ─── Helpers ────────────────────────────────────────────────── */
function densityColor(d) {
    if (d > 0.80) return 'var(--danger-color)';
    if (d > 0.60) return 'var(--warning-color)';
    return 'var(--primary-color)';
}

function fmtTime(date) {
    if (!date) date = new Date();
    let h = date.getHours(), m = date.getMinutes();
    let ampm = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return h + ':' + m.toString().padStart(2, '0') + ' ' + ampm;
}

function totalInside(densities) {
    let total = 0;
    const caps = { 'North Stand': 22000, 'South Stand': 22000, 'East Stand': 18000, 'West Stand': 18000,
                   'North Concourse': 5000, 'South Concourse': 5000, 'Gate Area': 3000, 'Parking Zone': 6000 };
    Object.keys(densities).forEach(z => {
        total += Math.round((densities[z] || 0) * (caps[z] || 5000));
    });
    return total;
}

/* ─── SVG Stadium Schematic ──────────────────────────────────── */
function buildStadiumSVG(densities) {
    const zones = [
        { id: 'North Stand',      label: 'NORTH', cx: 250, cy: 60,  rx: 100, ry: 30, d: densities['North Stand'] || 0 },
        { id: 'South Stand',      label: 'SOUTH', cx: 250, cy: 340, rx: 100, ry: 30, d: densities['South Stand'] || 0 },
        { id: 'East Stand',       label: 'EAST',  cx: 420, cy: 200, rx: 30,  ry: 80, d: densities['East Stand'] || 0 },
        { id: 'West Stand',       label: 'WEST',  cx: 80,  cy: 200, rx: 30,  ry: 80, d: densities['West Stand'] || 0 },
        { id: 'North Concourse',  label: 'N-CON', cx: 250, cy: 120, rx: 60,  ry: 18, d: densities['North Concourse'] || 0 },
        { id: 'South Concourse',  label: 'S-CON', cx: 250, cy: 280, rx: 60,  ry: 18, d: densities['South Concourse'] || 0 },
        { id: 'Gate Area',        label: 'GATES', cx: 250, cy: 400, rx: 80,  ry: 16, d: densities['Gate Area'] || 0 },
        { id: 'Parking Zone',     label: 'PARK',  cx: 250, cy: 440, rx: 60,  ry: 14, d: densities['Parking Zone'] || 0 },
    ];

    let svg = `<svg viewBox="0 0 500 470" class="cr-stadium-svg" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<ellipse cx="250" cy="200" rx="220" ry="180" fill="none" stroke="var(--glass-border)" stroke-width="1" stroke-dasharray="6,3"/>`;
    svg += `<ellipse cx="250" cy="200" rx="200" ry="160" fill="rgba(0,0,0,0.4)" stroke="var(--glass-border)" stroke-width="2"/>`;
    svg += `<ellipse cx="250" cy="200" rx="60" ry="40" fill="rgba(0,229,180,0.05)" stroke="var(--primary-color)" stroke-width="0.5" opacity="0.3"/>`;

    zones.forEach(z => {
        const col = densityColor(z.d);
        const pct = Math.round(z.d * 100);
        const isSel = selectedZone === z.id;
        const fillOpacity = isSel ? 0.35 : 0.15;
        const strokeW = isSel ? 2 : 0.5;
        const pulse = z.d > 0.80 ? ' class="severe"' : '';

        svg += `<g data-zone="${z.id}" style="cursor:pointer;"${pulse}>
            <ellipse cx="${z.cx}" cy="${z.cy}" rx="${z.rx}" ry="${z.ry}" 
                     fill="${col}" fill-opacity="${fillOpacity}" 
                     stroke="${isSel ? '#fff' : col}" stroke-width="${strokeW}" />
            <text x="${z.cx}" y="${z.cy - 4}" text-anchor="middle" fill="#fff" font-size="10" font-weight="800" style="pointer-events:none; opacity:0.8;">${z.label}</text>
            <text x="${z.cx}" y="${z.cy + 12}" text-anchor="middle" fill="${col}" font-size="${isSel ? 16 : 14}" font-weight="900" style="pointer-events:none;">${pct}%</text>
        </g>`;
    });

    svg += '</svg>';
    return svg;
}

/* ─── Render ─────────────────────────────────────────────────── */
export function renderControl() {
    return `
    <div class="cr-screen">
        <!-- Header -->
        <header class="cr-header">
            <div class="cr-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="3">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                EventFlow 
                <span class="cr-role-tag">COMMAND CENTER</span>
            </div>
            
            <div class="cr-header-right" style="display:flex; align-items:center; gap:30px;">
                <div class="cr-sim-time" id="cr-sim-time">00:00:00</div>
                <button class="cr-sim-btn" id="cr-logout-btn" style="border-color:var(--danger-color); color:var(--danger-color); opacity:0.6;">Logout</button>
            </div>
        </header>

        <!-- Main Body -->
        <main class="cr-body">
            
            <!-- LEFT: Staff & Metrics -->
            <aside class="left-panel">
                <div class="cr-panel-title">System Metrics</div>
                <div class="cr-stat-grid" style="margin-bottom: 30px;">
                    <div class="cr-stat-tile">
                        <span id="stat-attendance" class="tech-font">—</span>
                        <span>Total Fans</span>
                    </div>
                    <div class="cr-stat-tile">
                        <span id="stat-peak" class="tech-font">—</span>
                        <span>Avg Loading</span>
                    </div>
                    <div class="cr-stat-tile">
                        <span id="stat-staff-count" class="tech-font">—</span>
                        <span>Staff Online</span>
                    </div>
                    <div class="cr-stat-tile">
                        <span id="stat-alerts" class="tech-font" style="color:var(--primary-color);">0</span>
                        <span>Active Alerts</span>
                    </div>
                </div>

                <div class="cr-panel-title">Ground Stewards</div>
                <div class="cr-staff-roster" id="cr-staff-list">
                    <div class="cr-no-alerts">Connecting to field units...</div>
                </div>
            </aside>

            <!-- CENTER: Heatmap -->
            <section class="cr-center">
                <div class="cr-panel-title">Spatial Awareness Heatmap</div>
                <div class="cr-heatmap-wrap" id="cr-map-container">
                    <!-- SVG map injected by initControl once -->
                </div>
                <div class="cr-legend">
                    <div class="cr-legend-item"><span class="cr-legend-dot" style="background:var(--primary-color);"></span> Clear</div>
                    <div class="cr-legend-item"><span class="cr-legend-dot" style="background:var(--warning-color);"></span> Busy</div>
                    <div class="cr-legend-item"><span class="cr-legend-dot" style="background:var(--danger-color); border:1px solid #fff;"></span> Critical</div>
                </div>
            </section>

            <!-- RIGHT: Dispatch & Alerts -->
            <aside class="right-panel">
                <div class="cr-panel-title">Active Alerts</div>
                <div class="cr-alerts-list" id="cr-alerts-list">
                    <div class="cr-no-alerts">No current anomalies detected.</div>
                </div>

                <div class="cr-panel-title" style="margin-top:30px;">Strategic Dispatch</div>
                <div id="cr-dispatch-panel">
                    <div class="cr-no-alerts">Select a zone on the map to issue instructions</div>
                </div>
            </aside>
            
        </main>

        <!-- Bottom Bar: Sim Controls -->
        <footer class="cr-bottom-bar">
            <div class="cr-sim-controls">
                <button class="cr-sim-btn" id="sim-play">▶ Play</button>
                <button class="cr-sim-btn" id="sim-pause">⏸ Pause</button>
                <button class="cr-sim-btn" id="sim-ff">⏩ Fast</button>
            </div>
            <div style="flex:1; display:flex; align-items:center; gap:20px;">
                <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700; letter-spacing:1px;">TIMELINE</span>
                <input type="range" class="cr-scrubber" id="cr-scrubber" min="1080" max="1560" value="1140">
            </div>
            <div class="match-live-badge">
                <span class="dot pulse" style="background:var(--primary-color);"></span> SIMULATION ENGINE LIVE
            </div>
        </footer>
    </div>`;
}

/* ─── Init ───────────────────────────────────────────────────── */
export function initControl() {
    window.addEventListener('popstate', () => {
        import('/src/auth.js').then(({ getCurrentUser }) => {
            getCurrentUser().then(user => {
                if (!user) {
                    window.location.replace('/control-login');
                }
            });
        });
    });
    history.pushState(null, null, window.location.href);

    const densities = getZoneDensity();
    const unsubs = [];

    // Wait for DOM then attach logout
    function attachLogout() {
        const btn = document.getElementById('cr-logout-btn');
        if (!btn) {
            setTimeout(attachLogout, 200);
            return;
        }
        console.log('✅ Logout btn found');
        btn.addEventListener('click', async () => {
            console.log('🔴 Logout clicked');
            btn.textContent = 'Logging out...';
            btn.disabled = true;
            const { logout } = await import('/src/auth.js');
            await logout();
        });
    }
    setTimeout(attachLogout, 300);

    refreshMap(densities);
    refreshStaffList(densities);
    refreshAlerts(densities);
    refreshMetrics(densities);

    // Listeners
    unsubs.push(listenStaff((data) => {
        if (!data) return;
        staffStatuses = data;
        const d = getZoneDensity();
        refreshStaffList(d);
        refreshMetrics(d);
    }));

    unsubs.push(listenZones((data) => {
        if (!data) return;
        const d = getZoneDensity();
        Object.keys(data).forEach(zKey => {
            const zoneName = zKey.replace(/_/g, ' ');
            if (data[zKey].density !== undefined && d[zoneName] !== undefined) {
                d[zoneName] = data[zKey].density / 100;
            }
        });
        refreshMap(d);
        refreshAlerts(d);
        refreshMetrics(d);
    }));

    // Map Click
    const mapContainer = document.getElementById('cr-map-container');
    const handleMapClick = (e) => {
        const zoneEl = e.target.closest('[data-zone]');
        if (zoneEl) {
            selectedZone = zoneEl.getAttribute('data-zone');
            const d = getZoneDensity();
            refreshMap(d);
            refreshDispatch(d);
        }
    };
    mapContainer?.addEventListener('click', handleMapClick);

    // Sim Tick
    const runTick = () => {
        const t = simulateTick();
        const timeEl = document.getElementById('cr-sim-time');
        if (timeEl) timeEl.textContent = t;
        const d = getZoneDensity();
        refreshMap(d);
        refreshStaffList(d);
        refreshAlerts(d);
        refreshMetrics(d);
        if (selectedZone) refreshDispatch(d);
        updateScrubber(t);

        Object.keys(d).forEach(zoneName => {
            const score = d[zoneName];
            const status = score > 0.80 ? 'critical' : score > 0.60 ? 'busy' : 'clear';
            writeZone(zoneName.replace(/\s/g, '_'), Math.round(score * 100), status);
        });
    };

    // Controls
    document.getElementById('sim-play')?.addEventListener('click', () => {
        if (simRunning) return;
        simRunning = true;
        simIntervalId = setInterval(runTick, 1000 / simSpeed);
    });

    document.getElementById('sim-pause')?.addEventListener('click', () => {
        simRunning = false;
        if (simIntervalId) clearInterval(simIntervalId);
        simIntervalId = null;
    });

    document.getElementById('sim-ff')?.addEventListener('click', () => {
        simSpeed = simSpeed === 5 ? 1 : 5;
        const btn = document.getElementById('sim-ff');
        if (btn) btn.textContent = simSpeed === 5 ? '⏩ Normal 1x' : '⏩ Fast 5x';
        if (simRunning) {
            clearInterval(simIntervalId);
            simIntervalId = setInterval(runTick, 1000 / simSpeed);
        }
    });

    return () => {
        if (simIntervalId) clearInterval(simIntervalId);
        unsubs.forEach(fn => fn && fn());
        // No need to removeEventListeners for popstate manually if we're replacing the whole page
        // but normally we would if it stayed. Here we'll just leave it since the user's snippet 
        // focus was on initialization.
        mapContainer?.removeEventListener('click', handleMapClick);
    };
}

/* ─── Refresh Helpers ────────────────────────────────────────── */
function refreshMap(densities) {
    const container = document.getElementById('cr-map-container');
    if (!container) return;

    // 1. Ensure SVG base exists
    let svg = container.querySelector('svg');
    if (!svg) {
        container.innerHTML = buildStadiumSVG(densities);
        return;
    }

    // 2. Update specific zones
    Object.keys(densities).forEach(zId => {
        const group = svg.querySelector(`g[data-zone="${zId}"]`);
        if (!group) return;
        
        const d = densities[zId];
        const col = densityColor(d);
        const pct = Math.round(d * 100);
        const isSel = selectedZone === zId;

        // Update ellipse
        const ellipse = group.querySelector('ellipse');
        if (ellipse) {
            ellipse.setAttribute('fill', col);
            ellipse.setAttribute('fill-opacity', isSel ? '0.35' : '0.15');
            ellipse.setAttribute('stroke', isSel ? '#fff' : col);
            ellipse.setAttribute('stroke-width', isSel ? '2' : '0.5');
        }

        // Update percentage text (usually the second text element)
        const texts = group.querySelectorAll('text');
        if (texts.length >= 2) {
            const pctText = texts[1];
            pctText.textContent = `${pct}%`;
            pctText.setAttribute('fill', col);
            pctText.setAttribute('font-size', isSel ? '16' : '14');
        }

        // Pulse effect
        if (d > 0.80) group.classList.add('severe');
        else group.classList.remove('severe');
    });
}

function refreshStaffList(densities) {
    const el = document.getElementById('cr-staff-list');
    if (!el) return;

    STAFF_ROSTER.forEach(s => {
        const key = s.id + '_' + s.zone.split(' ')[0];
        const live = staffStatuses[key];
        const isOnline = !!live;
        const isAler = live && live.status === 'CROWDED';
        
        const dotCol = isAler ? 'var(--danger-color)' : (isOnline ? 'var(--primary-color)' : '#333');
        
        let row = el.querySelector(`[data-staff="${s.id}"]`);
        if (!row) {
             // Initial creation if needed
             if (el.querySelector('.cr-no-alerts')) el.innerHTML = '';
             row = document.createElement('div');
             row.className = 'cr-staff-row';
             row.setAttribute('data-staff', s.id);
             row.innerHTML = `
                <div style="flex:1;">
                    <div class="cr-staff-name">${s.name}</div>
                    <div class="cr-staff-id">${s.id} &bull; ${s.zone}</div>
                </div>
                <div class="live-tag" style="font-weight:900; font-size:0.6rem; letter-spacing:1px;"></div>
             `;
             el.appendChild(row);
        }

        // Update properties
        row.style.borderLeft = `3px solid ${dotCol}`;
        row.className = `cr-staff-row ${isAler ? 'severe' : ''}`;
        const tag = row.querySelector('.live-tag');
        if (tag) {
            tag.textContent = isAler ? 'CROWDED' : (isOnline ? 'LIVE' : 'OFF');
            tag.style.color = dotCol;
        }
    });
}

function refreshAlerts(densities) {
    const el = document.getElementById('cr-alerts-list');
    if (!el) return;

    const alerts = [];
    Object.keys(densities).forEach(zone => {
        const d = densities[zone];
        if (d > 0.82) alerts.push({ zone, pct: Math.round(d * 100), severe: d > 0.92 });
    });

    if (alerts.length === 0) {
        el.innerHTML = `<div class="cr-no-alerts">All systems nominal</div>`;
        return;
    }

    el.innerHTML = alerts.map(a => `
        <div class="cr-alert-card ${a.severe ? 'severe' : ''}">
            <div style="flex:1;">
                <div style="color:#fff; font-weight:800; font-size:0.9rem;">${a.zone}</div>
                <div style="color:var(--danger-color); font-size:0.75rem; font-weight:700;">DENSITY: ${a.pct}%</div>
            </div>
            <div class="pulse" style="width:10px; height:10px; background:var(--danger-color); border-radius:50%;"></div>
        </div>
    `).join('');
}

function refreshDispatch(densities) {
    const el = document.getElementById('cr-dispatch-panel');
    if (!el || !selectedZone) return;

    const d = densities[selectedZone] || 0;
    const pct = Math.round(d * 100);
    const col = densityColor(d);

    el.innerHTML = `
    <div class="cr-dispatch-selected">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <strong style="color:#fff;">${selectedZone}</strong>
            <span style="color:${col}; font-family:var(--font-tech); font-size:1.2rem;">${pct}%</span>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            ${QUICK_INSTRUCTIONS.map(instr => `
                <button class="cr-quick-btn" style="padding:8px; font-size:0.65rem;" data-instr="${instr}">${instr}</button>
            `).join('')}
        </div>
        <div style="margin-top:20px;">
            <input type="text" class="cr-nudge-input" id="nudge-msg" value="Redirecting flow from Gate 11">
            <button class="cr-sim-btn" style="width:100%; margin-top:10px; background:var(--primary-color); color:#000;" id="send-btn">Push Strategic Nudge</button>
        </div>
    </div>`;

    el.querySelectorAll('.cr-quick-btn').forEach(btn => {
        btn.onclick = () => {
            pushInstruction(selectedZone, btn.dataset.instr);
            btn.textContent = 'SENT';
            btn.style.borderColor = 'var(--primary-color)';
        };
    });

    const sendBtn = el.querySelector('#send-btn');
    if (sendBtn) {
        sendBtn.onclick = () => {
            const msg = el.querySelector('#nudge-msg').value;
            pushInstruction(selectedZone, msg);
            pushNudge(selectedZone, msg);
            sendBtn.textContent = '✓ TRANSMITTED';
            setTimeout(() => sendBtn.textContent = 'Push Strategic Nudge', 2000);
        };
    }
}

function refreshMetrics(densities) {
    const inside = totalInside(densities);
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('stat-attendance', (inside / 1000).toFixed(1) + 'k');
    
    let online = 0;
    Object.keys(staffStatuses).forEach(k => { if(staffStatuses[k]) online++; });
    el('stat-staff-count', online);

    const alerts = Object.values(densities).filter(v => v > 0.82).length;
    el('stat-alerts', alerts);

    const vals = Object.values(densities).filter(v => v > 0);
    const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    el('stat-peak', Math.round(avg * 100) + '%');
}

function updateScrubber(timeStr) {
    const scrubber = document.getElementById('cr-scrubber');
    if (!scrubber || !timeStr) return;
    const parts = timeStr.split(':');
    let h = parseInt(parts[0]), m = parseInt(parts[1]);
    let totalMin = h * 60 + m;
    if (totalMin < 360) totalMin += 1440; 
    scrubber.value = totalMin;
}
