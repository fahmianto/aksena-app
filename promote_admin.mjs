import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import dotenv from 'dotenv';
dotenv.config();

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

async function promote() {
  const email = "fahmizz580@gmail.com";
  const pass = "berkah1f0";

  console.log(`Mencoba login dengan ${email}...`);
  try {
    const uc = await signInWithEmailAndPassword(auth, email, pass);
    const uid = uc.user.uid;
    console.log(`✅ Login berhasil! UID: ${uid}`);

    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    
    if (snap.exists()) {
      console.log(`🛠️ Mengubah role dari ${snap.data().role || 'owner'} menjadi super_admin...`);
      await updateDoc(userRef, { role: 'super_admin' });
      console.log("✅ Berhasil! Akun fahmizz580@gmail.com sekarang adalah SUPER ADMIN.");
    } else {
      console.log("❌ Dokumen profil tidak ditemukan di koleksi 'users'. Daftarkan dulu di Register.");
    }
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    if (err.code === 'auth/invalid-credential') {
      console.log("Pastikan email dan password sudah didaftarkan di halaman /register.");
    }
  }
}

promote().then(() => process.exit(0));
