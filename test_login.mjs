import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import fs from 'fs';

// Baca .env dari folder project
import dotenv from 'dotenv';
dotenv.config();

// Config firebase sesuai src/firebase/config.js
// karena kita menjalankan dari node, kita butuh config. 
// Daripada pusing parse config.js yang mungkin pakai import.meta.env (Vite), kita hardcode dummy atau parse dari .env
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function checkAccount() {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, "admin@aksena.id", "admin123");
    const user = userCredential.user;
    
    console.log("✅ Berhasil Login Auth! UID:", user.uid);
    
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log("✅ Data Profil Ditemukan:");
      console.log(docSnap.data());
      if (docSnap.data().role === 'super_admin') {
        console.log("➡️ KESIMPULAN: Ya, akun ini adalah SUPER ADMIN.");
      } else {
        console.log("➡️ KESIMPULAN: Akun ini BUKAN super admin. Rolnya adalah:", docSnap.data().role);
      }
    } else {
      console.log("❌ Dokumen profil tidak ditemukan di koleksi 'users'!");
    }
    
  } catch (error) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-login-credentials') {
      console.log("❌ Akun tidak ditemukan atau password salah di Authentication.");
    } else {
      console.error("❌ Error lain:", error.message);
    }
  }
}

checkAccount().then(() => process.exit(0));
