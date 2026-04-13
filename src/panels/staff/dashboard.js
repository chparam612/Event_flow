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
let allInstructions = {};  // { id: { zoneId, message, sentAt, acknowledgedBy } }
let latestInstruction = null;
let zoneDensities = {};    // from /zones listener

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
    STAFF_ZONES.forEach(function(z) { opts += '<option value="' + z + '">' + z + '</option>'; });
    return '<div class="staff-login-container">' +
        '<div class="staff-login-card" style="padding:40px; background:#1a1a1a; border-radius:20px; text-align:center;">' +
            '<h1 style="color:#fff; margin-bottom:8px;">Staff Portal</h1>' +
            '<p style="color:#888; margin-bottom:30px;">Ground Stewards — NMS Ahmedabad</p>' +
            '<select id="login-zone" style="width:100%; padding:15px; background:#222; border:1px solid #333; color:#fff; border-radius:10px; margin-bottom:20px;">' + opts + '</select>' +
            '<input type="number" id="login-id" placeholder="Staff ID (numbers only)" style="width:100%; padding:15px; background:#222; border:1px solid #333; color:#fff; border-radius:10px; margin-bottom:30px;">' +
            '<button class="primary-btn" id="login-btn" style="width:100%; height:60px; font-weight:700; border-radius:16px;" aria-label="login btn">Login to Portal</button>' +
        '</div>' +
    '</div>';
}

