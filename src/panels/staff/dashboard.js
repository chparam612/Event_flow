/**
 * Staff Operational Portal — Narendra Modi Stadium
 * Uses Firebase schema: /staff/{staffId}, /instructions, /zones
 */
import { getZoneDensity, ZONES } from '/src/simulation.js';
import {
    writeStaff, listenInstructions, acknowledgeInstruction,
    listenZones, pushData, listen
} from '/src/firebase.js';
import { logout } from '/src/auth.js';

const STAFF_ZONES = [
    'N1 North', 'N2 North', 'N3 North', 'N4 North',
    'S1 South', 'S2 South', 'E1 East', 'E2 East',
    'W1 West', 'W2 West',
    'Gate A', 'Gate B', 'Gate C', 'Gate D', 'Gate E',
    'Gate F', 'Gate G', 'Gate H', 'Gate I',
    'Parking P1', 'Parking P2', 'Parking P3', 'Parking P4'
];

/* ─── State ──────────────────────────────────────────────────── */
let session = null;
let latestInstruction = null;
let zoneDensities = {};    

function loadSession() {
    const saved = localStorage.getItem('eventflow_staff_session');
    if (saved) session = JSON.parse(saved);
}
function saveSession(data) {
    localStorage.setItem('eventflow_staff_session', JSON.stringify(data));
    session = data;
}
function getStaffId() {
    return session ? (session.zone || '').replace(/\s/g, '_') : 'unknown';
}

/* ─── Views ──────────────────────────────────────────────────── */
function renderLogin() {
    let opts = '';
    STAFF_ZONES.forEach(z => { opts += `<option value="${z}">${z}</option>`; });
    
    return `
    <div class="staff-login-container" style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; background:var(--background-color);">
        <div class="premium-card glass" style="width:100%; max-width:400px; padding:40px; text-align:center;">
            <div style="font-size:3rem; margin-bottom:20px;">🧑‍✈️</div>
            <h1 class="glow-text" style="font-size:1.8rem; margin-bottom:8px;">Staff Access</h1>
            <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:30px;">Deploy to NMS Grounds</p>
            
            <div style="text-align:left; margin-bottom:20px;">
                <label style="font-size:0.7rem; font-weight:800; color:var(--primary-color); letter-spacing:1px; margin-bottom:8px; display:block;">ASSIGNED ZONE</label>
                <select id="login-zone" class="cr-nudge-input" style="background:rgba(255,255,255,0.05);">${opts}</select>
            </div>

            <div style="text-align:left; margin-bottom:30px;">
                <label style="font-size:0.7rem; font-weight:800; color:var(--primary-color); letter-spacing:1px; margin-bottom:8px; display:block;">BADGE ID</label>
                <input type="number" id="login-id" class="cr-nudge-input" placeholder="Enter ID" style="background:rgba(255,255,255,0.05);">
            </div>

            <button class="cr-send-all-btn" id="login-btn" style="height:55px; font-size:1rem;">INITIALIZE PORTAL</button>
        </div>
    </div>`;
}

