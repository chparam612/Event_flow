/**
 * EventFlow — Auth Module v3 (Hardened)
 * Single Firebase version — consistent instance management
 */
import {
    signInWithEmailAndPassword,
    signInAnonymously,
    signOut,
    onAuthStateChanged,
    getAuth
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth, app } from '/src/firebase.js';

/* ─── Wait for Auth Ready ────────────────────────────── */
/**
 * Resolves with the current User or null once Firebase has finished initializing.
 */
export function waitForAuthReady() {
    return new Promise((resolve) => {
        if (!auth) { 
            console.warn("Auth instance not found during init.");
            resolve(null); 
            return; 
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

/* ─── Get Current User (async — waits for init) ─────── */
export async function getCurrentUser() {
    return await waitForAuthReady();
}

/* ─── Email/Password Login ───────────────────────────── */
export async function loginWithEmail(email, password) {
    if (!auth) throw new Error("Auth system offline.");
    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return cred.user;
    } catch (error) {
        console.error("Login failed:", error.code);
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                throw new Error('Invalid email or password.');
            case 'auth/too-many-requests':
                throw new Error('Too many attempts. Wait and retry.');
            case 'auth/network-request-failed':
                throw new Error('Network error. Check connection.');
            default:
                throw new Error('Login failed: ' + (error.message || 'Unknown'));
        }
    }
}

/* ─── Anonymous Login (Attendees) ───────────────────── */
export async function loginAsAttendee() {
    if (!auth) return null;
    try {
        const result = await signInAnonymously(auth);
        localStorage.setItem('eventflow_role', 'attendee');
        localStorage.setItem('eventflow_uid', result.user.uid);
        console.log('✅ Anonymous session active:', result.user.uid);
        return result.user;
    } catch (error) {
        console.error('❌ Anon login error:', error.code, error.message);
        return null;
    }
}

/* ─── Logout ─────────────────────────────────────────── */
export async function logout() {
    console.log('🔴 Initiating secure logout...');
    try {
        if (auth) {
            await signOut(auth);
            console.log('✅ Firebase signOut successful');
        }
    } catch (e) {
        console.warn('SignOut error:', e.message);
    }

    // Comprehensive storage purge
    try {
        localStorage.clear();
        sessionStorage.clear();
        
        // Specific keys just in case .clear() is restricted
        localStorage.removeItem('eventflow_role');
        localStorage.removeItem('eventflow_uid');
        localStorage.removeItem('eventflow_staff_session');
        
        console.log('✅ Session storage purged');
    } catch(e) {
        console.error("Storage clear failed:", e);
    }

    // Force redirect to landing
    console.log('✅ Redirecting to /');
    window.location.replace('/');
}

// Global fallback for legacy calls
window.efLogout = logout;

/* ─── Auth State Listener ────────────────────────────── */
export function onAuthChange(callback) {
    if (auth) return onAuthStateChanged(auth, callback);
    callback(null);
    return () => {};
}

/* ─── Role Checks ────────────────────────────────────── */
export function isStaff(user) {
    const u = user || (auth && auth.currentUser);
    return !!(u && u.email && u.email.includes('staff'));
}
export function isControl(user) {
    const u = user || (auth && auth.currentUser);
    return !!(u && u.email && u.email.includes('control'));
}
export function isAttendee(user) {
    const u = user || (auth && auth.currentUser);
    return !!(u && u.isAnonymous);
}

