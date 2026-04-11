/**
 * EventFlow — Auth Module
 * Firebase Email/Password Authentication
 * Demo: staff@eventflow.demo / Staff@123
 *       control@eventflow.demo / Control@123
 */
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from '/src/firebase.js';

/* ─── Login ───────────────────────────────────────── */
export async function loginWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        // Friendly error messages
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
                throw new Error('Login failed. Please try again.');
        }
    }
}

/* ─── Logout ─────────────────────────────────────── */
export async function logout() {
    try {
        await signOut(auth);
        localStorage.removeItem('eventflow_staff_session');
        localStorage.removeItem('eventflow_control_session');
        window.history.pushState(null, null, '/');
        window.dispatchEvent(new Event('popstate'));
    } catch (error) {
        console.warn('Logout error:', error.message);
        // Force redirect anyway
        window.location.href = '/';
    }
}

/* ─── Current User ───────────────────────────────── */
export function getCurrentUser() {
    return auth ? auth.currentUser : null;
}

/* ─── Auth State Listener ────────────────────────── */
export function onAuthChange(callback) {
    if (auth) {
        return onAuthStateChanged(auth, callback);
    }
    callback(null);
    return () => {};
}

/* ─── Role Check ─────────────────────────────────── */
export function isStaff() {
    const user = getCurrentUser();
    return user && user.email && user.email.includes('staff');
}

export function isControl() {
    const user = getCurrentUser();
    return user && user.email && user.email.includes('control');
}
