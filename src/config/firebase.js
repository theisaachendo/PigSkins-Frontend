import { getFirebaseApp, getFirebaseAuth, getFirebaseDB, getFirebaseStorage } from './initializeFirebase';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';

const app = getFirebaseApp();
const auth = getFirebaseAuth();
const db = getFirebaseDB();
const storage = getFirebaseStorage();

// Connect to emulators in development
if (__DEV__) {
  console.log('Connecting to emulators...');
  try {
    connectFirestoreEmulator(db, 'localhost', 8082);
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('Connected to emulators successfully');
  } catch (error) {
    console.error('Error connecting to emulators:', error);
  }
}

export { app, auth, db, storage }; 