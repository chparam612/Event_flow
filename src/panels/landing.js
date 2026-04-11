/**
 * EventFlow — Landing Page (Role Selection)
 * Route: /
 */
export function renderLanding() {
    return `
    <div id="landing-root" style="
        min-height: 100vh;
        background: #080C14;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 20px;
        box-sizing: border-box;
        font-family: 'Inter', -apple-system, sans-serif;
    ">
        <!-- Header -->
        <div style="text-align:center; margin-bottom:40px;">
            <div style="
                font-size: 2.4rem;
                font-weight: 900;
                letter-spacing: -1.5px;
                background: linear-gradient(135deg, #00C49A 0%, #00e5b4 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 8px;
            ">EventFlow</div>
            <div style="font-size:0.88rem; color:#3a4560; font-weight:500; letter-spacing:0.5px;">
                Narendra Modi Stadium — Smart Crowd Management
            </div>
            <div style="margin-top:14px; display:flex; align-items:center; justify-content:center; gap:7px;">
                <span style="width:7px;height:7px;border-radius:50%;background:#00C49A;display:inline-block;animation:ef-pulse 2s infinite;"></span>
                <span style="font-size:0.72rem; color:#3a4560;">Live System Active</span>
            </div>
        </div>

        <!-- Role Cards -->
        <div style="width:100%; max-width:400px; display:flex; flex-direction:column; gap:14px;">

            <!-- CARD 1: Fan/Attendee -->
            <div class="ef-card" id="card-attendee" style="
                background: rgba(0,196,154,0.08);
                border: 1px solid rgba(0,196,154,0.4);
                border-radius: 18px;
                padding: 22px 20px;
                cursor: pointer;
                transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
                display: flex;
                align-items: center;
                gap: 16px;
            ">
                <span style="font-size:2.8rem; flex-shrink:0;">🎟️</span>
                <div style="flex:1;">
                    <div style="font-size:1.05rem; font-weight:700; color:#e8f5f1; margin-bottom:3px;" data-i18n="landing.attendee_title">Match Attendee</div>
                    <div style="font-size:0.8rem; color:#4a7a6a;" data-i18n="landing.attendee_sub">Get your personal crowd-free plan</div>
                </div>
                <button id="btn-fan" aria-label="Enter as Fan" style="
                    background: rgba(0,196,154,0.2);
                    border: 1px solid rgba(0,196,154,0.5);
                    color: #00C49A;
                    padding: 9px 16px;
                    border-radius: 10px;
                    font-size: 0.78rem;
                    font-weight: 700;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: background 0.15s;
                " data-i18n="landing.attendee_btn">Enter as Fan</button>
            </div>

            <!-- CARD 2: Ground Staff -->
            <div class="ef-card" id="card-staff" style="
                background: rgba(255,107,53,0.08);
                border: 1px solid rgba(255,107,53,0.4);
                border-radius: 18px;
                padding: 22px 20px;
                cursor: pointer;
                transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
                display: flex;
                align-items: center;
                gap: 16px;
            ">
                <span style="font-size:2.8rem; flex-shrink:0;">🧑‍✈️</span>
                <div style="flex:1;">
                    <div style="font-size:1.05rem; font-weight:700; color:#f5e8e0; margin-bottom:3px;" data-i18n="landing.staff_title">Ground Staff</div>
                    <div style="font-size:0.8rem; color:#7a5a4a;" data-i18n="landing.staff_sub">Zone reporting &amp; live instructions</div>
                </div>
                <button id="btn-staff" aria-label="Staff Login" style="
                    background: rgba(255,107,53,0.2);
                    border: 1px solid rgba(255,107,53,0.5);
                    color: #ff6b35;
                    padding: 9px 16px;
                    border-radius: 10px;
                    font-size: 0.78rem;
                    font-weight: 700;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: background 0.15s;
                " data-i18n="landing.staff_btn">Staff Login</button>
            </div>

            <!-- CARD 3: Control Room -->
            <div class="ef-card" id="card-control" style="
                background: rgba(123,47,255,0.08);
                border: 1px solid rgba(123,47,255,0.4);
                border-radius: 18px;
                padding: 22px 20px;
                cursor: pointer;
                transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
                display: flex;
                align-items: center;
                gap: 16px;
            ">
                <span style="font-size:2.8rem; flex-shrink:0;">🖥️</span>
                <div style="flex:1;">
                    <div style="font-size:1.05rem; font-weight:700; color:#e8e0f5; margin-bottom:3px;" data-i18n="landing.control_title">Control Room</div>
                    <div style="font-size:0.8rem; color:#5a4a7a;" data-i18n="landing.control_sub">Command center — authorized only</div>
                </div>
                <button id="btn-control" aria-label="Control Login" style="
                    background: rgba(123,47,255,0.2);
                    border: 1px solid rgba(123,47,255,0.5);
                    color: #9b6fff;
                    padding: 9px 16px;
                    border-radius: 10px;
                    font-size: 0.78rem;
                    font-weight: 700;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: background 0.15s;
                " data-i18n="landing.control_btn">Control Login</button>
            </div>

        </div>

        <!-- Footer -->
        <div style="margin-top:40px; font-size:0.68rem; color:#1e2535; text-align:center; letter-spacing:0.5px;">
            EventFlow v2.0 — Google Prompt Wars 2026
        </div>

        <style>
            @keyframes ef-pulse {
                0%,100%{opacity:1;transform:scale(1);}
                50%{opacity:0.3;transform:scale(0.7);}
            }
            .ef-card:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.4); }
            .ef-card:active { transform:scale(0.98); }
        </style>
    </div>`;
}

export function initLanding() {
    const navigate = (path) => {
        window.history.pushState(null, null, path);
        window.dispatchEvent(new Event('popstate'));
    };

    // Whole card click
    document.getElementById('card-attendee')?.addEventListener('click', () => navigate('/attendee'));
    document.getElementById('card-staff')?.addEventListener('click', () => navigate('/staff-login'));
    document.getElementById('card-control')?.addEventListener('click', () => navigate('/control-login'));

    // Button-level click (stop propagation not needed — same target)
    document.getElementById('btn-fan')?.addEventListener('click', (e) => { e.stopPropagation(); navigate('/attendee'); });
    document.getElementById('btn-staff')?.addEventListener('click', (e) => { e.stopPropagation(); navigate('/staff-login'); });
    document.getElementById('btn-control')?.addEventListener('click', (e) => { e.stopPropagation(); navigate('/control-login'); });
}
