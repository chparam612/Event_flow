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
let staffStatuses = {};   // { 'N1_North': { status, staffId, ... } }
let selectedZone = null;  // zone name currently selected on map
let simRunning = false;
let simSpeed = 1;
let simIntervalId = null;
let nudgesSent = 0;
let incidentsResolved = 0;

/* ─── Helpers ────────────────────────────────────────────────── */
function densityColor(d) {
    if (d > 0.80) return '#ff4d4d';
    if (d > 0.60) return '#ffd166';
    return '#00C49A';
}
function densityLabel(d) {
    if (d > 0.80) return 'CRITICAL';
    if (d > 0.60) return 'BUSY';
    return 'CLEAR';
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
    const gates = [
        { label: 'A', x: 130, y: 45 },  { label: 'B', x: 180, y: 30 },  { label: 'C', x: 320, y: 30 },
        { label: 'D', x: 370, y: 45 },  { label: 'E', x: 440, y: 120 }, { label: 'F', x: 440, y: 280 },
        { label: 'G', x: 370, y: 355 }, { label: 'H', x: 180, y: 370 }, { label: 'I', x: 60,  y: 120 },
    ];

    let svg = '<svg viewBox="0 0 500 470" class="cr-stadium-svg" xmlns="http://www.w3.org/2000/svg">';
    // Outer boundary
    svg += '<ellipse cx="250" cy="200" rx="220" ry="180" fill="none" stroke="#333" stroke-width="1" stroke-dasharray="6,3"/>';
    svg += '<ellipse cx="250" cy="200" rx="200" ry="160" fill="#111" stroke="#2a2a2a" stroke-width="2"/>';
    // Pitch
    svg += '<ellipse cx="250" cy="200" rx="60" ry="40" fill="#1a3a1a" stroke="#2a4a2a" stroke-width="1"/>';
    svg += '<line x1="250" y1="160" x2="250" y2="240" stroke="#2a4a2a" stroke-width="0.5"/>';
    svg += '<circle cx="250" cy="200" r="8" fill="none" stroke="#2a4a2a" stroke-width="0.5"/>';

    // Zones
    zones.forEach(z => {
        const col = densityColor(z.d);
        const pct = Math.round(z.d * 100);
        const isSel = selectedZone === z.id;
        const fillOpacity = isSel ? 0.45 : 0.25;
        const strokeW = isSel ? 3 : 1.5;
        const pulse = z.d > 0.80 ? ' class="zone-pulse"' : '';
        svg += '<g data-zone="' + z.id + '" style="cursor:pointer;"' + pulse + '>';
        svg += '<ellipse cx="' + z.cx + '" cy="' + z.cy + '" rx="' + z.rx + '" ry="' + z.ry + '" ';
        svg += 'fill="' + col + '" fill-opacity="' + fillOpacity + '" stroke="' + col + '" stroke-width="' + strokeW + '"/>';
        svg += '<text x="' + z.cx + '" y="' + (z.cy - 4) + '" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="Inter">' + z.label + '</text>';
        svg += '<text x="' + z.cx + '" y="' + (z.cy + 12) + '" text-anchor="middle" fill="' + col + '" font-size="13" font-weight="800" font-family="Inter">' + pct + '%</text>';
        svg += '</g>';
    });

    // Gates
    gates.forEach(g => {
        svg += '<g style="cursor:pointer;" data-gate="' + g.label + '">';
        svg += '<rect x="' + (g.x - 10) + '" y="' + (g.y - 8) + '" width="20" height="16" rx="3" fill="#222" stroke="#555" stroke-width="1"/>';
        svg += '<text x="' + g.x + '" y="' + (g.y + 4) + '" text-anchor="middle" fill="#888" font-size="9" font-weight="700" font-family="Inter">' + g.label + '</text>';
        svg += '</g>';
    });
    svg += '</svg>';
    return svg;
}

