import { getZoneDensity, ZONES } from '/src/simulation.js';
import { initVenueMap, syncMarkers } from '/src/mapHelper.js';
import { listenStaff, listenZones } from '/src/firebase.js';
import { renderAIChat, initAIChat } from './aiChat.js';

const STATUS_PILLS_DATA = [
    { label: 'Gate B',          zone: ZONES.GATE_AREA,       emoji: '🚪' },
    { label: 'South Restrooms', zone: ZONES.SOUTH_CONCOURSE, emoji: '🚽' },
    { label: 'N2 Food Court',   zone: ZONES.NORTH_CONCOURSE, emoji: '🍺' },
    { label: 'Parking Zone',    zone: ZONES.PARKING_ZONE,    emoji: '🅿️' },
];

const getDensityMeta = (score) => {
    if (score > 0.82) return { icon: '🔴', label: 'FULL',  color: 'var(--danger-color)' };
    if (score > 0.60) return { icon: '🟡', label: 'BUSY',  color: 'var(--warning-color)' };
    return               { icon: '🟢', label: 'CLEAR', color: 'var(--primary-color)' };
};

/* ─── Nudge Card Templates ────────────────────────────────────── */
function buildNudgeHTML(title, sub, icon, label, badgeColor) {
    return `
    <div class="premium-card glass slide-up-in" id="active-nudge" style="margin-bottom:20px; border-left:4px solid ${badgeColor};">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div style="font-size:0.65rem; font-weight:900; color:${badgeColor}; letter-spacing:1.5px;">LIVE DIRECTIVE</div>
            <button class="dismiss-nudge" style="background:transparent; border:none; color:var(--text-muted); font-size:1.2rem; cursor:pointer;">&times;</button>
        </div>
        <div style="display:flex; gap:15px; align-items:center; margin-bottom:15px;">
            <div style="font-size:2rem;">${icon}</div>
            <div>
                <h3 style="font-size:1.1rem; font-weight:800; color:#fff;">${title}</h3>
                <p style="font-size:0.85rem; color:var(--text-muted);">${sub}</p>
            </div>
        </div>
        <div class="glass" style="padding:12px; border-radius:12px; display:flex; align-items:center; gap:10px; margin-bottom:15px; background:rgba(255,255,255,0.02);">
            <div style="width:8px; height:8px; border-radius:50%; background:${badgeColor};" class="pulse"></div>
            <span style="font-size:0.8rem; font-weight:700; color:${badgeColor};">${label}</span>
        </div>
        <button class="cr-send-all-btn" id="nudge-action-btn" style="height:45px; font-size:0.85rem;">GUIDE ME THERE</button>
    </div>`;
}

/* ─── Render ──────────────────────────────────────────────────── */
export function renderDuring() {
    return `
    <div class="attendee-screen" id="during-screen" style="min-height:100vh; background:var(--background-color); position:relative; overflow:hidden; padding:0;">
        <!-- Ambient Ambient Glows -->
        <div style="position:fixed; top:-50px; left:-50px; width:200px; height:200px; background:var(--primary-glow); filter:blur(100px); opacity:0.1;"></div>

        <!-- Header: Real-time Ticker -->
        <header style="padding:20px; z-index:100; background:rgba(8,12,20,0.8); backdrop-filter:blur(20px); border-bottom:1px solid var(--glass-border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <div class="match-live-badge" style="padding:4px 10px;"><span class="dot pulse"></span> LIVE</div>
                    <span style="font-size:0.75rem; font-weight:800; color:var(--text-muted); letter-spacing:1px;">NMS AHMEDABAD</span>
                </div>
                <button class="icon-btn glass" id="during-plan-btn" style="width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center;">🏠</button>
            </div>
            
            <div style="overflow-x:auto; display:flex; gap:12px; padding-bottom:5px;" class="hide-scrollbar">
                <div id="status-strip" style="display:flex; gap:12px;">
                    <!-- Pills injected here -->
                </div>
            </div>
        </header>

        <main style="padding:20px; padding-bottom:100px; z-index:10; position:relative;">
            
            <!-- Smart Nudge -->
            <div id="nudge-container"></div>

            <!-- Enhanced Map -->
            <div class="premium-card glass" style="padding:0; overflow:hidden; height:280px; position:relative; margin-bottom:20px;">
                <div id="during-map-container" style="width: 100%; height: 100%;"></div>
                <div style="position:absolute; top:12px; right:12px; background:rgba(8,12,20,0.9); padding:5px 12px; border-radius:20px; font-size:0.65rem; color:var(--primary-color); font-weight:800; letter-spacing:1px; z-index:10; border:1px solid var(--primary-glow);">
                    LIVE HEATMAP
                </div>
            </div>

            <!-- Quick Actions -->
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-bottom:25px;">
                <button class="glass" id="btn-food" style="height:80px; border-radius:16px; border:none; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; color:#fff;">
                    <span style="font-size:1.5rem;">🍺</span>
                    <span style="font-size:0.7rem; font-weight:700;">FOOD</span>
                </button>
                <button class="glass" id="btn-restroom" style="height:80px; border-radius:16px; border:none; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; color:#fff;">
                    <span style="font-size:1.5rem;">🚽</span>
                    <span style="font-size:0.7rem; font-weight:700;">TOILET</span>
                </button>
                <button class="glass" id="btn-exit-plan" style="height:80px; border-radius:16px; border:none; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; color:#fff;">
                    <span style="font-size:1.5rem;">🚪</span>
                    <span style="font-size:0.7rem; font-weight:700;">EXIT</span>
                </button>
                <button class="glass" id="btn-help" style="height:80px; border-radius:16px; border:none; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; color:#fff;">
                    <span style="font-size:1.5rem;">🆘</span>
                    <span style="font-size:0.7rem; font-weight:700;">HELP</span>
                </button>
            </div>
        </main>

        <!-- Bottom Nav -->
        <nav class="bottom-nav glass" style="position:fixed; bottom:20px; left:20px; right:20px; height:65px; border-radius:20px; border:1px solid var(--glass-border); padding:0 20px;">
            <a href="/plan" class="nav-item" style="opacity:0.5;">🏠</a>
            <a href="/escort" class="nav-item" style="opacity:0.5;">📍</a>
            <a href="#" class="nav-item" style="color:var(--primary-color); font-weight:900;">LIVE</a>
            <a href="#" class="nav-item" style="opacity:0.5;">👤</a>
        </nav>

        <style>
            .nav-item { flex:1; text-align:center; text-decoration:none; font-size:1.2rem; color:#fff; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        </style>
    </div>` + renderAIChat();
}

