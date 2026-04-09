const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function updateRole() {
  try {
    await db.collection('users').doc('M2uJyx8SqOV').set({
      email: 'test_browser@aksena.id',
      role: 'owner'
    }, { merge: true });
    console.log('Successfully updated user M2uJyx8SqOV to owner');
    process.exit(0);
  } catch (err) {
    console.error('Error updating role:', err);
    process.exit(1);
  }
}

updateRole();
