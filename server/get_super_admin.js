const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function findSuperAdmins() {
  const snapshot = await db.collection('users').get();
  
  console.log('--- DAFTAR AKUN ---');
  let found = false;
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Email: ${data.email || 'N/A'}, Role: ${data.role || 'N/A'}, UID: ${doc.id}`);
    if (data.role === 'super_admin') {
      found = true;
    }
  });

  if (!found) {
    console.log('\nBelum ada akun dengan role "super_admin" di Firestore (koleksi "users").');
  }
}

findSuperAdmins().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