function renderHome() {
    const status = session.status || 'clear';
    const isClear = status === 'clear';
    const zoneParts = (session.zone || '').split(' ');
    
    let instrHtml = `<div style="opacity:0.4; font-style:italic; font-size:0.9rem;">Waiting for Control Room instructions...</div>`;
    if (latestInstruction) {
        const acked = latestInstruction.acknowledgedBy && latestInstruction.acknowledgedBy[getStaffId()];
        instrHtml = `
            <div style="font-size:1.1rem; color:#fff; font-weight:700; line-height:1.4;">${latestInstruction.message || latestInstruction.text || ''}</div>
            <button id="ack-btn" data-iid="${latestInstruction.id}" 
                class="cr-sim-btn" 
                style="margin-top:20px; width:100%; height:50px; background:${acked ? 'var(--primary-dim)' : 'rgba(255,255,255,0.05)'}; 
                border-color:${acked ? 'var(--primary-color)' : 'var(--glass-border)'}; color:${acked ? 'var(--primary-color)' : '#fff'};">
                ${acked ? '✓ ACKNOWLEDGED' : 'ACKNOWLEDGE RECEIPT'}
            </button>`;
    }

    return `
    <div class="staff-home-wrapper" style="padding:20px; background:var(--background-color); min-height:100vh;">
        <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
            <div>
                <h2 style="font-size:1.4rem; color:#fff; font-weight:800;">${session.zone}</h2>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="dot pulse" style="background:${isClear ? 'var(--primary-color)' : 'var(--danger-color)'}"></span>
                    <span style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">PORTAL ACTIVE &bull; ID#${session.staffId}</span>
                </div>
            </div>
            <button id="logout-btn" style="font-size:0.7rem; font-weight:800; color:var(--danger-color); background:transparent; border:none; letter-spacing:1px;">LEAVE POST</button>
        </header>

        <!-- Main Dashboard -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:25px;">
            <div id="btn-clear" class="premium-card glass" style="padding:25px; text-align:center; border:2px solid ${isClear ? 'var(--primary-color)' : 'transparent'};">
                <div style="font-size:2rem; margin-bottom:10px;">🟢</div>
                <div style="font-size:0.8rem; font-weight:800; color:${isClear ? 'var(--primary-color)' : 'var(--text-muted)'}">MY ZONE IS<br>CLEAR</div>
            </div>
            <div id="btn-crowded" class="premium-card glass" style="padding:25px; text-align:center; border:2px solid ${!isClear ? 'var(--danger-color)' : 'transparent'};">
                <div style="font-size:2rem; margin-bottom:10px;">🔴</div>
                <div style="font-size:0.8rem; font-weight:800; color:${!isClear ? 'var(--danger-color)' : 'var(--text-muted)'}">MY ZONE IS<br>CROWDED</div>
            </div>
        </div>

        <!-- Latest Instruction -->
        <div class="premium-card glass" style="padding:25px; margin-bottom:25px; border-left:4px solid var(--primary-color);">
            <div style="font-size:0.65rem; font-weight:900; color:var(--primary-color); letter-spacing:2px; margin-bottom:12px;">COMMAND DIRECTIVE</div>
            ${instrHtml}
        </div>

        <!-- Density Feed -->
        <div class="premium-card" style="background:rgba(0,0,0,0.3); padding:20px; border: 1px solid var(--glass-border);">
            <div style="font-size:0.65rem; font-weight:900; color:var(--text-muted); letter-spacing:1.5px; margin-bottom:15px;">NEARBY SECTORS</div>
            <div id="staff-zone-densities" style="display:flex; flex-direction:column; gap:12px;">
                <div class="cr-no-alerts">Syncing grid data...</div>
            </div>
        </div>

        <!-- Status Reports -->
        <div style="margin-top:30px;">
            <div style="font-size:0.65rem; font-weight:900; color:var(--text-muted); letter-spacing:1.5px; margin-bottom:15px;">RAPID REPORTS</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <button class="report-btn cr-sim-btn" data-type="crowd">👥 Heavy Flow</button>
                <button class="report-btn cr-sim-btn" data-type="clear">✅ Sector Clear</button>
                <button class="report-btn cr-sim-btn" data-type="medical">🚑 Med Needed</button>
                <button class="report-btn cr-sim-btn" data-type="other">⚠️ Other Report</button>
            </div>
        </div>
    </div>`;
}

/* ─── Main Entry Points ──────────────────────────────────────── */
export function renderStaff() {
    loadSession();
    if (!session) return renderLogin();
    return renderHome();
}

