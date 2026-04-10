import { getZoneDensity, ZONES } from '/src/simulation.js';
import { onSync, pushSync } from '/src/firebase.js';

let session = null;
let instructions = [];
let lastInstruction = null;

function loadSession() {
    const saved = localStorage.getItem('eventflow_staff_session');
    if (saved) session = JSON.parse(saved);
}

function saveSession(data) {
    localStorage.setItem('eventflow_staff_session', JSON.stringify(data));
    session = data;
}

export function renderStaff() {
    loadSession();
    if (!session) return renderLogin();
    return renderHome();
}

function renderLogin() {
    return `
    <div class="staff-login-container">
        <div class="staff-login-card" style="padding: 40px; background: #1a1a1a; border-radius: 20px; text-align: center;">
            <h1 style="color: #fff; margin-bottom: 30px;">Staff Portal</h1>
            <select id="login-zone" style="width: 100%; padding: 15px; background: #222; border: 1px solid #333; color: #fff; border-radius: 10px; margin-bottom: 20px;">
                <option value="N3 North">N3 North</option>
                <option value="S1 South">S1 South</option>
                <option value="Gate B">Gate B</option>
            </select>
            <input type="number" id="login-id" placeholder="Staff ID" style="width: 100%; padding: 15px; background: #222; border: 1px solid #333; color: #fff; border-radius: 10px; margin-bottom: 30px;">
            <button class="primary-btn" id="login-btn" style="width: 100%; height: 60px; font-weight: 700;">Login →</button>
        </div>
    </div>`;
}

function renderHome() {
    const status = session.status || 'CLEAR';
    return `
    <div class="staff-home-container" style="padding: 20px;">
        <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
            <div>
                <h2 style="margin:0; color:#fff;">Zone ${session.zone}</h2>
                <p style="color:#888; margin:0;">Staff ID: ${session.staffId}</p>
            </div>
            <button id="logout-btn" style="background:transparent; border:1px solid #444; color:#888; padding:8px 15px; border-radius:8px;">Logout</button>
        </header>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
            <button class="status-btn ${status === 'CLEAR' ? 'active' : ''}" id="btn-clear" style="height: 180px; border-radius: 20px; border: 2px solid ${status === 'CLEAR' ? '#00C49A' : '#333'}; background: ${status === 'CLEAR' ? '#00C49A22' : '#1a1a1a'}; color: ${status === 'CLEAR' ? '#00C49A' : '#666'}; font-weight: 700;">
                <span style="font-size: 3rem;">🟢</span><br/>CLEAR
            </button>
            <button class="status-btn ${status === 'CROWDED' ? 'active' : ''}" id="btn-crowded" style="height: 180px; border-radius: 20px; border: 2px solid ${status === 'CROWDED' ? '#ff4d4d' : '#333'}; background: ${status === 'CROWDED' ? '#ff4d4d22' : '#1a1a1a'}; color: ${status === 'CROWDED' ? '#ff4d4d' : '#666'}; font-weight: 700;">
                <span style="font-size: 3rem;">🔴</span><br/>CROWDED
            </button>
        </div>

        <div class="instruction-card" style="background: #1a1a1a; border-radius: 20px; padding: 25px; border: 1px solid #333;">
            <div style="font-size: 0.8rem; color: #888; font-weight: 700; margin-bottom: 15px; letter-spacing: 1px;">CONTROL ROOM INSTRUCTION</div>
            <div id="latest-instruction-text" style="font-size: 1.2rem; color: #fff; font-weight: 600; line-height: 1.4;">
                ${lastInstruction ? lastInstruction.text : 'Waiting for instructions...'}
            </div>
            <button id="ack-btn" style="margin-top: 25px; width: 100%; height: 50px; background: #222; border: 1px solid #444; color: #fff; border-radius: 12px; font-weight: 700;">✓ Samajh Gaya</button>
        </div>
    </div>`;
}

export function initStaff() {
    const app = document.getElementById('app');
    if (!app) return;

    // Listeners
    onSync('instructions', (data) => {
        if (!data) return;
        lastInstruction = data;
        const textEl = document.getElementById('latest-instruction-text');
        if (textEl) textEl.innerText = data.text;
    });

    // Event Bindings
    app.querySelector('#login-btn')?.addEventListener('click', () => {
        const zone = app.querySelector('#login-zone').value;
        const id = app.querySelector('#login-id').value;
        if (!id) return;
        saveSession({ zone, staffId: id, status: 'CLEAR' });
        refreshUI();
    });

    app.querySelector('#logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('eventflow_staff_session');
        session = null;
        refreshUI();
    });

    app.querySelector('#btn-clear')?.addEventListener('click', () => updateStatus('CLEAR'));
    app.querySelector('#btn-crowded')?.addEventListener('click', () => updateStatus('CROWDED'));

    app.querySelector('#ack-btn')?.addEventListener('click', () => {
        const textEl = document.getElementById('latest-instruction-text');
        if (textEl) textEl.style.opacity = '0.4';
    });
}

function refreshUI() {
    const appDiv = document.getElementById('app');
    if (appDiv) {
        appDiv.innerHTML = renderStaff();
        initStaff();
    }
}

function updateStatus(status) {
    if (!session) return;
    session.status = status;
    saveSession(session);
    pushSync('staff_status', { zone: session.zone, status: status, staffId: session.staffId });
    refreshUI();
}
