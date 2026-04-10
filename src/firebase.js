/**
 * Firebase Unified Sync Layer
 * Dual-mode: Firebase Realtime Database + LocalStorage cross-tab fallback
 * 
 * Database Schema:
 *   /zones/{zoneId}         — { density, status, updatedAt }
 *   /staff/{staffId}        — { zoneId, status, lastReport, online }
 *   /instructions/{id}      — { zoneId, message, sentAt, acknowledgedBy }
 *   /nudges/{id}            — { targetZone, message, sentAt }
 *   /feedback/{timestamp}   — { rating, issues, helpfulness }
 *   /attendees/{sessionId}  — { intakeData, currentZone }
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getDatabase, ref, set, push, get, update, remove,
    onValue, off, serverTimestamp, child
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

/* ─── Config ─────────────────────────────────────────────────── */
const firebaseConfig = {
    apiKey: "AIzaSy-MOCK-API-KEY-123456789",
    authDomain: "eventflow-nms.firebaseapp.com",
    databaseURL: "https://eventflow-nms-default-rtdb.firebaseio.com",
    projectId: "eventflow-nms",
    storageBucket: "eventflow-nms.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef1234567890"
};

let app, db, auth;
try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    auth = getAuth(app);
} catch (error) {
    console.warn("Firebase init failed — LocalSync fallback active.", error.message);
}

/* ═══════════════════════════════════════════════════════════════
   CORE SYNC API  —  Dual-mode: Firebase + LocalStorage
   ═══════════════════════════════════════════════════════════════ */

/**
 * Listen to a database path. Fires callback on every change (real-time).
 * Falls back to LocalStorage cross-tab events when Firebase is down.
 */
