import {
  collection, doc, getDocs, addDoc, updateDoc,
  query, where, orderBy, serverTimestamp, limit, onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLL = 'transactions';

export async function getTransactions(userId, limitCount = 50) {
  const q = query(
    collection(db, COLL),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeTransactions(userId, callback, limitCount = 50) {
  const q = query(
    collection(db, COLL),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

export async function addTransaction(userId, data) {
  const fee = data.amount * (data.feeRate / 100);
  return addDoc(collection(db, COLL), {
    ...data,
    fee,
    netAmount: data.amount - fee,
    userId,
    createdAt: serverTimestamp(),
  });
}

export async function updateTransactionStatus(txId, status) {
  return updateDoc(doc(db, COLL, txId), { status, updatedAt: serverTimestamp() });
}

/** Seed demo transactions for a new user */
export async function seedDemoTransactions(userId) {
  const demos = [
    { txRef: 'TXN-001', customer: 'Siti Rahayu',    channel: 'WA', amount: 850000,  feeRate: 0.5, status: 'success' },
    { txRef: 'TXN-002', customer: 'rizky_style',     channel: 'IG', amount: 320000,  feeRate: 1,   status: 'success' },
    { txRef: 'TXN-003', customer: 'buyer_2024***',   channel: 'SH', amount: 1200000, feeRate: 1,   status: 'pending' },
    { txRef: 'TXN-004', customer: 'Bapak Hendra',   channel: 'WA', amount: 560000,  feeRate: 1,   status: 'success' },
    { txRef: 'TXN-005', customer: 'Dewi Kurnia',    channel: 'WA', amount: 195000,  feeRate: 1,   status: 'failed'  },
    { txRef: 'TXN-006', customer: 'fashionista_jkt', channel: 'IG', amount: 2100000, feeRate: 1,   status: 'success' },
  ];
  const writes = demos.map(t => addTransaction(userId, t));
  return Promise.all(writes);
}
