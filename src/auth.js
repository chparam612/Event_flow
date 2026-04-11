/**
 * EventFlow — Auth Module v2
 * Firebase Email/Password + Anonymous Authentication
 */
import {
    signInWithEmailAndPassword,
    signInAnonymously,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from '/src/firebase.js';

/* ─── Wait for Firebase Auth to Initialize ──────────── */
// Firebase takes ~300-600ms to restore session from IndexedDB.
// Always await this before any auth check!
export function waitForAuthReady() {
    return new Promise((resolve) => {
        if (!auth) { resolve(null); return; }
        // onAuthStateChanged fires once immediately with current user (or null)
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

/* ─── Email/Password Login ───────────────────────────── */
export async function loginWithEmail(email, password) {
    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return cred.user;
    } catch (error) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                throw new Error('Invalid email or password. Please check credentials.');
            case 'auth/too-many-requests':
                throw new Error('Too many failed attempts. Please wait and try again.');
            case 'auth/network-request-failed':
                throw new Error('Network error. Please check your connection.');
            case 'auth/user-disabled':
                throw new Error('This account has been disabled. Contact admin.');
            default:
                throw new Error('Login failed: ' + (error.message || 'Unknown error'));
        }
    }
}

/* ─── Anonymous Login (for Attendees) ───────────────── */
export async function loginAnonymously() {
    try {
        const cred = await signInAnonymously(auth);
        localStorage.setItem('eventflow_role', 'attendee');
        localStorage.setItem('eventflow_uid', cred.user.uid);
        return cred.user;
    } catch (error) {
        throw new Error('Session setup failed. Please check connection.');
    }
}

/* ─── Logout ─────────────────────────────────────────── */
export async function logout() {
    try {
        if (auth) await signOut(auth);
    } catch (e) {
        console.warn('Firebase signOut error:', e.message);
    } finally {
        // Clear all local state
        sessionStorage.clear();
        localStorage.removeItem('eventflow_staff_session');
        localStorage.removeItem('eventflow_control_session');
        localStorage.removeItem('eventflow_role');
        localStorage.removeItem('eventflow_uid');
        // Hard redirect to landing (clears any router state)
        window.location.href = '/';
    }
}

/* ─── Get Current User (sync) ────────────────────────── */
export function getCurrentUser() {
    return auth ? auth.currentUser : null;
}

/* ─── Auth State Listener ────────────────────────────── */
export function onAuthChange(callback) {
    if (auth) return onAuthStateChanged(auth, callback);
    callback(null);
    return () => {};
}

/* ─── Role Checks ────────────────────────────────────── */
export function isStaff(user) {
    const u = user || getCurrentUser();
    return u && u.email && u.email.includes('staff');
}
export function isControl(user) {
    const u = user || getCurrentUser();
    return u && u.email && u.email.includes('control');
}
export function isAttendee(user) {
    const u = user || getCurrentUser();
    return u && u.isAnonymous;
}
