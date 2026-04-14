import { getZoneDensity, ZONES } from '/src/simulation.js';
import { initVenueMap, syncMarkers } from '/src/mapHelper.js';
import { listenStaff, listenZones } from '/src/firebase.js';
import { renderAIChat, initAIChat } from './aiChat.js';

export function renderPlan() {
    return `
        <div class="attendee-screen" id="plan-screen" style="min-height:100vh; background:var(--background-color); position:relative; overflow:hidden; padding:20px 20px 100px 20px;">
            <!-- Ambient Glow -->
            <div style="position:absolute; top:-50px; left:-50px; width:200px; height:200px; background:var(--primary-glow); filter:blur(100px); opacity:0.15;"></div>

            <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <div class="glow-text" style="font-size:1.4rem; font-weight:800; letter-spacing:-1px;">EventFlow</div>
                <div style="width:40px; height:40px; border-radius:12px; border:1px solid var(--glass-border); overflow:hidden; background:rgba(255,255,255,0.05);">
                    <img src="https://ui-avatars.com/api/?name=Fan&background=00E5B4&color=000&rounded=false" width="40" height="40" alt="Profile">
                </div>
            </header>

            <main>
                <div style="margin-bottom:30px; animation: slideUp 0.6s ease-out;">
                    <h1 style="font-size:2rem; font-weight:900; line-height:1.1; margin-bottom:8px;">Hello, Fan! 👋</h1>
                    <p style="color:var(--text-muted); font-size:1rem; font-weight:500;">Your smart flow for today’s match.</p>
                </div>

                <!-- Card 1: Recommendation -->
                <div class="premium-card glass" style="padding:25px; margin-bottom:25px; border-left:4px solid var(--primary-color);">
                    <div style="font-size:0.65rem; font-weight:900; color:var(--primary-color); letter-spacing:2.5px; margin-bottom:15px;">TOP RECOMMENDATION</div>
                    <h2 style="font-size:1.3rem; font-weight:800; color:#fff; margin-bottom:10px;">Enter via Gate B</h2>
                    <p style="color:var(--text-muted); font-size:0.9rem; line-height:1.5; margin-bottom:20px;">
                        Currently <span style="color:var(--primary-color); font-weight:700;">30% less crowded</span> than Gate A. Fastest entry route.
                    </p>
                    <button class="cr-send-all-btn" id="take-me-there" style="height:50px; font-size:0.9rem;">GUIDE ME TO GATE B</button>
                </div>

                <!-- Card 2: Live Map Preview -->
                <div class="premium-card glass" style="padding:0; overflow:hidden; height:220px; position:relative; margin-bottom:25px;">
                    <div id="plan-map-container" style="width: 100%; height: 100%;"></div>
                    <div style="position:absolute; bottom:12px; left:12px; background:rgba(8,12,20,0.9); padding:5px 12px; border-radius:20px; font-size:0.6rem; color:var(--primary-color); font-weight:800; letter-spacing:1px; z-index:10; border:1px solid var(--primary-glow);">
                        LIVE TRACKER
                    </div>
                </div>

                <!-- Card 3: Timeline -->
                <div class="premium-card glass" style="padding:25px; margin-bottom:25px;">
                    <div style="font-size:0.65rem; font-weight:900; color:var(--text-muted); letter-spacing:2px; margin-bottom:20px;">YOUR TIMELINE</div>
                    
                    <div style="display:flex; flex-direction:column; gap:25px; position:relative;">
                        <div style="position:absolute; left:11px; top:10px; bottom:10px; width:2px; background:var(--glass-border);"></div>
                        
                        <div style="display:flex; gap:20px; position:relative; z-index:2;">
                            <div style="width:24px; height:24px; border-radius:50%; background:var(--primary-color); border:4px solid var(--background-color); display:flex; align-items:center; justify-content:center;">✓</div>
                            <div>
                                <div style="font-size:0.7rem; font-family:var(--font-tech); color:var(--primary-color);">6:15 PM</div>
                                <div style="font-weight:700; color:#fff;">Arrive at Stadium B</div>
                            </div>
                        </div>

                        <div style="display:flex; gap:20px; position:relative; z-index:2;">
                            <div style="width:24px; height:24px; border-radius:50%; background:var(--primary-color); border:4px solid var(--background-color); box-shadow:0 0 10px var(--primary-glow);" class="pulse"></div>
                            <div>
                                <div style="font-size:0.7rem; font-family:var(--font-tech); color:var(--primary-color);">CURRENT</div>
                                <div style="font-weight:700; color:#fff;">Get Midway Food (N2)</div>
                                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Shortest queue right now</div>
                            </div>
                        </div>

                        <div style="display:flex; gap:20px; position:relative; z-index:2; opacity:0.4;">
                            <div style="width:24px; height:24px; border-radius:50%; background:#444; border:4px solid var(--background-color);"></div>
                            <div>
                                <div style="font-size:0.7rem; font-family:var(--font-tech);">10:00 PM</div>
                                <div style="font-weight:700; color:#fff;">Innings Break Plan</div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            <!-- Bottom Nav -->
            <nav class="bottom-nav glass" style="position:fixed; bottom:20px; left:20px; right:20px; height:65px; border-radius:20px; border:1px solid var(--glass-border); padding:0 20px; z-index:1000;">
                <a href="#" class="nav-item" style="color:var(--primary-color); font-weight:900;">🏠</a>
                <a href="/escort" class="nav-item" style="opacity:0.5;">📍</a>
                <a href="/live" class="nav-item" style="opacity:0.5;">📡</a>
                <a href="#" class="nav-item" style="opacity:0.5;">👤</a>
            </nav>

            <style>
                .nav-item { flex:1; text-align:center; text-decoration:none; font-size:1.2rem; color:#fff; }
                @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
            </style>
        </div>` + renderAIChat();
}

export function initPlan() {
    const map = initVenueMap('plan-map-container', { zoom: 15 });
    
    const tick = () => {
        const d = getZoneDensity();
        syncMarkers(map, d);
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
    const pollId = setInterval(tick, 15000);

    document.getElementById('take-me-there')?.addEventListener('click', () => {
        window.navigate('/escort');
    });

    const liveBtn = document.querySelector('[href="/live"]');
    if (liveBtn) {
        liveBtn.onclick = (e) => {
            e.preventDefault();
            window.navigate('/live');
        };
    }

    const escortBtn = document.querySelector('[href="/escort"]');
    if (escortBtn) {
        escortBtn.onclick = (e) => {
            e.preventDefault();
            window.navigate('/escort');
        };
    }

    initAIChat();

    return () => {
        clearInterval(pollId);
        unsubs.forEach(fn => fn && fn());
    };
}
