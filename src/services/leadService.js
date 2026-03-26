import { db } from '../firebase/config';
import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  query, orderBy, serverTimestamp, getDoc, setDoc
} from 'firebase/firestore';

const LEADS_COL = 'aksena_leads';

/**
 * Pipeline stages in order
 */
export const LEAD_STAGES = ['LEAD', 'NEW', 'NURTURED', 'OFFERED', 'CLOSING', 'CONVERTED', 'LOST'];

export const STAGE_META = {
  LEAD:      { label: 'Interest',  color: '#8baec8', desc: 'Isi form landing page' },
  NEW:       { label: 'Baru Daftar', color: '#3b82f6', desc: 'Baru buat akun' },
  NURTURED:  { label: 'Edukasi',   color: '#f59e0b', desc: 'Seri nurturing dikirim' },
  OFFERED:   { label: 'Penawaran', color: '#7c3aed', desc: 'Offer harga terkirim' },
  CLOSING:   { label: 'Closing',   color: '#00d4ff', desc: 'Negosiasi aktif' },
  CONVERTED: { label: 'Converted', color: '#10b981', desc: 'Sudah bayar & aktif' },
  LOST:      { label: 'Lost',      color: '#ef4444', desc: 'Tidak tertarik' },
};

/**
 * Create a new lead entry in Firestore.
 * @param {Object} data - { name, email, businessName, phone, source, planInterest }
 */
export async function createLead(data) {
  const leadData = {
    name:         data.name || '',
    email:        data.email || '',
    businessName: data.businessName || data.business || '',
    phone:        data.phone || '',
    source:       data.source || 'unknown',    // 'register', 'landing_cta', 'whatsapp_inquiry'
    stage:        data.stage  || 'NEW',
    planInterest: data.planInterest || 'basic',
    notes:        '',
    createdAt:    serverTimestamp(),
    lastContactedAt: null,
    convertedAt:  null,
    userId:       data.userId || null,         // Firebase Auth UID if registered
  };
  const ref = await addDoc(collection(db, LEADS_COL), leadData);
  return ref.id;
}

/**
 * Update a lead's pipeline stage.
 */
export async function updateLeadStage(leadId, stage) {
  const ref = doc(db, LEADS_COL, leadId);
  await updateDoc(ref, { stage, lastContactedAt: serverTimestamp() });
}

/**
 * Update arbitrary lead fields.
 */
export async function updateLead(leadId, data) {
  const ref = doc(db, LEADS_COL, leadId);
  await updateDoc(ref, data);
}

/**
 * Log a contact history entry (subcollection).
 */
export async function logContactHistory(leadId, entry) {
  const sub = collection(db, LEADS_COL, leadId, 'contact_history');
  await addDoc(sub, {
    ...entry,
    timestamp: serverTimestamp(),
  });
}

/**
 * Real-time listener for all leads (for admin dashboard).
 * @param {Function} callback - Receives array of lead objects
 */
export function subscribeToLeads(callback) {
  const q = query(collection(db, LEADS_COL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const leads = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(leads);
  });
}

/**
 * Get a single lead by ID.
 */
export async function getLead(leadId) {
  const snap = await getDoc(doc(db, LEADS_COL, leadId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
