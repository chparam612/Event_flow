/**
 * EventFlow — Control Room Login Screen
 * Redesigned for Premium Command Center aesthetic
 */
import { loginWithEmail } from '/src/auth.js';

export function renderControlLogin() {
    return `
    <div style="min-height:100vh; background:var(--background-color); display:flex; align-items:center; justify-content:center; padding:20px; position:relative; overflow:hidden;">
        <!-- Ambient Glow -->
        <div style="position:absolute; top:-100px; left:-100px; width:400px; height:400px; background:var(--primary-glow); filter:blur(150px); opacity:0.15; pointer-events:none;"></div>
        
        <div style="width:100%; max-width:420px; position:relative; z-index:10; animation:pageIn 0.6s ease-out;">
            <!-- Tech Badge -->
            <div style="text-align:center; margin-bottom:30px;">
                <div style="display:inline-flex; align-items:center; gap:10px; background:var(--primary-dim); border:1px solid var(--primary-glow); padding:8px 20px; border-radius:30px; margin-bottom:20px;">
                    <span class="dot pulse" style="background:var(--primary-color);"></span>
                    <span style="font-size:0.65rem; font-weight:900; color:var(--primary-color); letter-spacing:2px; text-transform:uppercase;">Encryption Active</span>
                </div>
                <h1 class="glow-text" style="font-size:2.5rem; font-weight:900; letter-spacing:-1.5px; color:#fff; line-height:1;">EventFlow</h1>
                <p style="color:var(--text-muted); font-size:0.9rem; margin-top:8px; font-weight:500;">Command Center Gateway</p>
            </div>

            <div class="premium-card glass" style="padding:40px;">
                <div style="margin-bottom:25px;">
                    <label style="display:block; font-size:0.65rem; font-weight:900; color:var(--primary-color); letter-spacing:1px; margin-bottom:10px;">ID CREDENTIALS</label>
                    <input id="control-email" type="email" placeholder="control@eventflow.demo"
                        style="width:100%; padding:15px; background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); color:#fff; border-radius:12px; font-size:1rem; outline:none; transition:all 0.3s;"
                        onfocus="this.style.borderColor='var(--primary-color)'; this.style.backgroundColor='rgba(0,229,180,0.05)'"
                        onblur="this.style.borderColor='var(--glass-border)'; this.style.backgroundColor='rgba(255,255,255,0.03)'">
                </div>

                <div style="margin-bottom:30px;">
                    <label style="display:block; font-size:0.65rem; font-weight:900; color:var(--primary-color); letter-spacing:1px; margin-bottom:10px;">AUTH SECRET</label>
                    <input id="control-password" type="password" placeholder="••••••••"
                        style="width:100%; padding:15px; background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); color:#fff; border-radius:12px; font-size:1rem; outline:none; transition:all 0.3s;"
                        onfocus="this.style.borderColor='var(--primary-color)'; this.style.backgroundColor='rgba(0,229,180,0.05)'"
                        onblur="this.style.borderColor='var(--glass-border)'; this.style.backgroundColor='rgba(255,255,255,0.03)'">
                </div>

                <div id="control-error" style="display:none; color:var(--danger-color); font-size:0.8rem; text-align:center; margin-bottom:20px; font-weight:600;"></div>

                <button id="control-login-btn" class="cr-send-all-btn" style="height:55px; font-size:1rem;">INITIALIZE SESSION</button>
            </div>

            <!-- Demo Hint -->
            <div style="text-align:center; margin-top:30px;">
                <div style="font-size:0.7rem; color:var(--text-muted); letter-spacing:1px; font-weight:700; margin-bottom:8px;">TESTING ENVIRONMENT</div>
                <div style="font-family:var(--font-tech); font-size:0.75rem; color:var(--primary-color); opacity:0.6;">control@eventflow.demo / Control@123</div>
            </div>

            <div style="text-align:center; margin-top:20px;">
                <button id="control-back-btn" style="background:transparent; border:none; color:var(--text-muted); font-size:0.8rem; cursor:pointer; text-decoration:underline;">Return to Landing</button>
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
            errorEl.textContent = 'Please enter credentials.';
            errorEl.style.display = 'block';
            return;
        }

        btn.disabled = true;
        btn.textContent = 'AUTHENTICATING...';
        errorEl.style.display = 'none';

        try {
            await loginWithEmail(email, password);
            navigate('/control');
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'INITIALIZE SESSION';
        }
    });

    document.getElementById('control-password')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('control-login-btn')?.click();
    });
}