/* ─── Render ─────────────────────────────────────────────────── */
export function renderControl() {
    return '<div class="cr-screen" id="control-screen">' +

    /* ── HEADER ── */
    '<header class="cr-header">' +
        '<div class="cr-logo">EventFlow <span class="cr-role-tag">COMMAND</span></div>' +
        '<div class="cr-match-info">' +
            '<span class="match-live-badge"><span class="dot pulse"></span> LIVE</span>' +
            '<span style="color:var(--text-secondary);">IND vs AUS &bull; NMS Ahmedabad</span>' +
        '</div>' +
        '<div class="cr-header-right">' +
            '<div class="cr-header-stat" id="cr-header-count">— inside</div>' +
            '<div class="cr-time-box"><span class="cr-sim-time" id="cr-sim-time">18:00</span></div>' +
            '<button id="cr-logout-btn" aria-label="Logout from Control Room" style="background:transparent;border:1px solid #333;color:#555;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:0.78rem;margin-left:12px;transition:border-color 0.2s,color 0.2s;" onmouseover="this.style.borderColor=\'#ff4d4d\';this.style.color=\'#ff4d4d\'" onmouseout="this.style.borderColor=\'#333\';this.style.color=\'#555\'">Logout</button>' +
        '</div>' +
    '</header>' +

    /* ── BODY ── */
    '<div class="cr-body">' +

        /* LEFT: Staff Status */
        '<aside class="cr-sidebar left-panel" id="cr-staff-col">' +
            '<div class="cr-panel-title"><span class="dot" style="background:#00C49A;"></span> Staff Online</div>' +
            '<div id="cr-staff-list" class="cr-staff-roster"></div>' +
        '</aside>' +

        /* CENTER: Map */
        '<main class="cr-center" id="cr-map-col">' +
            '<div class="cr-heatmap-wrap" id="cr-map-container"></div>' +
            '<div class="cr-legend">' +
                '<div class="cr-legend-item"><span class="cr-legend-dot" style="background:#00C49A;"></span> Clear &lt;60%</div>' +
                '<div class="cr-legend-item"><span class="cr-legend-dot" style="background:#ffd166;"></span> Busy 60-80%</div>' +
                '<div class="cr-legend-item"><span class="cr-legend-dot" style="background:#ff4d4d;"></span> Critical &gt;80%</div>' +
            '</div>' +
        '</main>' +

        /* RIGHT: Actions & Alerts */
        '<aside class="cr-sidebar right-panel" id="cr-action-col">' +
            /* Alerts */
            '<div class="cr-panel-title"><span style="color:#ff4d4d;">&#9888;</span> Live Alerts</div>' +
            '<div id="cr-alerts-list" class="cr-alerts-list"></div>' +

            /* Instruction Dispatch */
            '<div class="cr-panel-title" style="margin-top:20px;">Instruction Dispatch</div>' +
            '<div id="cr-dispatch-panel" class="cr-dispatch-panel">' +
                '<div class="cr-dispatch-hint">Click a zone on the map to dispatch instructions</div>' +
            '</div>' +

            /* Metrics */
            '<div class="cr-panel-title" style="margin-top:20px;">Metrics</div>' +
            '<div class="cr-stat-grid" id="cr-metrics-grid">' +
                '<div class="cr-stat-tile"><span id="m-total">—</span><span>Total Inside</span></div>' +
                '<div class="cr-stat-tile"><span id="m-wait">3.2m</span><span>Avg Wait</span></div>' +
                '<div class="cr-stat-tile"><span id="m-staff">—/24</span><span>Staff Online</span></div>' +
                '<div class="cr-stat-tile"><span id="m-nudges">0</span><span>Nudges Sent</span></div>' +
                '<div class="cr-stat-tile"><span id="m-incidents">0</span><span>Incidents</span></div>' +
                '<div class="cr-stat-tile"><span id="m-avgdens">—</span><span>Avg Density</span></div>' +
            '</div>' +
        '</aside>' +

    '</div>' +

    /* ── BOTTOM BAR: Simulation Controls ── */
    '<footer class="cr-bottom-bar" id="cr-sim-bar">' +
        '<div class="cr-sim-controls">' +
            '<button class="cr-sim-btn" id="sim-play" aria-label="sim play">&#9654; Play</button>' +
            '<button class="cr-sim-btn" id="sim-pause" aria-label="sim pause">&#9208; Pause</button>' +
            '<button class="cr-sim-btn" id="sim-ff" aria-label="sim ff">&#9193; Fast 5x</button>' +
        '</div>' +
        '<div class="cr-sim-timeline">' +
            '<span>6PM</span>' +
            '<input type="range" min="0" max="100" value="0" id="sim-scrubber" class="cr-scrubber"/>' +
            '<span>2AM</span>' +
        '</div>' +
        '<div class="cr-sim-label">Demo mode &mdash; simulated crowd data</div>' +
    '</footer>' +

    '</div>';
}

/* ─── Init ───────────────────────────────────────────────────── */
export function initControl() {
    // Prevent back navigation getting stuck
    window.addEventListener('popstate', (e) => {
        e.preventDefault();
        import('/src/auth.js').then(({ getCurrentUser }) => {
            const user = getCurrentUser();
            if (!user) {
                window.location.href = '/control-login';
            }
        });
    });
    // Also disable browser back from control room
    history.pushState(null, null, window.location.href);

    const densities = getZoneDensity();

    // ... rest of initialization ...
    const logoutBtn = document.getElementById('cr-logout-btn');
    if (logoutBtn) {
        // Remove old listeners by cloning
        const newBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
        
        newBtn.addEventListener('click', async () => {
            newBtn.textContent = 'Logging out...';
            newBtn.disabled = true;
            
            try {
                const { auth } = await import('/src/firebase.js');
                const { signOut, getAuth } = await import(
                    'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
                );
                const fireAuth = getAuth();
                await signOut(fireAuth);
            } catch(e) {
                console.log('SignOut error (continuing):', e);
            } finally {
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace('/');
            }
        });
        console.log('✅ Logout button fixed');
    }

    // Existing event bindings...
    refreshMap(densities);
    refreshStaffList(densities);
    refreshAlerts(densities);
    refreshMetrics(densities);

    // ── Firebase Realtime Listeners ────────────────────────────
    // /staff — live staff status from ground stewards
    listenStaff((data) => {
        if (!data) return;
        staffStatuses = data;
        const d = getZoneDensity();
        refreshStaffList(d);
        refreshMap(d);
        refreshAlerts(d);
    });

    // /zones — zone density data (also written by this panel's sim tick)
    listenZones((data) => {
        if (!data) return;
        // Merge Firebase zone data into local view
        const d = getZoneDensity();
        Object.keys(data).forEach(zKey => {
            const zoneName = zKey.replace(/_/g, ' ');
            if (data[zKey].density !== undefined && d[zoneName] !== undefined) {
                d[zoneName] = data[zKey].density / 100;
            }
        });
    });

    // /instructions — monitor acknowledgments in real-time
    listenInstructions((data) => {
        if (!data) return;
        // Could show ack counts in dispatch panel
    });

    // ── Map Zone Click Binding ─────────────────────────────────
    document.getElementById('cr-map-container')?.addEventListener('click', (e) => {
        const zoneEl = e.target.closest('[data-zone]');
        if (zoneEl) {
            selectedZone = zoneEl.getAttribute('data-zone');
            const d = getZoneDensity();
            refreshMap(d);
            refreshDispatch(d);
        }
    });

    // ── Simulation Tick Helper (writes zones to Firebase) ──────
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
        // Write zone densities to Firebase /zones/{zoneId}
        Object.keys(d).forEach(zoneName => {
            const score = d[zoneName];
            const status = score > 0.80 ? 'critical' : score > 0.60 ? 'busy' : 'clear';
            writeZone(zoneName.replace(/\s/g, '_'), Math.round(score * 100), status);
        });
    };

    // ── Simulation Controls ────────────────────────────────────
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
}

/* ─── Refresh Helpers ────────────────────────────────────────── */
function refreshMap(densities) {
    const container = document.getElementById('cr-map-container');
    if (!container) return;
    container.innerHTML = buildStadiumSVG(densities);

    const inside = totalInside(densities);
    const hdr = document.getElementById('cr-header-count');
    if (hdr) hdr.textContent = inside.toLocaleString() + ' inside';
}

function refreshStaffList(densities) {
    const el = document.getElementById('cr-staff-list');
    if (!el) return;

    let staffOnline = 0;
    el.innerHTML = STAFF_ROSTER.map(s => {
        const key = s.id + '_' + s.zone.split(' ')[0];
        const liveStatus = staffStatuses[key];
        const isCrowded = liveStatus && liveStatus.status === 'CROWDED';
        const isOnline = !!liveStatus;
        if (isOnline) staffOnline++;
        const dot = isCrowded ? '#ff4d4d' : (isOnline ? '#00C49A' : '#555');
        const statusText = isCrowded ? '&#9888;&#65039; CROWDED' : (isOnline ? '&#10003;' : 'offline');
        const timeStr = isOnline ? fmtTime(new Date(liveStatus.timestamp)) : '';

        return '<div class="cr-staff-row' + (isCrowded ? ' crowded' : '') + '" data-staff="' + s.id + '">' +
            '<span class="cr-staff-dot" style="background:' + dot + ';"></span>' +
            '<span class="cr-staff-id">' + s.id + '</span>' +
            '<span class="cr-staff-name">' + s.name + '</span>' +
            '<span class="cr-staff-status" style="color:' + dot + ';">' + statusText + '</span>' +
            (timeStr ? '<span class="cr-staff-time">' + timeStr + '</span>' : '') +
        '</div>';
    }).join('');

    const mStaff = document.getElementById('m-staff');
    if (mStaff) mStaff.textContent = staffOnline + '/24';
}

