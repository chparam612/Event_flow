/**
 * mapHelper.js
 * Centralized Google Maps logic with Density markers and High-Fidelity SVG Fallback.
 */

const NMS_CENTER = { lat: 23.0919, lng: 72.5975 }; // Narendra Modi Stadium

const DENSITY_COLORS = {
    GREEN:  '#00C49A',
    YELLOW: '#ffd166',
    RED:    '#ff4d4d'
};

const getDensityColor = (score) => {
    if (score > 0.85) return DENSITY_COLORS.RED;
    if (score > 0.6)  return DENSITY_COLORS.YELLOW;
    return               DENSITY_COLORS.GREEN;
};

/**
 * MockMap Class 
 * Mimics a Google Map object to provide a unified API when Google Maps fails.
 */
class MockMap {
    constructor(containerId, densities = {}) {
        this.containerId = containerId;
        this.isMock = true;
        this.render(densities);
    }

    render(densities) {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const zones = [
            { id: 'N',  name: 'North Stand', x: 50,  y: 20, d: densities['North Stand'] || 0.3 },
            { id: 'S',  name: 'South Stand', x: 50,  y: 80, d: densities['South Stand'] || 0.3 },
            { id: 'E',  name: 'East Stand',  x: 80,  y: 50, d: densities['East Stand'] || 0.3 },
            { id: 'W',  name: 'West Stand',  x: 20,  y: 50, d: densities['West Stand'] || 0.3 },
            { id: 'GB', name: 'Gate Area',   x: 35,  y: 35, d: densities['Gate Area'] || 0.4 },
            { id: 'P2', name: 'Parking Zone', x: 50, y: 92, d: densities['Parking Zone'] || 0.2 },
        ];

        container.innerHTML = `
            <div class="svg-map-wrapper" style="width:100%; height:100%; background:#1a1a1a; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden; border-radius:12px;">
                <div style="position:absolute; top:12px; left:12px; font-size:0.7rem; color:#555; font-weight:700; text-transform:uppercase; letter-spacing:1px; z-index:10;">
                    <span class="dot pulse" style="background:#ffd166; width:6px; height:6px;"></span> Safe-Navigation Mode
                </div>
                
                <svg viewBox="0 0 100 100" style="width:90%; height:90%; filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));">
                    <!-- Stadium Outer Boundary -->
                    <ellipse cx="50" cy="50" rx="45" ry="38" fill="none" stroke="#2a2a2a" stroke-width="0.5" />
                    <ellipse cx="50" cy="50" rx="40" ry="32" fill="#222" stroke="#444" stroke-width="1" />
                    
                    <!-- Pitch -->
                    <ellipse cx="50" cy="50" rx="15" ry="10" fill="#2a4a2a" stroke="#ffffff11" stroke-width="0.5" />
                    
                    <!-- Markers (Pin Style) -->
                    ${zones.map(z => {
                        const color = getDensityColor(z.d);
                        return `
                        <g class="svg-marker" data-name="${z.name}" data-density="${Math.round(z.d * 100)}%">
                            <!-- Pin Shape -->
                            <path d="M${z.x},${z.y} L${z.x-3},${z.y-8} A3.5,3.5 0 1,1 ${z.x+3},${z.y-8} Z" fill="${color}" stroke="#fff" stroke-width="0.5" />
                            <circle cx="${z.x}" cy="${z.y-8.5}" r="1.5" fill="#fff" />
                            <!-- Label -->
                            <text x="${z.x}" y="${z.y + 4}" text-anchor="middle" font-size="2.5" fill="#555" font-family="Inter, sans-serif" font-weight="700">${z.id}</text>
                            
                            <!-- Pulse Effect -->
                            <circle cx="${z.x}" cy="${z.y}" r="2" fill="${color}" class="marker-pulse" />
                        </g>
                        `;
                    }).join('')}
                </svg>

                <div id="${this.containerId}-tooltip" style="position:absolute; bottom:15px; background:rgba(0,0,0,0.85); color:#fff; padding:6px 12px; border-radius:30px; font-size:0.75rem; border:1px solid #333; pointer-events:none; transition: opacity 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                    Tap any marker for density info
                </div>
            </div>
            
            <style>
                @keyframes markerPulse {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(3.5); opacity: 0; }
                }
                .marker-pulse {
                    transform-origin: center;
                    animation: markerPulse 2.5s infinite;
                }
                .svg-marker { cursor: pointer; transition: transform 0.2s; transform-origin: center bottom; }
                .svg-marker:hover { transform: scale(1.1); }
            </style>
        `;

        // Add Interactivity
        const svgMarkers = container.querySelectorAll('.svg-marker');
        const tooltip = document.getElementById(`${this.containerId}-tooltip`);
        svgMarkers.forEach(m => {
            m.addEventListener('click', () => {
                const name = m.getAttribute('data-name');
                const dens = m.getAttribute('data-density');
                if (tooltip) {
                    tooltip.innerText = `${name}: ${dens} Capacity`;
                    tooltip.style.borderColor = getDensityColor(parseInt(dens)/100);
                }
            });
        });
    }