export function initStaff() {
    const app = document.getElementById('app');
    if (!app) return;

    const unsubs = [];

    // Instructions
    unsubs.push(listenInstructions((data) => {
        if (!data) { latestInstruction = null; return; }
        let latest = null, latestKey = null;
        Object.keys(data).forEach(key => {
            const inst = data[key];
            if (!latest || (inst.sentAt || 0) > (latest.sentAt || 0)) {
                latest = inst;
                latestKey = key;
            }
        });
        if (latest) {
            latestInstruction = { ...latest, id: latestKey };
            // If home view is active, update just the instruction box if it's there
            // Usually we'll just navigate to self to refresh the whole template
            if (session) window.navigate('/staff');
        }
    }));

    // Densities
    unsubs.push(listenZones((data) => {
        if (!data) return;
        zoneDensities = data;
        const el = document.getElementById('staff-zone-densities');
        if (!el) return;

        Object.keys(data).forEach(zoneKey => {
            const z = data[zoneKey];
            const d = z.density || 0;
            const col = d > 82 ? 'var(--danger-color)' : (d > 60 ? 'var(--warning-color)' : 'var(--primary-color)');
            
            // Try to find existing row
            let row = el.querySelector(`[data-zone-key="${zoneKey}"]`);
            if (!row) {
                // Create if not exists
                row = document.createElement('div');
                row.setAttribute('data-zone-key', zoneKey);
                row.style.display = 'flex';
                row.style.justifyContent = 'space-between';
                row.style.alignItems = 'center';
                row.innerHTML = `<span class="z-name" style="font-size:0.85rem; color:#eee;"></span> <span class="z-val" style="font-family:var(--font-tech); font-weight:700;"></span>`;
                el.appendChild(row);
            }

            // Update content
            const nameEl = row.querySelector('.z-name');
            const valEl = row.querySelector('.z-val');
            if (nameEl) nameEl.textContent = zoneKey.replace(/_/g, ' ');
            if (valEl) {
                valEl.textContent = `${d}%`;
                valEl.style.color = col;
            }
        });

        // Cleanup any rows that are no longer in data
        Array.from(el.children).forEach(child => {
            const key = child.getAttribute('data-zone-key');
            if (key && !data[key]) child.remove();
        });
    }));

    // Login Event
    app.querySelector('#login-btn')?.addEventListener('click', () => {
        const zone = app.querySelector('#login-zone')?.value;
        const id = app.querySelector('#login-id')?.value;
        if (!id) return alert('Please enter Staff ID');
        
        saveSession({ zone, staffId: id, status: 'clear' });
        writeStaff(id, { zoneId: zone, status: 'clear', online: true });
        window.navigate('/staff');
    });

    // Logout
    function attachStaffLogout() {
        const btn = document.querySelector(
            '#staff-logout-btn, .logout-btn, ' +
            'button[aria-label*="logout"], ' +
            'button[aria-label*="Logout"]'
        ) || Array.from(document.querySelectorAll('button'))
             .find(b => b.textContent.includes('Logout') || 
                        b.textContent.includes('logout'));
        
        if (!btn) {
            setTimeout(attachStaffLogout, 200);
            return;
        }
        console.log('✅ Staff logout btn found');
        btn.addEventListener('click', async () => {
            btn.textContent = 'Logging out...';
            btn.disabled = true;
            const { logout } = await import('/src/auth.js');
            await logout();
        });
    }
    setTimeout(attachStaffLogout, 300);

    // Status Toggles
    app.querySelector('#btn-clear')?.addEventListener('click', () => setStatus('clear'));
    app.querySelector('#btn-crowded')?.addEventListener('click', () => setStatus('crowded'));

    // Ack
    app.querySelector('#ack-btn')?.addEventListener('click', (e) => {
        const iid = e.target.getAttribute('data-iid');
        if (iid && session) {
            acknowledgeInstruction(iid, getStaffId());
            e.target.textContent = '✓ ACKNOWLEDGED';
            e.target.style.color = 'var(--primary-color)';
            e.target.style.background = 'var(--primary-dim)';
        }
    });

    // Reports
    app.querySelectorAll('.report-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            pushData('reports', {
                staffId: session?.staffId,
                zone: session?.zone,
                type: type,
                message: btn.textContent.trim(),
                timestamp: Date.now()
            });
            btn.textContent = '✓ SENT';
            setTimeout(() => {
                const labels = { crowd: '👥 Heavy Flow', clear: '✅ Sector Clear', medical: '🚑 Med Needed', other: '⚠️ Other Report' };
                btn.textContent = labels[type] || type;
            }, 2000);
        });
    });

    return () => {
        unsubs.forEach(fn => fn && fn());
    };
}

function setStatus(status) {
    if (!session) return;
    session.status = status;
    saveSession(session);
    writeStaff(session.staffId, { zoneId: session.zone, status: status, online: true });
    window.navigate('/staff');
}
