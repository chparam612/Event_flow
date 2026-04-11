/**
 * EventFlow — Staff Login Screen
 * Route: /staff-login
 * Uses Firebase Auth: staff@eventflow.demo / Staff@123
 */
import { loginWithEmail } from '/src/auth.js';

const STAFF_ZONES = [
    'N1 North', 'N2 North', 'N3 North', 'N4 North',
    'S1 South', 'S2 South', 'E1 East', 'E2 East',
    'W1 West', 'W2 West',
    'Gate A', 'Gate B', 'Gate C', 'Gate D', 'Gate E',
    'Gate F', 'Gate G', 'Gate H', 'Gate I',
    'Parking P1', 'Parking P2', 'Parking P3', 'Parking P4'
];

export function renderStaffLogin() {
    const zoneOptions = STAFF_ZONES.map(z =>
        `<option value="${z}">${z}</option>`).join('');

    return `
    <div style="
        min-height:100vh; background:#080C14;
        display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        padding:32px 20px; box-sizing:border-box;
        font-family:'Inter',-apple-system,sans-serif;
    ">
        <div style="width:100%; max-width:380px;">

            <!-- Logo -->
            <div style="text-align:center; margin-bottom:32px;">
                <div style="
                    font-size:1.8rem; font-weight:900; letter-spacing:-1px;
                    background:linear-gradient(135deg,#ff6b35,#ff9500);
                    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
                    background-clip:text; margin-bottom:6px;
                ">EventFlow</div>
                <div style="font-size:1.2rem; font-weight:700; color:#f0e8e0; margin-bottom:4px;">Staff Login</div>
                <div style="font-size:0.8rem; color:#5a4a40;">Ground Steward Access — NMS Ahmedabad</div>
            </div>

            <!-- Form -->
            <div style="background:#111827; border:1px solid #1e293b; border-radius:20px; padding:28px 24px;">

                <div style="margin-bottom:16px;">
                    <label style="display:block; font-size:0.78rem; color:#6b7280; margin-bottom:6px; font-weight:600;">EMAIL</label>
                    <input id="staff-email" type="email" placeholder="staff@eventflow.demo"
                        aria-label="Staff email address"
                        style="width:100%; padding:14px 16px; background:#0d1117; border:1px solid #2d3748;
                        color:#e8f0fe; border-radius:12px; font-size:0.95rem; box-sizing:border-box;
                        outline:none; transition:border-color 0.2s;"
                        onfocus="this.style.borderColor='#ff6b35'"
                        onblur="this.style.borderColor='#2d3748'">
                </div>

                <div style="margin-bottom:16px;">
                    <label style="display:block; font-size:0.78rem; color:#6b7280; margin-bottom:6px; font-weight:600;">PASSWORD</label>
                    <input id="staff-password" type="password" placeholder="••••••••"
                        aria-label="Staff password"
                        style="width:100%; padding:14px 16px; background:#0d1117; border:1px solid #2d3748;
                        color:#e8f0fe; border-radius:12px; font-size:0.95rem; box-sizing:border-box;
                        outline:none; transition:border-color 0.2s;"
                        onfocus="this.style.borderColor='#ff6b35'"
                        onblur="this.style.borderColor='#2d3748'">
                </div>

                <div style="margin-bottom:24px;">
                    <label style="display:block; font-size:0.78rem; color:#6b7280; margin-bottom:6px; font-weight:600;">YOUR ZONE</label>
                    <select id="staff-zone" aria-label="Select your zone"
                        style="width:100%; padding:14px 16px; background:#0d1117; border:1px solid #2d3748;
                        color:#e8f0fe; border-radius:12px; font-size:0.9rem; box-sizing:border-box;
                        outline:none; appearance:none; cursor:pointer;">
                        ${zoneOptions}
                    </select>
                </div>

                <!-- Error Message -->
                <div id="staff-error" style="display:none; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3);
                    color:#f87171; padding:10px 14px; border-radius:10px; font-size:0.82rem;
                    margin-bottom:16px; text-align:center;"></div>

                <!-- Login Button -->
                <button id="staff-login-btn" aria-label="Login to Staff Portal"
                    style="width:100%; padding:16px; background:linear-gradient(135deg,#ff6b35,#ff9500);
                    border:none; border-radius:14px; color:#fff; font-size:1rem;
                    font-weight:700; cursor:pointer; transition:opacity 0.2s; letter-spacing:0.3px;">
                    Login to Staff Portal
                </button>

            </div>

            <!-- Demo Credentials -->
            <div style="margin-top:20px; text-align:center; padding:12px 16px;
                background:rgba(255,107,53,0.05); border:1px solid rgba(255,107,53,0.15);
                border-radius:12px;">
                <div style="font-size:0.72rem; color:#7a5a4a; font-weight:600; margin-bottom:4px; letter-spacing:0.5px;">DEMO CREDENTIALS</div>
                <div style="font-size:0.78rem; color:#a07060; font-family:monospace;">
                    staff@eventflow.demo / Staff@123
                </div>
            </div>

            <!-- Back -->
            <div style="text-align:center; margin-top:20px;">
                <button id="staff-back-btn" aria-label="Back to home"
                    style="background:transparent; border:none; color:#3a4560; font-size:0.82rem;
                    cursor:pointer; text-decoration:underline;">
                    ← Back to Home
                </button>
            </div>

        </div>
    </div>`;
}

export function initStaffLogin() {
    const navigate = (path) => {
        window.history.pushState(null, null, path);
        window.dispatchEvent(new Event('popstate'));
    };

    document.getElementById('staff-back-btn')?.addEventListener('click', () => navigate('/'));

    const btn = document.getElementById('staff-login-btn');
    const errorEl = document.getElementById('staff-error');

    btn?.addEventListener('click', async () => {
        const email = document.getElementById('staff-email')?.value?.trim();
        const password = document.getElementById('staff-password')?.value;
        const zone = document.getElementById('staff-zone')?.value;

        if (!email || !password) {
            errorEl.textContent = 'Please enter email and password.';
            errorEl.style.display = 'block';
            return;
        }

        // Loading state
        btn.disabled = true;
        btn.innerHTML = '<span style="opacity:0.7">Logging in...</span>';
        errorEl.style.display = 'none';

        try {
            await loginWithEmail(email, password);
            // Save zone selection
            localStorage.setItem('eventflow_staff_session', JSON.stringify({
                zone, staffId: email.split('@')[0], status: 'clear'
            }));
            navigate('/staff');
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
            btn.disabled = false;
            btn.innerHTML = 'Login to Staff Portal';
        }
    });

    // Allow Enter key to submit
    document.getElementById('staff-password')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('staff-login-btn')?.click();
    });
}