function renderHome() {
    const status = session.status || 'clear';
    const isClear = status === 'clear';
    const zoneParts = (session.zone || '').split(' ');
    const now = new Date();
    const timeStr = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');

    // Find latest instruction for this staff's zone
    let instrHtml = '<div style="opacity:0.4; font-style:italic;">No active instructions.</div>';
    let instrId = null;
    if (latestInstruction) {
        instrId = latestInstruction.id;
        const acked = latestInstruction.acknowledgedBy && latestInstruction.acknowledgedBy[getStaffId()];
        instrHtml = '<div style="font-size:1.15rem; color:#fff; font-weight:600; line-height:1.4;">' + (latestInstruction.message || latestInstruction.text || '') + '</div>' +
            '<div style="font-size:0.75rem; color:#666; margin-top:8px;">Zone: ' + (latestInstruction.zoneId || '') + '</div>' +
            '<button id="ack-btn" data-iid="' + instrId + '" style="margin-top:20px; width:100%; height:50px; background:' + (acked ? '#00C49A22' : '#222') + '; border:1px solid ' + (acked ? '#00C49A' : '#444') + '; color:' + (acked ? '#00C49A' : '#fff') + '; border-radius:12px; font-weight:700; cursor:pointer;" aria-label="ack btn">' + (acked ? '✓ Acknowledged' : '✓ Samajh Gaya') + '</button>';
    }

    return '<div class="staff-home-container" style="padding:20px;">' +
        '<header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">' +
            '<div>' +
                '<h2 style="margin:0; color:#fff;">Zone ' + zoneParts[0] + '</h2>' +
                '<p style="color:#888; margin:0;">Staff #' + session.staffId + ' | ' + timeStr + '</p>' +
            '</div>' +
            '<button id="logout-btn" style="background:transparent; border:1px solid #444; color:#888; padding:8px 15px; border-radius:8px; cursor:pointer;" aria-label="logout btn">Logout</button>' +
        '</header>' +

        /* Status Toggle */
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:30px;">' +
            '<button id="btn-clear" style="height:160px; border-radius:20px; border:2px solid ' + (isClear ? '#00C49A' : '#333') + '; background:' + (isClear ? '#00C49A18' : '#1a1a1a') + '; color:' + (isClear ? '#00C49A' : '#555') + '; font-weight:700; font-size:0.95rem; cursor:pointer;" aria-label="btn clear">' +
                '<span style="font-size:2.8rem; display:block; margin-bottom:8px;">🟢</span>MY ZONE IS CLEAR</button>' +
            '<button id="btn-crowded" style="height:160px; border-radius:20px; border:2px solid ' + (!isClear ? '#ff4d4d' : '#333') + '; background:' + (!isClear ? '#ff4d4d18' : '#1a1a1a') + '; color:' + (!isClear ? '#ff4d4d' : '#555') + '; font-weight:700; font-size:0.95rem; cursor:pointer;" aria-label="btn crowded">' +
                '<span style="font-size:2.8rem; display:block; margin-bottom:8px;">🔴</span>MY ZONE IS CROWDED</button>' +
        '</div>' +

        /* Instruction Card */
        '<div style="background:#1a1a1a; border-radius:20px; padding:22px; border:1px solid #333; margin-bottom:20px;">' +
            '<div style="font-size:0.72rem; color:#666; font-weight:800; margin-bottom:12px; letter-spacing:1.5px; text-transform:uppercase;">CONTROL ROOM INSTRUCTION</div>' +
            instrHtml +
        '</div>' +

        /* Quick Report */
        '<div style="margin-bottom:20px;">' +
            '<div style="font-size:0.72rem; color:#666; font-weight:800; margin-bottom:10px; letter-spacing:1.5px; text-transform:uppercase;">QUICK REPORT</div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">' +
                '<button class="report-btn" data-type="crowd" style="padding:16px; background:#1a1a1a; border:1px solid #333; border-radius:14px; color:#fff; font-weight:600; cursor:pointer; font-size:0.9rem;" aria-label="Action button">👥 Bheed badh rahi</button>' +
                '<button class="report-btn" data-type="clear" style="padding:16px; background:#1a1a1a; border:1px solid #333; border-radius:14px; color:#fff; font-weight:600; cursor:pointer; font-size:0.9rem;" aria-label="Action button">✅ Area clear</button>' +
                '<button class="report-btn" data-type="medical" style="padding:16px; background:#1a1a1a; border:1px solid #333; border-radius:14px; color:#fff; font-weight:600; cursor:pointer; font-size:0.9rem;" aria-label="Action button">🚑 Medical needed</button>' +
                '<button class="report-btn" data-type="other" style="padding:16px; background:#1a1a1a; border:1px solid #333; border-radius:14px; color:#fff; font-weight:600; cursor:pointer; font-size:0.9rem;" aria-label="Action button">⚠️ Kuch aur...</button>' +
            '</div>' +
        '</div>' +

        /* Zone Density (from Firebase) */
        '<div style="background:#111; border-radius:14px; padding:14px; border:1px solid #222;">' +
            '<div style="font-size:0.72rem; color:#555; font-weight:800; margin-bottom:8px; letter-spacing:1px;">NEARBY ZONE DENSITIES</div>' +
            '<div id="staff-zone-densities" style="font-size:0.82rem; color:#888;">Loading...</div>' +
        '</div>' +
    '</div>';
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

    // ── Firebase Listeners ────────────────────────────────────
    // Listen to /instructions for real-time commands
    listenInstructions((data) => {
        if (!data) { allInstructions = {}; latestInstruction = null; return; }
        allInstructions = data;
        // Find latest instruction (highest sentAt)
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
            const textEl = document.getElementById('latest-instruction-text');
            // Only update if we're on the home view
            if (document.getElementById('btn-clear')) {
                refreshUI();
            }
        }
    });

    // Listen to /zones for density overlay
    listenZones((data) => {
        if (!data) return;
        zoneDensities = data;
        const el = document.getElementById('staff-zone-densities');
        if (el && data) {
            let html = '';
            Object.keys(data).forEach(zoneKey => {
                const z = data[zoneKey];
                const d = z.density || 0;
                const col = d > 80 ? '#ff4d4d' : d > 60 ? '#ffd166' : '#00C49A';
                html += '<div style="display:flex; justify-content:space-between; padding:4px 0;">' +
                    '<span>' + zoneKey.replace(/_/g, ' ') + '</span>' +
                    '<span style="color:' + col + '; font-weight:700;">' + d + '% ' + (z.status || '') + '</span></div>';
            });
            el.innerHTML = html || 'No zone data yet.';
        }
    });

    // ── Event Bindings ────────────────────────────────────────
    // Login
    app.querySelector('#login-btn')?.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const originalText = btn.textContent;
        const zone = app.querySelector('#login-zone')?.value;
        const id = app.querySelector('#login-id')?.value;
        if (!id) return alert('Please enter Staff ID');
        
        // Show spinner
        btn.innerHTML = '<span class="loading-spinner" style="width:20px;height:20px;border-width:2px;margin-right:8px;"></span> Logging in...';
        btn.disabled = true;

        setTimeout(() => {
            saveSession({ zone, staffId: id, status: 'clear' });
            // Write to Firebase: /staff/{staffId}
            writeStaff(id, { zoneId: zone, status: 'clear', online: true });
            refreshUI();
        }, 600); // simulate network delay for UX
    });

    // Logout — robust version
    const staffLogoutBtn = app.querySelector('#logout-btn');
    if (staffLogoutBtn) {
        // Remove old listeners by cloning
        const newBtn = staffLogoutBtn.cloneNode(true);
        staffLogoutBtn.parentNode.replaceChild(newBtn, staffLogoutBtn);

        newBtn.addEventListener('click', async () => {
            newBtn.textContent = 'Logging out...';
            newBtn.disabled = true;
            
            if (session) {
                writeStaff(session.staffId, { zoneId: session.zone, status: 'clear', online: false });
            }

            try {
                const { auth: fireAuth } = await import('/src/firebase.js');
                const { signOut } = await import(
                    'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js'
                );
                if (fireAuth) await signOut(fireAuth);
            } catch(e) {
                console.log('SignOut error (continuing):', e);
            } finally {
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace('/');
            }
        });
        console.log('✅ Staff logout fixed');
    }


    // Status toggles
    app.querySelector('#btn-clear')?.addEventListener('click', () => setStatus('clear'));
    app.querySelector('#btn-crowded')?.addEventListener('click', () => setStatus('crowded'));

    // Acknowledge instruction
    app.querySelector('#ack-btn')?.addEventListener('click', (e) => {
        const iid = e.target.getAttribute('data-iid');
        if (iid && session) {
            acknowledgeInstruction(iid, getStaffId());
            e.target.textContent = '✓ Acknowledged';
            e.target.style.background = '#00C49A22';
            e.target.style.borderColor = '#00C49A';
            e.target.style.color = '#00C49A';
        }
    });

    // Quick reports
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
            btn.style.borderColor = '#00C49A';
            btn.textContent = '✓ Sent';
            setTimeout(() => {
                btn.style.borderColor = '#333';
                const labels = { crowd: '👥 Bheed badh rahi', clear: '✅ Area clear', medical: '🚑 Medical needed', other: '⚠️ Kuch aur...' };
                btn.textContent = labels[type] || type;
            }, 2000);
        });
    });
}

function setStatus(status) {
    if (!session) return;
    session.status = status;
    saveSession(session);
    // Write to Firebase: /staff/{staffId}
    writeStaff(session.staffId, { zoneId: session.zone, status: status, online: true });
    refreshUI();
}

function refreshUI() {
    const appDiv = document.getElementById('app');
    if (appDiv) {
        appDiv.innerHTML = renderStaff();
        initStaff();
    }
}
