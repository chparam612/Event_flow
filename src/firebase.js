/**
 * Firebase Initialization with LocalStorage Cross-Tab Sync
 * This ensures the app works perfectly even if Firebase is unreachable.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, off } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
  console.warn("Firebase: Initialization failed. LocalSync active.");
}

// ── Ultra-Resilient Sync (Shared between Tabs) ────────────────
const syncEmitters = {};

export function onSync(node, callback) {
    // 1. Listen to Firebase if available
    if (db) onValue(ref(db, node), (snap) => callback(snap.val()));

    // 2. Listen to LocalStorage for cross-tab sync
    window.addEventListener('storage', (e) => {
        if (e.key === `ef_sync_${node}`) {
            callback(JSON.parse(e.newValue));
        }
    });

    // 3. Initial load from LocalStorage
    const local = localStorage.getItem(`ef_sync_${node}`);
    if (local) callback(JSON.parse(local));
}

export function pushSync(node, data) {
    const key = `ef_sync_${node}`;
    const timestamped = { ...data, timestamp: Date.now() };
    
    let newValue;
    if (node === 'staff_status') {
        const existing = JSON.parse(localStorage.getItem(key) || '{}');
        const zoneKey = data.zone ? data.zone.replace(/\s/g, '_') : 'unknown';
        existing[zoneKey] = timestamped;
        newValue = existing;
    } else if (node === 'reports') {
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(timestamped);
        newValue = existing.slice(-20); // Keep last 20 reports
    } else {
        newValue = timestamped;
    }

    localStorage.setItem(key, JSON.stringify(newValue));
    
    // Trigger locally for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
        key: key,
        newValue: JSON.stringify(newValue),
        url: window.location.href
    }));

    // Sync to Firebase if available
    if (db) {
        if (node === 'staff_status') {
            const zKey = data.zone ? data.zone.replace(/\s/g, '_') : 'unknown';
            set(ref(db, `${node}/${zKey}`), timestamped).catch(() => {});
        } else {
            push(ref(db, node), timestamped).catch(() => {});
        }
    }
}

// Legacy Helpers (Mapping to new sync system)
export function syncSimulation(state) { pushSync('simulation', state); }
export function syncFeedback(payload) { pushSync('feedback', payload); }
export function syncIntake(payload) { pushSync('intake', payload); }
export function syncReport(payload) { pushSync('reports', payload); }

export { db, ref, set, push, onValue, off, auth };
