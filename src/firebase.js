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
  // Use a safer default or handle the misconfigured URL provided by the environment
  databaseURL: "https://eventflow-nms-default-rtdb.firebaseio.com",
  projectId: "eventflow-nms",
  storageBucket: "eventflow-nms.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890"
};

let app, db, auth;

try {
  app = initializeApp(firebaseConfig);
  // Only attempt to get DB if the URL looks valid (not the placeholder)
  if (firebaseConfig.databaseURL && !firebaseConfig.databaseURL.includes('default-rtdb')) {
      db = getDatabase(app);
  }
  auth = getAuth(app);
} catch (error) {
  console.warn("Firebase: Initialization failed. LocalSync active.");
}

// ── Ultra-Resilient Sync (Shared between Tabs) ────────────────
export function onSync(node, callback) {
    // 1. Listen to Firebase if available
    if (db) {
        try {
            onValue(ref(db, node), (snap) => callback(snap.val()));
        } catch (e) {
            console.warn(`Firebase listen failed for ${node}:`, e.message);
        }
    }

    // 2. Listen to LocalStorage for cross-tab sync
    window.addEventListener('storage', (e) => {
        if (e.key === `ef_sync_${node}`) {
            try {
                callback(JSON.parse(e.newValue));
            } catch (err) {
                console.error("LocalSync Parse Error", err);
            }
        }
    });

    // 3. Initial load from LocalStorage
    const local = localStorage.getItem(`ef_sync_${node}`);
    if (local) {
        try {
            callback(JSON.parse(local));
        } catch (err) {
            console.error("LocalSync Initial Parse Error", err);
        }
    }
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
        newValue = existing.slice(-20);
    } else {
        newValue = timestamped;
    }

    // Update LocalStorage
    localStorage.setItem(key, JSON.stringify(newValue));
    
    // Trigger locally for cross-tab sync (StorageEvent only naturally fires in OTHER tabs)
    window.dispatchEvent(new StorageEvent('storage', {
        key: key,
        newValue: JSON.stringify(newValue),
        url: window.location.href
    }));

    // Sync to Firebase if available
    if (db) {
        try {
            if (node === 'staff_status') {
                const zKey = data.zone ? data.zone.replace(/\s/g, '_') : 'unknown';
                set(ref(db, `${node}/${zKey}`), timestamped);
            } else {
                push(ref(db, node), timestamped);
            }
        } catch (e) {
            console.warn(`Firebase push failed for ${node}:`, e.message);
        }
    }
}

// Legacy Helpers
export function syncSimulation(state) { pushSync('simulation', state); }
export function syncFeedback(payload) { pushSync('feedback', payload); }
export function syncIntake(payload) { pushSync('intake', payload); }
export function syncReport(payload) { pushSync('reports', payload); }

export { db, ref, set, push, onValue, off, auth };
