import { getZoneDensity, getExitPlan, simulateTick, ZONES } from '/src/simulation.js';
import { db, ref, onValue, push, onSync, pushSync } from '/src/firebase.js';

const ZONE_META = [
    { key: ZONES.NORTH_STAND,     label: 'North Stand',     short: 'N'  },
    { key: ZONES.SOUTH_STAND,     label: 'South Stand',     short: 'S'  },
    { key: ZONES.EAST_STAND,      label: 'East Stand',      short: 'E'  },
    { key: ZONES.WEST_STAND,      label: 'West Stand',      short: 'W'  },
    { key: ZONES.NORTH_CONCOURSE, label: 'North Concourse', short: 'NC' },
    { key: ZONES.SOUTH_CONCOURSE, label: 'South Concourse', short: 'SC' },
    { key: ZONES.GATE_AREA,       label: 'Gate Area',       short: 'G'  },
    { key: ZONES.PARKING_ZONE,    label: 'Parking Zone',    short: 'P'  },
];

const statusOf = (score) => {
    if (score > 0.85) return { label: 'CRITICAL', color: '#ff4d4d', bg: 'rgba(255,77,77,0.12)' };
    if (score > 0.6)  return { label: 'BUSY',     color: '#ffd166', bg: 'rgba(255,209,102,0.1)' };
    return                   { label: 'CLEAR',    color: '#00C49A', bg: 'rgba(0,196,154,0.08)' };
};

/* ─── SVG Heatmap ─ Simplified for demonstration ───────────────── */
function buildPlaceholderSVG() {
    return `<div style="width:100%; height:100%; min-height:300px; display:flex; align-items:center; justify-content:center; background:#121212; border:1px solid #333; color:#555; position:relative;">
        <div style="width:180px; height:120px; border:4px solid #222; border-radius:60px;"></div>
        <div style="position:absolute; bottom:15%; color:var(--text-secondary); font-size:0.75rem;">Live Heatmap Context Active</div>
    </div>`;
}

function buildZoneRow(zm, score) {
    const s = statusOf(score);
    const pct = Math.round(score * 100);
    return `
    <div class="cr-zone-row" style="border-left-color:${s.color};">
        <div class="cr-zone-info">
            <span class="cr-zone-name">${zm.label}</span>
            <span class="cr-zone-status" style="color:${s.color}; background:${s.bg};">${s.label}</span>
        </div>
        <div class="cr-zone-bar-wrap">
            <div class="cr-zone-bar-track">
                <div class="cr-zone-bar-fill" style="width:${Math.min(pct,100)}%; background:${s.color};"></div>
            </div>
            <span class="cr-zone-pct" style="color:${s.color};">${pct}%</span>
        </div>
    </div>`;
}

let logLines = [
    { t: '18:00', msg: 'System online — Narendra Modi Stadium', type: 'ok' },
];

function addLog(msg, type = 'ok') {
    const now = new Date();
    const t = now.getHours() + ':' + now.getMinutes().toString().padStart(2,'0');
    logLines.unshift({ t, msg, type });
    if (logLines.length > 15) logLines.pop();
    const logEl = document.getElementById('cr-log-container');
    if (logEl) {
        logEl.innerHTML = logLines.map(l => {
            const col = l.type === 'warn' ? '#ff4d4d' : l.type === 'caution' ? '#ffd166' : '#00C49A';
            return '<div class="cr-log-line"><span class="cr-log-time">' + l.t + '</span><span style="color:' + col + ';">[' + l.type.toUpperCase() + ']</span> ' + l.msg + '</div>';
        }).join('');
    }
}

