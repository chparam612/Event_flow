/**
 * EventFlow — Landing Page (Role Selection) v2
 * Route: /
 * "Enter as Fan" → loginAnonymously() → /attendee
 */
import { loginAsAttendee } from '/src/auth.js';


export function renderLanding() {
    return `
export function renderLanding() {
    return `
    <div id="landing-root" style="
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        position: relative;
    ">
        <!-- Background Ambient Glow -->
        <div style="position:fixed; top:20%; left:10%; width:300px; height:300px; background:var(--primary-glow); filter:blur(100px); opacity:0.1; pointer-events:none;"></div>
        <div style="position:fixed; bottom:20%; right:10%; width:300px; height:300px; background:var(--secondary-color); filter:blur(100px); opacity:0.1; pointer-events:none;"></div>

        <!-- Header Section -->
        <div style="text-align:center; margin-bottom:60px; animation: slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1);">
            <div class="glow-text" style="
                font-size: 3.5rem;
                font-weight: 900;
                letter-spacing: -2px;
                background: linear-gradient(135deg, var(--primary-color) 0%, #fff 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 12px;
            ">EventFlow</div>
            <p style="font-size:1rem; color:var(--text-secondary); font-weight:500; letter-spacing:1px; text-transform:uppercase;">
                NMS Ahmedabad &bull; Smart Crowd Management
            </p>
            <div style="margin-top:20px; display:flex; align-items:center; justify-content:center; gap:10px;">
                <span class="dot pulse" style="background:var(--primary-color);"></span>
                <span style="font-size:0.8rem; color:var(--primary-color); font-weight:700; letter-spacing:1.5px;">SYSTEM LIVE</span>
            </div>
        </div>

        <!-- Role Selection Grid -->
        <div style="width:100%; max-width:440px; display:flex; flex-direction:column; gap:20px; animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;">

            <!-- CARD: Fan -->
            <div class="premium-card glass role-card" id="card-fan" style="padding: 24px; cursor: pointer; display: flex; align-items: center; gap: 20px;">
                <div class="icon-wrap" style="width:64px; height:64px; background:rgba(0,229,180,0.1); border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:2rem;">🎟️</div>
                <div style="flex:1;">
                    <h3 style="font-size:1.2rem; font-weight:800; color:#fff; margin-bottom:4px;" data-i18n="landing.attendee_title">Match Attendee</h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary);" data-i18n="landing.attendee_sub">Personalized crowd-free route</p>
                </div>
                <div style="color:var(--primary-color); font-weight:800; font-size:1.2rem;">&rarr;</div>
            </div>

            <!-- CARD: Staff -->
            <div class="premium-card glass role-card" id="card-staff" style="padding: 24px; cursor: pointer; display: flex; align-items: center; gap: 20px;">
                <div class="icon-wrap" style="width:64px; height:64px; background:rgba(255,107,53,0.1); border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:2rem;">🧑‍✈️</div>
                <div style="flex:1;">
                    <h3 style="font-size:1.2rem; font-weight:800; color:#fff; margin-bottom:4px;" data-i18n="landing.staff_title">Ground Staff</h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary);" data-i18n="landing.staff_sub">Zone reporting & local management</p>
                </div>
                <div style="color:var(--warning-color); font-weight:800; font-size:1.2rem;">&rarr;</div>
            </div>

            <!-- CARD: Control -->
            <div class="premium-card glass role-card" id="card-control" style="padding: 24px; cursor: pointer; display: flex; align-items: center; gap: 20px;">
                <div class="icon-wrap" style="width:64px; height:64px; background:rgba(123,47,255,0.1); border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:2rem;">🖥️</div>
                <div style="flex:1;">
                    <h3 style="font-size:1.2rem; font-weight:800; color:#fff; margin-bottom:4px;" data-i18n="landing.control_title">Control Room</h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary);" data-i18n="landing.control_sub">Command center & analytics</p>
                </div>
                <div style="color:var(--accent-color); font-weight:800; font-size:1.2rem;">&rarr;</div>
            </div>

        </div>

        <!-- Footer -->
        <footer style="margin-top:60px; text-align:center; opacity:0.5; font-size:0.75rem; letter-spacing:2px; font-weight:600;">
            EVENTFLOW &bull; STADIUM V2.0
        </footer>

        <style>
            @keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
            @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
            .role-card:hover .icon-wrap { transform: scale(1.1) rotate(-5deg); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        </style>
    </div>`;
}
`;
}

export function initLanding() {
    // Use global navigate to handle popstate automatically if available
    const navigate = (path) => {
        if (window.navigate) {
            window.navigate(path);
        } else {
            window.history.pushState(null, null, path);
            window.dispatchEvent(new Event('popstate'));
        }
    };

    // ── Fan Button: Anonymous Auth → /attendee ─────────────────
    const fanBtn = document.querySelector(
        '[data-role="attendee"], #btn-fan, .attendee-btn'
    );

    if (fanBtn) {
        fanBtn.addEventListener('click', async () => {
            const originalText = fanBtn.textContent;
            fanBtn.textContent = '⏳ Setting up...';
            fanBtn.disabled = true;
            
            try {
                const { loginAsAttendee } = await import('/src/auth.js');
                await loginAsAttendee();
                console.log('✅ Fan login done, navigating...');
            } catch(e) {
                console.log('Anonymous failed, continuing anyway');
            } finally {
                // Always navigate — even if auth failed
                fanBtn.textContent = originalText;
                fanBtn.disabled = false;
                // Navigate to attendee
                window.history.pushState({}, '', '/attendee');
                window.dispatchEvent(new PopStateEvent('popstate'));
            }
        });
        console.log('✅ Fan button handler attached');
    } else {
        console.error('❌ Fan button not found in landing page');
    }

    // ── Staff Button ────────────────────────────────────────────
    document.getElementById('btn-staff')?.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate('/staff-login');
    });

    // ── Control Button ──────────────────────────────────────────
    document.getElementById('btn-control')?.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate('/control-login');
    });

    // Card click (fallback)
    document.getElementById('btn-fan')?.closest('.ef-card')?.addEventListener('click', () => {
        document.getElementById('btn-fan')?.click();
    });
}
