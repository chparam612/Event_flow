// simulation.js — pure local crowd simulation, no Firebase writes

const TOTAL_ATTENDEES = 500;

export const ZONES = {
    NORTH_STAND: 'North Stand',
    SOUTH_STAND: 'South Stand',
    EAST_STAND: 'East Stand',
    WEST_STAND: 'West Stand',
    NORTH_CONCOURSE: 'North Concourse',
    SOUTH_CONCOURSE: 'South Concourse',
    GATE_AREA: 'Gate Area',
    PARKING_ZONE: 'Parking Zone'
};

// Mapped capacities for 500 sample to achieve realistic density scores (0 to 1)
const ZONE_CAPACITY = {
    [ZONES.NORTH_STAND]: 130,
    [ZONES.SOUTH_STAND]: 130,
    [ZONES.EAST_STAND]: 130,
    [ZONES.WEST_STAND]: 130,
    [ZONES.NORTH_CONCOURSE]: 200,
    [ZONES.SOUTH_CONCOURSE]: 200,
    [ZONES.GATE_AREA]: 250,
    [ZONES.PARKING_ZONE]: 150
};

// State
let attendees = [];
let zonesState = {};
Object.values(ZONES).forEach(z => zonesState[z] = { density: 0, count: 0 });

let simulationTimeMinutes = 16 * 60; // Initialize at 16:00 (4:00 PM)

// Core helper routines
function randomTimeMinutes(startHr, endHr) {
    const mins = Math.floor(Math.random() * ((endHr - startHr) * 60));
    return (startHr * 60) + mins;
}

function generateAttendees() {
    attendees = [];
    for (let i = 0; i < TOTAL_ATTENDEES; i++) {
        
        // 1. Arrival time (30% 5-6pm, 50% 6-7pm, 20% >7pm)
        let arrivalTime;
        const arrRnd = Math.random();
        if (arrRnd < 0.3) arrivalTime = randomTimeMinutes(17, 18);
        else if (arrRnd < 0.8) arrivalTime = randomTimeMinutes(18, 19);
        else arrivalTime = randomTimeMinutes(19, 20.5);

        // 2. Group Size (40% solo/pair, 35% 3-6, 25% 7+)
        let groupSize;
        const grpRnd = Math.random();
        if (grpRnd < 0.4) groupSize = Math.floor(Math.random() * 2) + 1; // 1-2
        else if (grpRnd < 0.75) groupSize = Math.floor(Math.random() * 4) + 3; // 3-6
        else groupSize = Math.floor(Math.random() * 6) + 7; // 7-12

        // 3. Transport Mode (30% car, 40% metro/bus, 30% auto/cab)
        let transportMode;
        const trnRnd = Math.random();
        if (trnRnd < 0.3) transportMode = 'car';
        else if (trnRnd < 0.7) transportMode = 'metro/bus';
        else transportMode = 'auto/cab';

        // 4. Seat Section
        let seatSection;
        const seatRnd = Math.random();
        if (seatRnd < 0.25) seatSection = ZONES.NORTH_STAND;
        else if (seatRnd < 0.5) seatSection = ZONES.SOUTH_STAND;
        else if (seatRnd < 0.75) seatSection = ZONES.EAST_STAND;
        else seatSection = ZONES.WEST_STAND;

        // 5. Departure Intention
        let departureIntention;
        const depRnd = Math.random();
        if (depRnd < 0.2) departureIntention = 'leave early';
        else if (depRnd < 0.7) departureIntention = 'at end';
        else departureIntention = 'stay for presentation';

        attendees.push({
            id: `ATT-${1000 + i}`,
            arrivalTime,
            groupSize,
            transportMode,
            seatSection,
            departureIntention,
            willMoveAtBreak: Math.random() < 0.4, // 40% chance to move at innings break
            currentZone: null
        });
    }
}

// Initial Generation
generateAttendees();

/**
 * Format minutes into HH:MM string, accounts for crossing midnight 24hr -> 00hr
 */
