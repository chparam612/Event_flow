/**
 * EventFlow — Control Room Login Screen
 * Route: /control-login
 * Uses Firebase Auth: control@eventflow.demo / Control@123
 */
import { loginWithEmail } from '/src/auth.js';

export function renderControlLogin() {
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
                    background:linear-gradient(135deg,#7b2fff,#c770f0);
                    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
                    background-clip:text; margin-bottom:6px;
                ">EventFlow</div>
                <div style="font-size:1.2rem; font-weight:700; color:#e8e0f5; margin-bottom:4px;">Control Room Access</div>
                <div style="font-size:0.8rem; color:#5a4a7a;">Authorized Personnel Only</div>
            </div>

            <!-- Security Badge -->
            <div style="text-align:center; margin-bottom:24px;">
                <div style="display:inline-flex; align-items:center; gap:8px;
                    background:rgba(123,47,255,0.1); border:1px solid rgba(123,47,255,0.3);
                    padding:8px 16px; border-radius:20px;">
                    <span style="font-size:1rem;">🔐</span>
                    <span style="font-size:0.75rem; color:#9b6fff; font-weight:600; letter-spacing:0.5px;">SECURE ACCESS</span>
                </div>
            </div>

            <!-- Form -->
            <div style="background:#111827; border:1px solid #1e293b; border-radius:20px; padding:28px 24px;">

                <div style="margin-bottom:16px;">
                    <label style="display:block; font-size:0.78rem; color:#6b7280; margin-bottom:6px; font-weight:600;">EMAIL</label>
                    <input id="control-email" type="email" placeholder="control@eventflow.demo"
                        aria-label="Control room email"
                        style="width:100%; padding:14px 16px; background:#0d1117; border:1px solid #2d3748;
                        color:#e8f0fe; border-radius:12px; font-size:0.95rem; box-sizing:border-box;
                        outline:none; transition:border-color 0.2s;"
                        onfocus="this.style.borderColor='#7b2fff'"
                        onblur="this.style.borderColor='#2d3748'">
                </div>

                <div style="margin-bottom:24px;">
                    <label style="display:block; font-size:0.78rem; color:#6b7280; margin-bottom:6px; font-weight:600;">PASSWORD</label>
                    <input id="control-password" type="password" placeholder="••••••••"
                        aria-label="Control room password"
                        style="width:100%; padding:14px 16px; background:#0d1117; border:1px solid #2d3748;
                        color:#e8f0fe; border-radius:12px; font-size:0.95rem; box-sizing:border-box;
                        outline:none; transition:border-color 0.2s;"
                        onfocus="this.style.borderColor='#7b2fff'"
                        onblur="this.style.borderColor='#2d3748'">
                </div>

                <!-- Error Message -->
                <div id="control-error" style="display:none; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3);
                    color:#f87171; padding:10px 14px; border-radius:10px; font-size:0.82rem;
                    margin-bottom:16px; text-align:center;"></div>

                <!-- Login Button -->
                <button id="control-login-btn" aria-label="Access Control Room"
                    style="width:100%; padding:16px; background:linear-gradient(135deg,#7b2fff,#c770f0);
                    border:none; border-radius:14px; color:#fff; font-size:1rem;
                    font-weight:700; cursor:pointer; transition:opacity 0.2s; letter-spacing:0.3px;">
                    Access Control Room
                </button>

            </div>

            <!-- Demo Credentials -->
            <div style="margin-top:20px; text-align:center; padding:12px 16px;
                background:rgba(123,47,255,0.05); border:1px solid rgba(123,47,255,0.15);
                border-radius:12px;">
                <div style="font-size:0.72rem; color:#5a4a7a; font-weight:600; margin-bottom:4px; letter-spacing:0.5px;">DEMO CREDENTIALS</div>
                <div style="font-size:0.78rem; color:#7a6a9a; font-family:monospace;">
                    control@eventflow.demo / Control@123
                </div>
            </div>

            <!-- Back -->
            <div style="text-align:center; margin-top:20px;">
                <button id="control-back-btn" aria-label="Back to home"
                    style="background:transparent; border:none; color:#3a4560; font-size:0.82rem;
                    cursor:pointer; text-decoration:underline;">
                    ← Back to Home
                </button>
            </div>

        </div>
    </div>`;
}

export function initControlLogin() {
    const navigate = (path) => {
        window.history.pushState(null, null, path);
        window.dispatchEvent(new Event('popstate'));
    };

    document.getElementById('control-back-btn')?.addEventListener('click', () => navigate('/'));

    const btn = document.getElementById('control-login-btn');
    const errorEl = document.getElementById('control-error');

    btn?.addEventListener('click', async () => {
        const email = document.getElementById('control-email')?.value?.trim();
        const password = document.getElementById('control-password')?.value;

        if (!email || !password) {
            errorEl.textContent = 'Please enter email and password.';
            errorEl.style.display = 'block';
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<span style="opacity:0.7">Authenticating...</span>';
        errorEl.style.display = 'none';

        try {
            await loginWithEmail(email, password);
            localStorage.setItem('eventflow_control_session', JSON.stringify({
                email, loggedInAt: Date.now()
            }));
            navigate('/control');
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
            btn.disabled = false;
            btn.innerHTML = 'Access Control Room';
        }
    });

    document.getElementById('control-password')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('control-login-btn')?.click();
    });
}