    sync(densities) {
        this.render(densities);
    }
}

// Global fallback handler (called by Google Maps on Auth Failure)
window.gm_authFailure = () => {
    console.warn("Google Maps Auth Failure (API Key issue). Switching all maps to Safe-Navigation Mode.");
    const containers = document.querySelectorAll('[id$="-map-container"]');
    containers.forEach(container => {
        // Force replace with MockMap by looking for the ID
        const densities = typeof getZoneDensity === 'function' ? getZoneDensity() : {};
        new MockMap(container.id, densities);
    });
};

/**
 * Initialize a Map in target element. Returns Google Map or MockMap.
 */
export function initVenueMap(elementId, options = {}) {
    const el = document.getElementById(elementId);
    if (!el) return null;

    // Check if we should skip GMap entirely due to placeholder key
    const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    const placeholderFound = Array.from(scripts).some(s => s.src.includes('YOUR_API_KEY_HERE') || s.src.includes('{{GOOGLE_MAPS_API_KEY}}'));

    if (!placeholderFound && typeof google !== 'undefined' && google.maps) {
        try {
            const map = new google.maps.Map(el, {
                center: NMS_CENTER,
                zoom: options.zoom || 16,
                disableDefaultUI: true,
                styles: [
                    { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
                    { "feature": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
                    { "feature": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
                ],
                ...options
            });
            return map;
        } catch (e) {
            console.error("GMap init failed", e);
        }
    }
    
    // Fallback to MockMap if GMap fails or placeholder key detected
    const densities = typeof getZoneDensity === 'function' ? getZoneDensity() : {};
    return new MockMap(elementId, densities);
}

/**
 * Sync markers for either GMap or MockMap.
 */
export function syncMarkers(map, densities) {
    if (!map) return;
    
    if (map.isMock) {
        map.sync(densities);
        return;
    }

    // Google Maps Marker Sync (if map exists)
    if (typeof google === 'undefined') return;

    const zones = [
        { name: 'North Stand', pos: { lat: 23.0935, lng: 72.5975 }, density: densities['North Stand'] || 0.3 },
        { name: 'South Stand', pos: { lat: 23.0903, lng: 72.5975 }, density: densities['South Stand'] || 0.3 },
        { name: 'East Stand',  pos: { lat: 23.0919, lng: 72.5995 }, density: densities['East Stand'] || 0.3 },
        { name: 'West Stand',  pos: { lat: 23.0919, lng: 72.5955 }, density: densities['West Stand'] || 0.3 },
        { name: 'Gate Area',   pos: { lat: 23.0910, lng: 72.5940 }, density: densities['Gate Area'] || 0.4 },
        { name: 'Parking Zone', pos: { lat: 23.0880, lng: 72.5975 }, density: densities['Parking Zone'] || 0.2 },
    ];

    zones.forEach(z => {
        const color = getDensityColor(z.density);
        const marker = new google.maps.Marker({
            position: z.pos,
            map: map,
            title: z.name,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: color,
                fillOpacity: 0.9,
                strokeWeight: 2,
                strokeColor: '#fff',
                scale: 10
            }
        });
        const info = new google.maps.InfoWindow({ content: `<div style="color:#000;">${z.name}: ${Math.round(z.density*100)}%</div>` });
        marker.addListener('click', () => info.open(map, marker));
    });
}
