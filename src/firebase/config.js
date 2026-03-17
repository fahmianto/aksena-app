import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDp2qbPJryTBpNMdzU-QyJI9IHzFSTsyDY",
  authDomain: "aksena-mvp.firebaseapp.com",
  projectId: "aksena-mvp",
  storageBucket: "aksena-mvp.firebasestorage.app",
  messagingSenderId: "1090951998118",
  appId: "1:1090951998118:web:29d8d60db4e4e31322e267",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
