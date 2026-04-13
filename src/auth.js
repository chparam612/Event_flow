/**
 * EventFlow — Auth Module v3
 * Single Firebase version — no conflicts
 */
import {
    signInWithEmailAndPassword,
    signInAnonymously,
    signOut,
    onAuthStateChanged,
    getAuth
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from '/src/firebase.js';

/* ─── Wait for Auth Ready ────────────────────────────── */
export function waitForAuthReady() {
    return new Promise((resolve) => {
        if (!auth) { resolve(null); return; }
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
    try {
        const cred = await signInWithEmailAndPassword(
            auth, email, password
        );
        return cred.user;
    } catch (error) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                throw new Error(
                    'Invalid email or password.'
                );
            case 'auth/too-many-requests':
                throw new Error(
                    'Too many attempts. Wait and retry.'
                );
            case 'auth/network-request-failed':
                throw new Error(
                    'Network error. Check connection.'
                );
            default:
                throw new Error(
                    'Login failed: ' + (error.message || 'Unknown')
                );
        }
    }
}

/* ─── Anonymous Login (Attendees) ───────────────────── */
export async function loginAsAttendee() {
    try {
        const result = await signInAnonymously(auth);
        localStorage.setItem('eventflow_role', 'attendee');
        localStorage.setItem('eventflow_uid', result.user.uid);
        console.log('✅ Anonymous login:', result.user.uid);
        return result.user;
    } catch (error) {
        console.error('❌ Anon login error:', 
            error.code, error.message);
        if (error.code === 'auth/operation-not-allowed') {
            console.error('Enable Anonymous auth in Firebase Console');
        }
        return null;
    }
}

/* ─── Logout ─────────────────────────────────────────── */
export async function logout() {
    console.log('🔴 Logout called');
    try {
        await signOut(auth);
        console.log('✅ Firebase signOut done');
    } catch (e) {
        console.warn('SignOut error:', e.message);
    }
    // Clear all storage
    try { localStorage.clear(); } catch(e) {}
    try { sessionStorage.clear(); } catch(e) {}
    console.log('✅ Redirecting to /');
    // Replace so user cannot go back
    window.location.replace('/');
}

// Global fallback
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
    return u && u.email && u.email.includes('staff');
}
export function isControl(user) {
    const u = user || (auth && auth.currentUser);
    return u && u.email && u.email.includes('control');
}
export function isAttendee(user) {
    const u = user || (auth && auth.currentUser);
    return u && u.isAnonymous;
}
