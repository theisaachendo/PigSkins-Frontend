import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC8sK1gjc_cr8ALdRF0jc6Id0fY_bar4PM",
  authDomain: "pigskins-72811.firebaseapp.com",
  projectId: "pigskins-72811",
  storageBucket: "pigskins-72811.firebasestorage.app",
  messagingSenderId: "849865652578",
  appId: "1:849865652578:web:7ccd5cef25ed482eadd43b",
  measurementId: "G-NFS5ZQP55K"
};

// Single instances
let app = null;
let auth = null;
let db = null;
let storage = null;

// Initialize Firebase only once
export function getFirebaseApp() {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

// Initialize Auth with AsyncStorage persistence
export function getFirebaseAuth() {
  if (!auth) {
    const app = getFirebaseApp();
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  }
  return auth;
}

// Initialize Firestore with new cache settings
export function getFirebaseDB() {
  if (!db) {
    const app = getFirebaseApp();
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
      })
    });
  }
  return db;
}

// Initialize Storage
export function getFirebaseStorage() {
  if (!storage) {
    const app = getFirebaseApp();
    storage = getStorage(app);
  }
  return storage;
}

// Initialize all services
export function initializeFirebase() {
  const app = getFirebaseApp();
  const auth = getFirebaseAuth();
  const db = getFirebaseDB();
  const storage = getFirebaseStorage();
  
  return { app, auth, db, storage };
} 