/* ─── Init ────────────────────────────────────────────────────── */
export function initDuring() {
    const intake    = JSON.parse(localStorage.getItem('eventflow_intake') || '{}');
    let nudgeShown  = { innings: false, exit: false, density: false };

    // Initialize Map
    const map = initVenueMap('during-map-container', { zoom: 16 });

    const updateStatusStrip = (densities) => {
        const strip = document.getElementById('status-strip');
        if (!strip) return;
        strip.innerHTML = STATUS_PILLS_DATA.map(({ label, zone, emoji }) => {
            const meta = getDensityMeta(densities[zone] || 0.3);
            return `
            <div class="glass" style="padding:8px 12px; border-radius:12px; display:flex; align-items:center; gap:8px; white-space:nowrap; border: 1px solid ${meta.color}33;">
                <span>${emoji}</span>
                <span style="font-size:0.75rem; font-weight:700; color:#fff;">${label}</span>
                <span style="font-family:var(--font-tech); font-size:0.7rem; color:${meta.color};">${meta.label}</span>
            </div>`;
        }).join('');
    };

    const showNudge = (html) => {
        const container = document.getElementById('nudge-container');
        if (!container) return;
        container.innerHTML = html;
        container.querySelector('.dismiss-nudge')?.addEventListener('click', () => container.innerHTML = '');
        container.querySelector('#nudge-action-btn')?.addEventListener('click', () => {
            window.navigate('/escort');
        });
    };

    const tick = () => {
        const densities = getZoneDensity();
        updateStatusStrip(densities);
        syncMarkers(map, densities);
        
        // Example dynamic nudge logic
        if (!nudgeShown.density && Object.values(densities).some(v => v > 0.85)) {
            nudgeShown.density = true;
            showNudge(buildNudgeHTML("High Crowd Alert", "A nearby area is getting busy. Let's find a clearer path.", "⚠️", "CRITICAL", "var(--danger-color)"));
        }
    };

    const unsubs = [];
    unsubs.push(listenZones((data) => {
        if (!data) return;
        const d = getZoneDensity();
        Object.keys(data).forEach(zKey => {
            const name = zKey.replace(/_/g, ' ');
            if (d[name] !== undefined) d[name] = data[zKey].density / 100;
        });
        tick();
    }));

    tick();
    const pollId = setInterval(tick, 10000);

    // Event Bindings
    document.getElementById('during-plan-btn')?.addEventListener('click', () => window.navigate('/plan'));
    document.getElementById('btn-food')?.addEventListener('click', () => showNudge(buildNudgeHTML("Food & Drink", "The N2 Counter has a 2-min queue right now.", "🍺", "CLEAR", "var(--primary-color)")));
    document.getElementById('btn-exit-plan')?.addEventListener('click', () => showNudge(buildNudgeHTML("Match Ending", "Your quickest exit is via Gate 7. Ready?", "🚪", "RECOMMENDED", "var(--primary-color)")));

    initAIChat();

    return () => {
        clearInterval(pollId);
        unsubs.forEach(fn => fn && fn());
    };
}
