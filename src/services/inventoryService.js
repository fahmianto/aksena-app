import {
  collection, doc, getDocs, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, serverTimestamp, onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLL = 'inventory';

export async function getInventory(userId) {
  const q = query(
    collection(db, COLL),
    where('userId', '==', userId),
    orderBy('name')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeToInventory(userId, callback) {
  const q = query(
    collection(db, COLL),
    where('userId', '==', userId),
    orderBy('name')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function addProduct(userId, data) {
  return addDoc(collection(db, COLL), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateProduct(productId, data) {
  const ref = doc(db, COLL, productId);
  return updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProduct(productId) {
  return deleteDoc(doc(db, COLL, productId));
}

/** Seed demo products for a new user */
export async function seedDemoInventory(userId) {
  const demos = [
    { name: 'Batik Tulis Motif Parang M', sku: 'BTK-001-M', stock: 7,  minStock: 5,  price: 185000, sold: 42, trend: '+12%', status: 'ok' },
    { name: 'Hijab Segi Empat Navy L',    sku: 'HJB-021-L', stock: 3,  minStock: 5,  price: 75000,  sold: 38, trend: '+28%', status: 'low' },
    { name: 'Kaos Polos Cotton S',        sku: 'KPS-003-S', stock: 0,  minStock: 10, price: 89000,  sold: 91, trend: '+5%',  status: 'out' },
    { name: 'Dress Batik Midi XL',        sku: 'DRS-007-XL',stock: 19, minStock: 5,  price: 245000, sold: 17, trend: '-3%',  status: 'ok' },
    { name: 'Celana Batik Pria M',        sku: 'CBP-011-M', stock: 4,  minStock: 8,  price: 165000, sold: 53, trend: '+18%', status: 'low' },
  ];
  const writes = demos.map(p => addProduct(userId, p));
  return Promise.all(writes);
}