function refreshAlerts(densities) {
    const el = document.getElementById('cr-alerts-list');
    if (!el) return;

    const alerts = [];
    Object.keys(densities).forEach(zone => {
        const d = densities[zone];
        if (d > 0.80) {
            alerts.push({ zone: zone, pct: Math.round(d * 100), level: d > 0.95 ? 'severe' : 'critical' });
        }
    });

    if (alerts.length === 0) {
        el.innerHTML = '<div class="cr-no-alerts">All zones nominal</div>';
        return;
    }

    el.innerHTML = alerts.sort((a, b) => b.pct - a.pct).map(a => {
        const icon = a.level === 'severe' ? '&#128680;' : '&#9888;&#65039;';
        return '<div class="cr-alert-card ' + a.level + '">' +
            '<div class="cr-alert-icon">' + icon + '</div>' +
            '<div class="cr-alert-body">' +
                '<div class="cr-alert-zone">' + a.zone + '</div>' +
                '<div class="cr-alert-pct">' + a.pct + '% ' + (a.level === 'severe' ? 'SEVERE' : 'CRITICAL') + '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}

function refreshDispatch(densities) {
    const el = document.getElementById('cr-dispatch-panel');
    if (!el || !selectedZone) return;

    const d = densities[selectedZone] || 0;
    const pct = Math.round(d * 100);
    const col = densityColor(d);

    el.innerHTML =
        '<div class="cr-dispatch-selected">' +
            '<div class="cr-dispatch-zone" style="border-left-color:' + col + ';">' +
                '<strong>' + selectedZone + '</strong> <span style="color:' + col + ';">' + pct + '%</span>' +
            '</div>' +
        '</div>' +
        '<div class="cr-dispatch-quick">' +
            QUICK_INSTRUCTIONS.map(instr =>
                '<button class="cr-quick-btn" data-instr="' + instr + '" aria-label="Action button">' + instr + '</button>'
            ).join('') +
        '</div>' +
        '<div class="cr-dispatch-nudge">' +
            '<label class="cr-nudge-label">Send nudge to ' + selectedZone + ' attendees?</label>' +
            '<input type="text" class="cr-nudge-input" id="nudge-msg" placeholder="Gate 11 is clearest right now" value="Gate 11 is clearest right now"/>' +
            '<button class="cr-send-all-btn" id="send-staff-attendee" aria-label="send staff attendee">SEND TO STAFF + ATTENDEES</button>' +
        '</div>';

    // Bind quick instruction buttons
    el.querySelectorAll('.cr-quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('data-instr');
            pushInstruction(selectedZone, text);
            btn.textContent = '✓ Sent';
            btn.disabled = true;
            btn.classList.add('sent');
        });
    });

    // Bind send-all button
    document.getElementById('send-staff-attendee')?.addEventListener('click', () => {
        const msg = document.getElementById('nudge-msg')?.value;
        if (!msg) return;
        // Push instruction for staff
        pushInstruction(selectedZone, msg);
        // Push nudge for attendees
        pushNudge(selectedZone, msg);
        nudgesSent++;
        document.getElementById('m-nudges').textContent = nudgesSent;
        const sendBtn = document.getElementById('send-staff-attendee');
        if (sendBtn) {
            sendBtn.textContent = '✓ SENT';
            sendBtn.classList.add('sent');
            setTimeout(() => {
                sendBtn.textContent = 'SEND TO STAFF + ATTENDEES';
                sendBtn.classList.remove('sent');
            }, 2000);
        }
    });
}

function refreshMetrics(densities) {
    const inside = totalInside(densities);
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('m-total', inside.toLocaleString());
    el('m-nudges', nudgesSent);
    el('m-incidents', incidentsResolved);

    const vals = Object.values(densities).filter(v => v > 0);
    const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    el('m-avgdens', Math.round(avg * 100) + '%');
    el('m-wait', (2 + avg * 6).toFixed(1) + 'm');
}

function updateScrubber(timeStr) {
    const scrubber = document.getElementById('sim-scrubber');
    if (!scrubber || !timeStr) return;
    const parts = timeStr.split(':');
    let h = parseInt(parts[0]), m = parseInt(parts[1]);
    let totalMin = h * 60 + m;
    // 6PM = 1080, 2AM = 1560  (next day)
    if (totalMin < 360) totalMin += 1440; // handle past midnight
    const pct = Math.max(0, Math.min(100, ((totalMin - 1080) / 480) * 100));
    scrubber.value = pct;
}
