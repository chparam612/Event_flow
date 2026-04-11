/**
 * EventFlow — Role Selection Landing Page
 * Shown at root URL /
 * Lets users choose their role before entering a panel
 */

export function renderLanding() {
    return `
    <div id="landing-screen" style="
        min-height: 100vh;
        background: #0a0a0a;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px 20px 32px;
        box-sizing: border-box;
        font-family: 'Inter', sans-serif;
    ">
        <!-- Logo & Tagline -->
        <div style="text-align: center; margin-bottom: 48px;">
            <div style="
                font-size: 2.6rem;
                font-weight: 800;
                background: linear-gradient(135deg, #00C49A, #00e5b0);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                letter-spacing: -1px;
                margin-bottom: 10px;
            ">EventFlow</div>
            <div style="
                font-size: 0.95rem;
                color: #555;
                font-weight: 500;
                letter-spacing: 0.3px;
            " data-i18n="landing.tagline">Narendra Modi Stadium — Smart Crowd Guide</div>

            <!-- Pulse dot indicator -->
            <div style="margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span style="
                    width: 8px; height: 8px; border-radius: 50%;
                    background: #00C49A;
                    display: inline-block;
                    animation: pulse 1.8s infinite;
                "></span>
                <span style="font-size: 0.75rem; color: #444;">Live</span>
            </div>
        </div>

        <!-- Role Cards -->
        <div style="width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 16px;">

            <!-- Card 1: Attendee -->
            <button id="role-attendee" aria-label="Match Attendee" style="
                width: 100%;
                background: #111;
                border: 2px solid #00C49A;
                border-radius: 20px;
                padding: 24px 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 20px;
                text-align: left;
                transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease;
                box-shadow: 0 0 0 rgba(0,196,154,0);
            "
            onmouseover="this.style.transform='scale(1.02)'; this.style.background='#0d1f1c'; this.style.boxShadow='0 8px 30px rgba(0,196,154,0.15)';"
            onmouseout="this.style.transform='scale(1)'; this.style.background='#111'; this.style.boxShadow='0 0 0 rgba(0,196,154,0)';">
                <span style="font-size: 2.8rem; line-height: 1;">🎟️</span>
                <div>
                    <div style="font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 4px;" data-i18n="landing.attendee_title">Match Attendee</div>
                    <div style="font-size: 0.85rem; color: #666;" data-i18n="landing.attendee_sub">Get your personal match plan</div>
                </div>
                <span style="margin-left: auto; color: #00C49A; font-size: 1.2rem;">›</span>
            </button>

            <!-- Card 2: Staff -->
            <button id="role-staff" aria-label="Ground Staff" style="
                width: 100%;
                background: #111;
                border: 2px solid #f59e0b;
                border-radius: 20px;
                padding: 24px 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 20px;
                text-align: left;
                transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease;
                box-shadow: 0 0 0 rgba(245,158,11,0);
            "
            onmouseover="this.style.transform='scale(1.02)'; this.style.background='#1a1505'; this.style.boxShadow='0 8px 30px rgba(245,158,11,0.15)';"
            onmouseout="this.style.transform='scale(1)'; this.style.background='#111'; this.style.boxShadow='0 0 0 rgba(245,158,11,0)';">
                <span style="font-size: 2.8rem; line-height: 1;">🧑‍✈️</span>
                <div>
                    <div style="font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 4px;" data-i18n="landing.staff_title">Ground Staff</div>
                    <div style="font-size: 0.85rem; color: #666;" data-i18n="landing.staff_sub">Zone reporting &amp; instructions</div>
                </div>
                <span style="margin-left: auto; color: #f59e0b; font-size: 1.2rem;">›</span>
            </button>

            <!-- Card 3: Control Room -->
            <button id="role-control" aria-label="Control Room" style="
                width: 100%;
                background: #111;
                border: 2px solid #ef4444;
                border-radius: 20px;
                padding: 24px 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 20px;
                text-align: left;
                transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease;
                box-shadow: 0 0 0 rgba(239,68,68,0);
            "
            onmouseover="this.style.transform='scale(1.02)'; this.style.background='#1a0a0a'; this.style.boxShadow='0 8px 30px rgba(239,68,68,0.15)';"
            onmouseout="this.style.transform='scale(1)'; this.style.background='#111'; this.style.boxShadow='0 0 0 rgba(239,68,68,0)';">
                <span style="font-size: 2.8rem; line-height: 1;">🖥️</span>
                <div>
                    <div style="font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 4px;" data-i18n="landing.control_title">Control Room</div>
                    <div style="font-size: 0.85rem; color: #666;" data-i18n="landing.control_sub">Command center access</div>
                </div>
                <span style="margin-left: auto; color: #ef4444; font-size: 1.2rem;">›</span>
            </button>

        </div>

        <!-- Footer -->
        <div style="margin-top: 48px; font-size: 0.72rem; color: #333; text-align: center; letter-spacing: 0.5px;">
            EventFlow v1.0 — Google Prompt Wars 2026
        </div>

        <style>
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.4; transform: scale(0.85); }
            }
            #landing-screen button:active {
                transform: scale(0.97) !important;
            }
        </style>
    </div>
    `;
}

export function initLanding() {
    if (window.applyTranslations) window.applyTranslations();

    const navigate = (path) => {
        window.history.pushState(null, null, path);
        window.dispatchEvent(new Event('popstate'));
    };

    document.getElementById('role-attendee')?.addEventListener('click', () => navigate('/attendee'));
    document.getElementById('role-staff')?.addEventListener('click', () => navigate('/staff'));
    document.getElementById('role-control')?.addEventListener('click', () => navigate('/control'));
}
