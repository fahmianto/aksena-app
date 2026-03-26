async function promote() {
  const { initializeApp } = await import('firebase/app');
  const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
  const { getFirestore, doc, updateDoc, getDoc } = await import('firebase/firestore');

  const firebaseConfig = {
    apiKey: "AIzaSyDp2qbPJryTBpNMdzU-QyJI9IHzFSTsyDY",
    authDomain: "aksena-mvp.firebaseapp.com",
    projectId: "aksena-mvp",
    storageBucket: "aksena-mvp.firebasestorage.app",
    messagingSenderId: "1090951998118",
    appId: "1:1090951998118:web:29d8d60db4e4e31322e267",
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

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

promote().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
