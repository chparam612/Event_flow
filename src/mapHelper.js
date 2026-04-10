/**
 * mapHelper.js
 * Centralized Google Maps logic with Density markers and Fallback handling.
 */

const NMS_CENTER = { lat: 23.0919, lng: 72.5975 }; // Narendra Modi Stadium

// Marker icons/colors based on density
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

// Global fallback handler for InvalidKeyMapError
window.gm_authFailure = () => {
    console.warn("Google Maps Auth Failure (API Key invalid). Switching to SVG Mock Map.");
    const containers = document.querySelectorAll('[id$="-map-container"]');
    containers.forEach(container => {
        container.innerHTML = `
            <div class="map-fallback-overlay" style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#121212; border:1px solid #333; color:#888; text-align:center; padding:20px;">
                <div style="font-size:3rem; margin-bottom:15px;">🗺️</div>
                <h3 style="color:#fff; margin-bottom:10px;">Safe-Navigation Mode</h3>
                <p style="font-size:0.85rem;">Interactive Google Map is unavailable (API validation).<br/>Switched to simplified venue schematic.</p>
                <div style="margin-top:20px; width:120px; height:80px; border:2px dashed #444; border-radius:40px; position:relative;">
                    <div class="user-pulse" style="position:absolute; top:40%; left:45%; width:10px; height:10px; background:var(--primary-color); border-radius:50%;"></div>
                </div>
            </div>`;
    });
};

/**
 * Initialize a Google Map in target element.
 */
export function initVenueMap(elementId, options = {}) {
    const el = document.getElementById(elementId);
    if (!el) return null;

    try {
        if (typeof google === 'undefined' || !google.maps) {
            console.warn(`Google Maps API not loaded for ${elementId}`);
            return null;
        }

        const map = new google.maps.Map(el, {
            center: NMS_CENTER,
            zoom: options.zoom || 16,
            disableDefaultUI: true,
            styles: [
                { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
                { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
                { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
                { "feature": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
                { "feature": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
                { "feature": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
            ],
            ...options
        });

        return map;
    } catch (e) {
        console.error("Map Init Error", e);
        return null;
    }
}

/**
 * Sync zone, gate, and parking markers to map.
 */
export function syncMarkers(map, densities) {
    if (!map) return;
    
    // This is a simplified marker sync. 
    // In production, we would keep track of marker instances in a WeakMap to update rather than recreate.
    
    const zones = [
        { name: 'North Stand', pos: { lat: 23.0935, lng: 72.5975 }, density: densities.NORTH_STAND || 0.3 },
        { name: 'South Stand', pos: { lat: 23.0903, lng: 72.5975 }, density: densities.SOUTH_STAND || 0.3 },
        { name: 'East Stand',  pos: { lat: 23.0919, lng: 72.5995 }, density: densities.EAST_STAND || 0.3 },
        { name: 'West Stand',  pos: { lat: 23.0919, lng: 72.5955 }, density: densities.WEST_STAND || 0.3 },
        { name: 'Gate B',      pos: { lat: 23.0910, lng: 72.5940 }, density: densities.GATE_AREA || 0.4 },
        { name: 'Parking P2',  pos: { lat: 23.0880, lng: 72.5975 }, density: densities.PARKING_ZONE || 0.2 },
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

        const info = new google.maps.InfoWindow({
            content: `<div style="color:#000; font-weight:700;">${z.name}: ${Math.round(z.density*100)}%</div>`
        });

        marker.addListener('click', () => info.open(map, marker));
    });
}