function formatTimeFromMinutes(mins) {
    const hr = Math.floor(mins / 60) % 24;
    const m = Math.floor(mins % 60);
    return `${hr.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * 1. Simulates one 30-second tick
 */
export function simulateTick() {
    simulationTimeMinutes += 0.5; // add 30 seconds
    const time = simulationTimeMinutes;
    
    // Reset Counts
    Object.values(ZONES).forEach(z => zonesState[z].count = 0);

    // Calculate current positions based on timeline constraints
    attendees.forEach(a => {
        let currentZone = null;

        // --- Timeline definitions ---
        // 1080 = 18:00 = 6:00 PM Gates Open
        // 1170 = 19:30 = 7:30 PM Match Starts
        // 1320 = 22:00 = 10:00 PM Innings Break Starts
        // 1365 = 22:45 = 10:45 PM Innings Break Ends (Approx - going into late night)
        // 1500 = 25:00 = 1:00 AM Match Ends

        if (time < 1080) { 
            // Before Gates Open
            if (time >= a.arrivalTime - 30) {
                currentZone = a.transportMode === 'car' ? ZONES.PARKING_ZONE : ZONES.GATE_AREA;
            }
        } else if (time >= 1080 && time < 1170) {
            // Gates Open up to Match Start (Ingress Phase)
            if (time >= a.arrivalTime) {
                // Moving inside to seats
                if (time < a.arrivalTime + 10) currentZone = ZONES.GATE_AREA;
                else if (time < a.arrivalTime + 20) currentZone = (a.seatSection === ZONES.NORTH_STAND || a.seatSection === ZONES.WEST_STAND) ? ZONES.NORTH_CONCOURSE : ZONES.SOUTH_CONCOURSE;
                else currentZone = a.seatSection;
            } else if (time >= a.arrivalTime - 15) {
                // Waiting outside
                currentZone = a.transportMode === 'car' ? ZONES.PARKING_ZONE : ZONES.GATE_AREA;
            }
        } else if (time >= 1170 && time < 1320) {
            // First Innings - mostly seated
            if (time >= a.arrivalTime) currentZone = a.seatSection;
        } else if (time >= 1320 && time < 1365) {
            // Innings Break - 40% move to concourse
            if (a.willMoveAtBreak) {
                currentZone = (a.seatSection === ZONES.NORTH_STAND || a.seatSection === ZONES.EAST_STAND) ? ZONES.NORTH_CONCOURSE : ZONES.SOUTH_CONCOURSE;
            } else {
                currentZone = a.seatSection;
            }
        } else if (time >= 1365 && time < 1500) {
            // Second Innings
            if (a.departureIntention === 'leave early' && time > 1440) {
                // Leaving early, post midnight phase
                if (time < 1450) currentZone = ZONES.GATE_AREA;
                else if (time < 1460 && a.transportMode === 'car') currentZone = ZONES.PARKING_ZONE;
                else currentZone = null;
            } else {
                currentZone = a.seatSection;
            }
        } else if (time >= 1500) {
            // Match Ends - Overwhelming Outgress phase
            const delayOffset = a.departureIntention === 'stay for presentation' ? 45 : 0; // delay departure by 45m
            if (time < 1500 + delayOffset) {
                currentZone = a.seatSection;
            } else if (time < 1500 + delayOffset + 15) {
                currentZone = (a.seatSection === ZONES.NORTH_STAND || a.seatSection === ZONES.WEST_STAND) ? ZONES.NORTH_CONCOURSE : ZONES.SOUTH_CONCOURSE;
            } else if (time < 1500 + delayOffset + 30) {
                currentZone = ZONES.GATE_AREA;
            } else if (time < 1500 + delayOffset + 45 && a.transportMode === 'car') {
                currentZone = ZONES.PARKING_ZONE;
            } else {
                currentZone = null;
            }
        }

        a.currentZone = currentZone;
        if (currentZone) {
            zonesState[currentZone].count += 1;
        }
    });

    // Compute Density Scores
    Object.keys(zonesState).forEach(z => {
        const capacity = ZONE_CAPACITY[z];
        const currentCount = zonesState[z].count;
        // density between 0 and 1, capped at 1.25 for simulating severe overcrowding
        zonesState[z].density = Math.min((currentCount / capacity), 1.25);
    });

    return formatTimeFromMinutes(simulationTimeMinutes);
}

/**
 * 2. Get Zone Density
 * Pure local read — returns current in-memory zone densities.
 * Example return: { "North Stand": 0.85, ... }
 * NOTE: Does NOT write to Firebase. Call syncSimulation() separately
 * from a throttled timer only (e.g. dashboard), never from a render loop.
 */
export function getZoneDensity() {
    let result = {};
    Object.keys(zonesState).forEach(zone => {
        result[zone] = parseFloat(zonesState[zone].density.toFixed(2));
    });
    return result;
}

/**
 * 3. Get Attendee Route Profile
 * Looks up attendee metadata to extrapolate paths.
 */
export function getAttendeeRoute(id) {
    const attendee = attendees.find(a => a.id === id);
    if (!attendee) return null;

    const ingressConcourse = (attendee.seatSection === ZONES.NORTH_STAND || attendee.seatSection === ZONES.WEST_STAND) 
        ? ZONES.NORTH_CONCOURSE 
        : ZONES.SOUTH_CONCOURSE;

    return {
        id: attendee.id,
        transport: attendee.transportMode,
        groupConfig: `${attendee.groupSize} Pax`,
        projectedRoute: [
            attendee.transportMode === 'car' ? ZONES.PARKING_ZONE : null,
            ZONES.GATE_AREA,
            ingressConcourse,
            attendee.seatSection
        ].filter(Boolean),
        currentKnownZone: attendee.currentZone
    };
}

/**
 * 4. Export the recommended Exit Plan for Staff based on simulation logic
 */
export function getExitPlan() {
    return {
        timestamp: formatTimeFromMinutes(simulationTimeMinutes),
        instructions: [
            "1. 1:00 AM (Match Ends): Direct early exiters out of North Gate to relieve pressure on local transit.",
            "2. Ensure West/East Stand exits stagger into Concourse nodes prior to hitting Main Gates.",
            "3. Hold VIP & Presentation Stayers (approx 30%) in sectors for at least 45 minutes until Parking Zone drops below 0.60 density score."
        ],
        alerts: {
            southConcourse: zonesState[ZONES.SOUTH_CONCOURSE].density > 0.8 ? "Bottleneck expected!" : "Clear flow",
            metroStands: "Use auto-rickshaw redirection to spread load among exit gates."
        }
    };
}

// Expose internally generated setup if debugging needed
export function getAttendeesDebug() {
    return attendees;
}
