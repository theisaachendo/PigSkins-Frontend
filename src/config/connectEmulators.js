import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';
import { getFirebaseAuth, getFirebaseDB, getFirebaseStorage } from './initializeFirebase';

export const connectEmulators = () => {
  console.log('[Emulators] Starting emulator connections...');
  
  try {
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    const storage = getFirebaseStorage();

    if (process.env.NODE_ENV === 'development') {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('[Emulators] Auth emulator connected');
      } catch (error) {
        console.warn('[Emulators] Auth emulator connection failed:', error);
      }

      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('[Emulators] Firestore emulator connected');
      } catch (error) {
        console.warn('[Emulators] Firestore emulator connection failed:', error);
      }

      try {
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('[Emulators] Storage emulator connected');
      } catch (error) {
        console.warn('[Emulators] Storage emulator connection failed:', error);
      }

      console.log('[Emulators] All emulator connections complete');
    }
  } catch (error) {
    console.error('[Emulators] Failed to connect to emulators:', error);
  }
}; 