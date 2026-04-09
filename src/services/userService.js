import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export async function createUserProfile(uid, data) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, data);
}

export async function getUserProfile(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export function subscribeToUserProfile(uid, callback) {
  const ref = doc(db, 'users', uid);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  }, (err) => {
    console.error('Snapshot error:', err);
    callback(null);
  });
}

export async function updateUserProfile(uid, data) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, data);
}

// ==========================================
// SIMULASI MANAJEMEN TIM (MVP RBAC)
// ==========================================

export async function getTeamMembers(ownerId) {
  // Dalam versi production, ini akan melakukan query Firestore ke koleksi 'users'
  // dengan clause: where('companyId', '==', ownerId)
  return [
    { id: 'st1', name: 'Sisil (CS Utama)', email: 'sisil@aksena.id', role: 'staff' },
    { id: 'mn1', name: 'Andi (Ops)', email: 'andi@aksena.id', role: 'manager' }
  ];
}

export async function inviteTeamMember(ownerId, data) {
  // Simulasi penambahan user baru ke sistem
  console.log(`Mengirim undangan ke ${data.email} sebagai ${data.role} dari Owner ${ownerId}`);
  return { id: 'new_' + Date.now(), ...data };
}
