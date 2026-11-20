import { initializeApp } from 'firebase/app';
import {
    GoogleAuthProvider,
    connectAuthEmulator,
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
};

// Keep this condition inline so Vite/esbuild can fold it and drop the warning
// string from production bundles when the values are present.
export const firebaseConfigError =
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID
        ? ''
        : 'Firebase is not configured. Add the VITE_FIREBASE_* variables to frontend/.env.local and redeploy.';

const configured = firebaseConfigError === '';

export const app = configured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;

if (auth && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    connectAuthEmulator(
        auth,
        import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099',
        { disableWarnings: true },
    );
}

export function subscribeToAuth(callback) {
    if (!auth) {
        callback(null);
        return () => {};
    }
    return onAuthStateChanged(auth, callback);
}

export async function getAuthToken(forceRefresh = false) {
    if (!auth?.currentUser) return null;
    return auth.currentUser.getIdToken(forceRefresh);
}

export async function registerWithEmail({ email, password, username }) {
    if (!auth) throw new Error(firebaseConfigError);

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (username) {
        await updateProfile(credential.user, { displayName: username });
    }
    return credential.user;
}

export async function loginWithEmail(email, password) {
    if (!auth) throw new Error(firebaseConfigError);

    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
}

export async function loginWithGoogle() {
    if (!auth) throw new Error(firebaseConfigError);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(auth, provider);
    return credential.user;
}

export async function logout() {
    if (auth) await signOut(auth);
}

export function friendlyAuthError(error) {
    const code = error?.code || '';
    const messages = {
        'auth/email-already-in-use': 'An account already exists for this email. Sign in instead.',
        'auth/invalid-credential': 'Email or password is incorrect.',
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/missing-password': 'Enter your password.',
        'auth/network-request-failed': 'Network error. Check your connection and try again.',
        'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase.',
        'auth/popup-blocked': 'Allow popups and try again, or use email sign-in.',
        'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
        'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'Email or password is incorrect.',
        'auth/weak-password': 'Use a password with at least 6 characters.',
        'auth/wrong-password': 'Email or password is incorrect.',
    };

    return messages[code] || error?.message || 'Authentication failed.';
}
