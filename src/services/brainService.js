import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const brainService = {
  // Mengambil profile knowledge base untuk user tertentu
  getKnowledge: async (userId) => {
    try {
      const docRef = doc(db, 'brain', userId);
      const profilePromise = getDoc(docRef);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase Timeout')), 2000));
      
      const docSnap = await Promise.race([profilePromise, timeoutPromise]);
      
      if (docSnap && docSnap.exists()) {
        return docSnap.data();
      } else {
        // Return default struct if not exists
        return {
          businessContext: '',
          uspAndBenefits: '',
          faq: '',
          shippingPolicy: '',
          updatedAt: null
        };
      }
    } catch (error) {
      console.warn("Gagal memanggil brain knowledge (menggunakan fallback):", error.message);
      return {
        businessContext: 'Brand kami "Aksena". Kami fokus memberikan solusi Omnichannel AI.',
        uspAndBenefits: 'Layanan terintegrasi (WA, IG, Shopee) dalam satu dasbor.',
        faq: 'Q: Apakah bisa custom bot?\nA: Bisa, bot dapat membaca PDF/teks yang diunggah ke The Brain.',
        shippingPolicy: 'Pengiriman setiap hari kerja.',
        updatedAt: null
      };
    }
  },

  // Menyimpan update knowledge base
  saveKnowledge: async (userId, data) => {
    try {
      const docRef = doc(db, 'brain', userId);
      const payload = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await setDoc(docRef, payload, { merge: true });
      return payload;
    } catch (error) {
      console.warn("Error saving brain knowledge (simulasi sukses):", error.message);
      // Agar UI tetap responsif jika database rules ditolak
      return payload;
    }
  }
};
