import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAvP6NhL97kyZMXUyf8ML07j-tRRqtGNtY",
  authDomain: "ehop-covoiturage.firebaseapp.com",
  projectId: "ehop-covoiturage",
  storageBucket: "ehop-covoiturage.appspot.com",
  messagingSenderId: "433741909670",
  appId: "1:433741909670:web:9d63d940ed05f33b79ee67",
  measurementId: "G-R7HPTZ53YJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser doesn\'t support persistence.');
  }
});

// Set persistent auth state
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error);
});

export const getValidUrl = (path: string): string => {
  if (!path || typeof path !== 'string') {
    return '/';
  }

  const cleanPath = path.trim()
    .replace(/\/+/g, '/') 
    .replace(/^\/+|\/+$/g, '');

  if (!cleanPath) {
    return '/';
  }

  if (cleanPath.includes('://')) {
    try {
      const url = new URL(cleanPath);
      return '/' + url.pathname.replace(/^\/+|\/+$/g, '');
    } catch {
      console.warn(`Invalid absolute URL: ${cleanPath}`);
      return '/';
    }
  }

  return '/' + cleanPath;
};