export function listen(path, callback) {
    const lsKey = 'ef_' + path.replace(/\//g, '_');

    // 1. Firebase listener
    if (db) {
        try {
            onValue(ref(db, path), (snap) => {
                const val = snap.val();
                callback(val);
                // Mirror to LocalStorage for cross-tab
                try { localStorage.setItem(lsKey, JSON.stringify(val)); } catch(e) {}
            }, (err) => {
                console.warn('Firebase listen error on ' + path + ':', err.message);
            });
        } catch (e) {
            console.warn('Firebase listen setup failed for ' + path);
        }
    }

    // 2. LocalStorage cross-tab listener (fires in OTHER tabs)
    window.addEventListener('storage', (e) => {
        if (e.key === lsKey && e.newValue) {
            try { callback(JSON.parse(e.newValue)); } catch(err) {}
        }
    });

    // 3. Initial load from LocalStorage (for instant display before Firebase connects)
    const cached = localStorage.getItem(lsKey);
    if (cached) {
        try { callback(JSON.parse(cached)); } catch(err) {}
    }
}

/**
 * Write data to a specific path (overwrite).
 */
export function writeData(path, data) {
    const lsKey = 'ef_' + path.replace(/\//g, '_');
    const payload = { ...data, updatedAt: Date.now() };

    // LocalStorage (immediate, cross-tab)
    try {
        localStorage.setItem(lsKey, JSON.stringify(payload));
        window.dispatchEvent(new StorageEvent('storage', {
            key: lsKey, newValue: JSON.stringify(payload), url: location.href
        }));
    } catch(e) {}

    // Firebase
    if (db) {
        try { set(ref(db, path), payload); } catch(e) {
            console.warn('Firebase write failed:', path, e.message);
        }
    }
}

/**
 * Push a new child to a list path (auto-generated key).
 * Returns the generated key.
 */
export function pushData(path, data) {
    const payload = { ...data, sentAt: Date.now() };
    let generatedKey = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    // Firebase push (gets real key)
    if (db) {
        try {
            const newRef = push(ref(db, path));
            generatedKey = newRef.key;
            set(newRef, payload);
        } catch(e) {
            console.warn('Firebase push failed:', path, e.message);
        }
    }

    // LocalStorage (merge into list)
    const lsKey = 'ef_' + path.replace(/\//g, '_');
    try {
        const existing = JSON.parse(localStorage.getItem(lsKey) || '{}');
        existing[generatedKey] = payload;
        // Trim to last 50 entries
        const keys = Object.keys(existing);
        if (keys.length > 50) {
            keys.slice(0, keys.length - 50).forEach(k => delete existing[k]);
        }
        localStorage.setItem(lsKey, JSON.stringify(existing));
        window.dispatchEvent(new StorageEvent('storage', {
            key: lsKey, newValue: JSON.stringify(existing), url: location.href
        }));
    } catch(e) {}

    return generatedKey;
}

/**
 * Update specific fields at a path (merge, not overwrite).
 */
export function updateData(path, fields) {
    const lsKey = 'ef_' + path.replace(/\//g, '_');

    // Firebase
    if (db) {
        try { update(ref(db, path), fields); } catch(e) {}
    }

    // LocalStorage merge
    try {
        const existing = JSON.parse(localStorage.getItem(lsKey) || '{}');
        Object.assign(existing, fields);
        localStorage.setItem(lsKey, JSON.stringify(existing));
        window.dispatchEvent(new StorageEvent('storage', {
            key: lsKey, newValue: JSON.stringify(existing), url: location.href
        }));
    } catch(e) {}
}

/* ═══════════════════════════════════════════════════════════════
   DOMAIN-SPECIFIC HELPERS  —  Typed wrappers for each schema node
   ═══════════════════════════════════════════════════════════════ */

// ── Zones ────────────────────────────────────────────────────
export function writeZone(zoneId, density, status) {
    writeData('zones/' + zoneId, { density, status, updatedAt: Date.now() });
}
export function listenZones(callback) {
    listen('zones', callback);
}

// ── Staff ────────────────────────────────────────────────────
export function writeStaff(staffId, data) {
    writeData('staff/' + staffId, {
        zoneId: data.zoneId || data.zone || '',
        status: data.status || 'clear',
        lastReport: Date.now(),
        online: data.online !== undefined ? data.online : true
    });
}
export function listenStaff(callback) {
    listen('staff', callback);
}

// ── Instructions ─────────────────────────────────────────────
export function pushInstruction(zoneId, message) {
    return pushData('instructions', {
        zoneId, message, sentAt: Date.now(), acknowledgedBy: []
    });
}
export function acknowledgeInstruction(instructionId, staffId) {
    if (db) {
        const ackRef = ref(db, 'instructions/' + instructionId + '/acknowledgedBy/' + staffId);
        set(ackRef, Date.now());
    }
    // LocalStorage
    const lsKey = 'ef_instructions';
    try {
        const existing = JSON.parse(localStorage.getItem(lsKey) || '{}');
        if (existing[instructionId]) {
            if (!existing[instructionId].acknowledgedBy) existing[instructionId].acknowledgedBy = {};
            existing[instructionId].acknowledgedBy[staffId] = Date.now();
            localStorage.setItem(lsKey, JSON.stringify(existing));
            window.dispatchEvent(new StorageEvent('storage', {
                key: lsKey, newValue: JSON.stringify(existing), url: location.href
            }));
        }
    } catch(e) {}
}
export function listenInstructions(callback) {
    listen('instructions', callback);
}

// ── Nudges ───────────────────────────────────────────────────
export function pushNudge(targetZone, message) {
    return pushData('nudges', { targetZone, message, sentAt: Date.now() });
}
export function listenNudges(callback) {
    listen('nudges', callback);
}

// ── Feedback ─────────────────────────────────────────────────
export function writeFeedback(timestamp, data) {
    writeData('feedback/' + timestamp, {
        rating: data.rating,
        issues: data.issues || [],
        helpfulness: data.helpfulness || ''
    });
}

// ── Attendees ────────────────────────────────────────────────
export function writeAttendee(sessionId, data) {
    writeData('attendees/' + sessionId, {
        intakeData: data.intakeData || data,
        currentZone: data.currentZone || ''
    });
}
export function listenAttendee(sessionId, callback) {
    listen('attendees/' + sessionId, callback);
}

/* ═══════════════════════════════════════════════════════════════
   LEGACY COMPAT  —  Keep old imports working during migration
   ═══════════════════════════════════════════════════════════════ */
export function onSync(node, callback) { listen(node, callback); }
export function pushSync(node, data) {
    if (node === 'instructions') {
        pushInstruction(data.zone || data.zoneId || '', data.text || data.message || '');
    } else if (node === 'staff_status') {
        writeStaff(data.staffId || data.zone || 'unknown', data);
    } else {
        writeData(node, data);
    }
}
export function syncSimulation(state) {
    // Write each zone's density to /zones/{zoneId}
    if (state.zones) {
        Object.keys(state.zones).forEach(zoneName => {
            const d = state.zones[zoneName];
            const status = d > 0.80 ? 'critical' : d > 0.60 ? 'busy' : 'clear';
            writeZone(zoneName.replace(/\s/g, '_'), Math.round(d * 100), status);
        });
    }
}
export function syncFeedback(payload) {
    writeFeedback(Date.now(), payload);
}
export function syncIntake(payload) {
    const sessionId = localStorage.getItem('ef_session_id') || ('sess_' + Date.now());
    localStorage.setItem('ef_session_id', sessionId);
    writeAttendee(sessionId, { intakeData: payload });
}
export function syncReport(payload) { pushData('reports', payload); }

export { db, ref, set, push, onValue, off, auth, update, get };
