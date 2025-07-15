import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/*
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
*/

const firebaseConfig = {
  apiKey: "AIzaSyDLX_Fh6KhIbxaRRICPX3Io1IcCPxtOtRk",
  authDomain: "jimify-a6795.firebaseapp.com",
  projectId: "jimify-a6795",
  storageBucket: "jimify-a6795.firebasestorage.app",
  messagingSenderId: "1072480071594",
  appId: "1:1072480071594:web:d065f26a2689a5b3c145d3",
  measurementId: "G-E0QK5765R5"
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };