export function renderHow() {
    return `
    <style>
        .how-screen { padding-bottom: 40px; }
        .how-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 24px;
            margin: 0 20px 24px 20px;
            backdrop-filter: blur(10px);
            opacity: 0;
            transform: translateY(20px);
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
        
        .how-title {
            font-size: 1.3rem; margin-bottom: 12px; color: #fff; font-weight: 700;
        }
        .how-text {
            color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; margin-bottom: 20px;
        }

        /* Ant Animation */
        .ant-container { position: relative; height: 100px; background: #111; border-radius: 12px; overflow: hidden; margin-top: 10px; }
        .ant-path { stroke: rgba(0, 196, 154, 0.2); stroke-dasharray: 6; animation: dash 2s linear infinite; }
        .ant { animation: crawl 4s linear infinite; offset-path: path('M 10 50 Q 80 10 150 50 T 290 50'); }
        .ant2 { animation: crawl 4s linear infinite -1.5s; offset-path: path('M 10 50 Q 80 10 150 50 T 290 50'); }
        .ant3 { animation: crawl 4s linear infinite -3s; offset-path: path('M 10 50 Q 80 10 150 50 T 290 50'); }
        @keyframes crawl { 0% { offset-distance: 0%; } 100% { offset-distance: 100%; } }
        @keyframes dash { to { stroke-dashoffset: -12; } }

        /* Fish Animation */
        .fish-container { position: relative; height: 100px; background: #111; border-radius: 12px; overflow: hidden; }
        .fish { animation: swim 3s ease-in-out infinite alternate; }
        .fish2 { animation: swim 3.2s ease-in-out infinite alternate -1s; }
        .fish3 { animation: swim 2.8s ease-in-out infinite alternate -2s; }
        @keyframes swim { 
            0% { transform: translate(10px, 0) rotate(-5deg); } 
            100% { transform: translate(30px, -10px) rotate(5deg); }
        }

        /* Honeycomb Animation */
        .honeycomb-container { display: flex; justify-content: center; align-items: center; height: 100px; background: #111; border-radius: 12px; }
        .hex { fill: #222; stroke: #333; stroke-width: 2; transition: fill 0.3s; animation: pulseHex 3s infinite; }
        .hex:nth-child(2) { animation-delay: 0.4s; }
        .hex:nth-child(3) { animation-delay: 0.8s; }
        .hex:nth-child(4) { animation-delay: 1.2s; }
        @keyframes pulseHex { 
            0%, 100% { fill: #222; } 
            50% { fill: rgba(255, 209, 102, 0.4); stroke: #ffd166; }
        }

    </style>
    <div class="attendee-screen how-screen" id="how-screen">
        <header class="attendee-top-bar" style="margin-bottom: 20px;">
            <button class="icon-btn" id="how-back-btn" aria-label="Back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
            </button>
            <div style="flex:1;">
                <h2 style="font-size: 1.2rem; font-weight: 600; text-align: center; margin: 0; transform: translateX(-12px);">How EventFlow Works</h2>
            </div>
        </header>

        <div class="scrollable-content">
            
            <div class="how-card" style="animation-delay: 0.1s;">
                <h3 class="how-title">🐜 Ant Pheromone Logic</h3>
                <p class="how-text">
                    Like ants who follow the strongest trail, EventFlow shows you the clearest path. Busy routes get weaker signals. Clear routes get stronger signals. You always see only the best option.
                </p>
                <div class="ant-container">
                    <svg viewBox="0 0 300 100" width="100%" height="100%">
                        <!-- Path -->
                        <path d="M 10 50 Q 80 10 150 50 T 290 50" fill="none" stroke-width="3" class="ant-path" />
                        <!-- Ants using offset-path in CSS -->
                        <g class="ant">
                            <circle cx="0" cy="0" r="3" fill="#00C49A"/>
                            <ellipse cx="-5" cy="0" rx="4" ry="2" fill="#00C49A"/>
                        </g>
                        <g class="ant2">
                            <circle cx="0" cy="0" r="3" fill="#00C49A"/>
                            <ellipse cx="-5" cy="0" rx="4" ry="2" fill="#00C49A"/>
                        </g>
                        <g class="ant3">
                            <circle cx="0" cy="0" r="3" fill="#00C49A"/>
                            <ellipse cx="-5" cy="0" rx="4" ry="2" fill="#00C49A"/>
                        </g>
                    </svg>
                </div>
            </div>

            <div class="how-card" style="animation-delay: 0.2s;">
                <h3 class="how-title">🐟 Fish School Coordination</h3>
                <p class="how-text">
                    Like fish who move as one group, EventFlow coordinates groups of similar size and destination together &mdash; naturally, without you knowing you're being coordinated.
                </p>
                <div class="fish-container">
                    <svg viewBox="0 0 300 100" width="100%" height="100%">
                        <!-- Fish 1 -->
                        <g transform="translate(140, 50)" class="fish">
                            <ellipse cx="0" cy="0" rx="15" ry="6" fill="#0582ca"/>
                            <polygon points="-12,0 -20,-6 -20,6" fill="#0582ca"/>
                        </g>
                        <!-- Fish 2 -->
                        <g transform="translate(100, 30)" class="fish2">
                            <ellipse cx="0" cy="0" rx="12" ry="5" fill="#0582ca"/>
                            <polygon points="-10,0 -16,-5 -16,5" fill="#0582ca"/>
                        </g>
                        <!-- Fish 3 -->
                        <g transform="translate(110, 70)" class="fish3">
                            <ellipse cx="0" cy="0" rx="14" ry="5" fill="#0582ca"/>
                            <polygon points="-11,0 -18,-5 -18,5" fill="#0582ca"/>
                        </g>
                    </svg>
                </div>
            </div>

            <div class="how-card" style="animation-delay: 0.3s;">
                <h3 class="how-title">🐝 Waggle Dance Pre-Plan</h3>
                <p class="how-text">
                    Like bees who report the best flowers, your pre-match intake lets us prepare your personal route before you even arrive.
                </p>
                <div class="honeycomb-container">
                    <svg viewBox="0 0 150 100" width="100%" height="100%">
                        <!-- Adjusted to create a honeycomb cluster -->
                        <polygon points="60,20 75,12 90,20 90,38 75,46 60,38" class="hex" />
                        <polygon points="45,46 60,38 75,46 75,64 60,72 45,64" class="hex" />
                        <polygon points="75,46 90,38 105,46 105,64 90,72 75,64" class="hex" />
                        <polygon points="60,72 75,64 90,72 90,90 75,98 60,90" class="hex" />
                    </svg>
                </div>
            </div>

        </div>
    </div>
    `;
}

export function initHow() {
    const backBtn = document.getElementById('how-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.history.back();
        });
    }
}