export function renderControl() {
    return `
    <div class="cr-screen" id="control-screen">
        <header class="cr-header">
            <div class="cr-logo">EventFlow <span class="cr-role-tag">COMMAND</span></div>
            <div class="cr-match-info">
                <span class="match-live-badge"><span class="dot pulse"></span> LIVE</span> IND vs AUS
            </div>
            <div class="cr-time-box">
                <span class="cr-sim-time" id="cr-sim-time">18:00</span>
                <button class="tick-btn" id="cr-tick-btn">⏩ +30s</button>
            </div>
        </header>

        <div class="cr-body">
            <!-- Sidebar: Staff Comms -->
            <aside class="cr-sidebar right-panel" style="flex: 0 0 320px;">
                <div class="cr-panel-title">Send Instructions</div>
                <div class="cr-instruct-box" style="margin-bottom: 20px;">
                    <textarea id="cr-instruct-text" placeholder="Type instruction for staff..." rows="2" style="width:100%; background:#1a1a1a; border:1px solid #333; color:#fff; padding:10px; border-radius:6px; font-family:inherit;"></textarea>
                    <button class="primary-btn" id="cr-send-instruct-btn" style="margin-top:8px; width:100%; border-radius:6px; height:40px;">Broadcast to Staff →</button>
                </div>

                <div class="cr-panel-title">Staff Ground Status</div>
                <div id="cr-staff-status-list" class="cr-staff-list" style="margin-bottom: 20px;">
                    <p style="font-size:0.8rem; color:#555;">Waiting for staff signals...</p>
                </div>

                <div class="cr-panel-title">Emergency Controls</div>
                <div class="cr-emergency-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <button class="cr-emergency-btn warn" id="btn-announce" style="background:#ff9f4322; color:#ff9f43; border:1px solid #ff9f4344; padding:10px; border-radius:6px;">📢 Announce</button>
                    <button class="cr-emergency-btn alert" id="btn-lockdown" style="background:#ff4d4d22; color:#ff4d4d; border:1px solid #ff4d4d44; padding:10px; border-radius:6px;">🔒 Lockdown</button>
                    <button class="cr-emergency-btn info" id="btn-medical" style="background:#0582ca22; color:#0582ca; border:1px solid #0582ca44; padding:10px; border-radius:6px;">🚑 Medical</button>
                    <button class="cr-emergency-btn ok" id="btn-all-clear" style="background:#00C49A22; color:#00C49A; border:1px solid #00C49A44; padding:10px; border-radius:6px;">✅ All Clear</button>
                </div>
            </aside>

            <!-- Center: Heatmap -->
            <main class="cr-center" style="flex:1; border-left:1px solid #222; border-right:1px solid #222; padding:0 15px;">
                <div class="cr-panel-title">Live Venue Heatmap</div>
                <div id="cr-heatmap-container" class="cr-heatmap-wrap" style="height:400px; background:#000; border-radius:12px; overflow:hidden;">
                    ${buildPlaceholderSVG()}
                </div>
                
                <div class="cr-panel-title" style="margin-top:20px;">Zone Density</div>
                <div id="cr-zone-rows" class="cr-zone-list"></div>
            </main>

            <!-- Log & Reports -->
            <aside class="cr-sidebar left-panel" style="flex: 0 0 280px;">
                <div class="cr-panel-title">System Activity Log</div>
                <div id="cr-log-container" class="cr-log-box" style="height:250px; overflow-y:auto; background:#111; padding:10px; font-family:monospace; font-size:0.85rem;"></div>

                <div class="cr-panel-title" style="margin-top:20px;">Staff Reports</div>
                <div id="cr-reports-list" class="cr-reports-list"></div>
            </aside>
        </div>
    </div>`;
}

export function initControl() {
    let simTime = '18:00';

    const refreshAll = () => {
        const densities = getZoneDensity();
        const zoneRowsEl = document.getElementById('cr-zone-rows');
        if (zoneRowsEl) {
            const sorted = [...ZONE_META].sort((a, b) => (densities[b.key] || 0) - (densities[a.key] || 0));
            zoneRowsEl.innerHTML = sorted.map(zm => buildZoneRow(zm, densities[zm.key] || 0)).join('');
        }
    };

    // Firebase / LocalSync Bindings
    onSync('staff_status', (data) => {
        const staffEl = document.getElementById('cr-staff-status-list');
        if (!staffEl) return;
        const entries = Object.keys(data || {}).map(k => ({ zone: k.replace(/_/g, ' '), ...data[k] }));
        if (entries.length === 0) return;
        staffEl.innerHTML = entries.map(e => `
            <div style="padding:10px; background:#1a1a1a; border-radius:6px; margin-bottom:8px; border-left:4px solid ${e.status === 'CROWDED' ? '#ff4d4d' : '#00C49A'}">
                <span style="font-weight:700;">${e.zone}</span>: <span style="color:${e.status === 'CROWDED' ? '#ff4d4d' : '#00C49A'}">${e.status}</span>
            </div>`).join('');
    });

    onSync('reports', (data) => {
        const reportEl = document.getElementById('cr-reports-list');
        if (!reportEl || !data) return;
        const reports = Array.isArray(data) ? data : [data];
        reportEl.innerHTML = reports.slice(-5).reverse().map(r => `
            <div style="padding:10px; background:#1a1a1a; border-radius:6px; margin-bottom:8px; font-size:0.82rem;">
                <div style="color:#888;">${r.zone}</div>
                <div>${r.text || r.notes || 'Issue reported'}</div>
            </div>`).join('');
    });

    const instructInput = document.getElementById('cr-instruct-text');
    document.getElementById('cr-send-instruct-btn')?.addEventListener('click', () => {
        const text = instructInput.value.trim();
        if (!text) return;
        pushSync('instructions', { text });
        instructInput.value = '';
        addLog('Instruction Broadcast: "' + text + '"', 'ok');
    });

    document.getElementById('cr-tick-btn')?.addEventListener('click', () => {
        simTime = simulateTick();
        document.getElementById('cr-sim-time').textContent = simTime;
        addLog('Simulation advanced to ' + simTime, 'ok');
        refreshAll();
    });

    refreshAll();
    addLog('Control room interface active', 'ok');

    // UI Interaction Bindings
    document.getElementById('btn-announce')?.addEventListener('click', () => addLog('PA Announcement triggered', 'caution'));
    document.getElementById('btn-lockdown')?.addEventListener('click', () => addLog('Facility lockdown initiated', 'warn'));
    document.getElementById('btn-medical')?.addEventListener('click', () => addLog('Medical dispatch sent', 'caution'));
    document.getElementById('btn-all-clear')?.addEventListener('click', () => {
        addLog('All Clear signal broadcast', 'ok');
        pushSync('instructions', { text: 'ALL CLEAR: Normal operations resume.' });
    });
}
