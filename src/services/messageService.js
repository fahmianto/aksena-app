import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

// Collection refs
const getConversationsRef = () => collection(db, 'conversations');
const getMessagesRef = (conversationId) => collection(db, 'conversations', conversationId, 'messages');

// Simulasi data jika Firestore gagal/timeout/belum di-setup
const mockConversations = [
  { id: 'conv-1', channel: 'whatsapp', customerName: 'Budi Santoso', lastMessage: 'Apakah stok produk A masih ada?', updatedAt: new Date(), unread: 2, status: 'new' },
  { id: 'conv-2', channel: 'instagram', customerName: 'Siti Aminah', lastMessage: 'Bisa dikirim hari ini?', updatedAt: new Date(Date.now() - 3600), unread: 0, status: 'negotiating' },
  { id: 'conv-3', channel: 'shopee', customerName: 'Toko Maju Jaya', lastMessage: 'Terima kasih, pesanan sudah saya terima', updatedAt: new Date(Date.now() - 86400), unread: 0, status: 'won' },
];

const mockChatHistory = {
  'conv-1': [
    { id: 'msg-1', text: 'Halo admin, saya mau tanya.', sender: 'customer', timestamp: new Date(Date.now() - 7200) },
    { id: 'msg-2', text: 'Halo Budi! Ada yang bisa Aksena bantu hari ini?', sender: 'ai', timestamp: new Date(Date.now() - 7100) },
    { id: 'msg-3', text: 'Apakah stok produk A masih ada?', sender: 'customer', timestamp: new Date() },
  ],
  'conv-2': [
    { id: 'msg-4', text: 'Kak barang ready?', sender: 'customer', timestamp: new Date(Date.now() - 4000) },
    { id: 'msg-5', text: 'Halo Kak Siti, barang ready stock ya. Mau pesan berapa pcs?', sender: 'ai', timestamp: new Date(Date.now() - 3900) },
    { id: 'msg-6', text: 'Bisa dikirim hari ini?', sender: 'customer', timestamp: new Date(Date.now() - 3600) },
  ]
};

export const messageService = {
  // 1. Dapatkan daftar percakapan aktif secara realtime
  subscribeToConversations: (userId, callback) => {
    if (!userId) return () => {};

    try {
      const q = query(
        getConversationsRef(),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const convs = [];
        snapshot.forEach(doc => {
          convs.push({ 
            id: doc.id, 
            ...doc.data(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          });
        });
        callback(convs);
      }, (error) => {
        console.warn("Gagal listen ke conversations Firestore. Menggunakan mock data.", error.message);
        callback(mockConversations);
      });

      return unsubscribe;
    } catch (error) {
      console.warn("Error membuat query conversations Firestore:", error.message);
      callback(mockConversations);
      return () => {};
    }
  },

  // 2. Dapatkan history pesan suatu percakapan secara realtime
  subscribeToMessages: (conversationId, callback) => {
    if (!conversationId) return () => {};

    try {
      const q = query(
        getMessagesRef(conversationId),
        orderBy('timestamp', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = [];
        snapshot.forEach(doc => {
          msgs.push({ 
            id: doc.id, 
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          });
        });

        if (msgs.length === 0 && mockChatHistory[conversationId]) {
          callback(mockChatHistory[conversationId]);
        } else {
          callback(msgs);
        }
      }, (error) => {
        console.warn("Gagal listen ke messages Firestore. Menggunakan mock data.", error.message);
        callback(mockChatHistory[conversationId] || []);
      });

      return unsubscribe;
    } catch (error) {
      console.warn("Error messages query:", error.message);
      callback(mockChatHistory[conversationId] || []);
      return () => {};
    }
  },

  // 3. Kirim pesan baru
  sendMessage: async (conversationId, text, sender = 'ai') => {
    try {
      // Tambah pesan
      await addDoc(getMessagesRef(conversationId), {
        text,
        sender, // 'customer', 'ai', atau 'agent'
        timestamp: serverTimestamp()
      });

      // Update waktu terakhir percakapan dan last message
      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, {
        lastMessage: text,
        updatedAt: serverTimestamp(),
        unread: sender === 'customer' ? 1 : 0 // Simulasi unread
      });

      return true;
    } catch (error) {
      console.warn("Gagal mengirim pesan (Firestore):", error.message);
      // Simulasikan success jika di mode mock
      if (mockChatHistory[conversationId]) {
        mockChatHistory[conversationId].push({
          id: 'mock-msg-' + Date.now(),
          text,
          sender,
          timestamp: new Date()
        });
      }
      return true;
    }
  },
  
  // 4. Update status percakapan (misal untuk Closer: negotiating -> closing -> won)
  updateConversationStatus: async (conversationId, status) => {
    try {
      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, { status });
      return true;
    } catch (error) {
      console.warn("Error updating status:", error.message);
      // Fallback update on mock array if error happens (UI only refresh)
      const conv = mockConversations.find(c => c.id === conversationId);
      if (conv) conv.status = status;
      return true;
    }
  },

  seedDemoData: async (userId) => {
    try {
      const existing = await getDocs(query(getConversationsRef(), where('userId', '==', userId)));
      if (!existing.empty) return;

      const demoConvs = [
        {
          userId, channel: 'whatsapp', customerName: 'Siti Rahayu',
          lastMessage: 'Kak, masih ada stok size M gak?', status: 'negotiating',
          unread: 2, updatedAt: serverTimestamp(), createdAt: serverTimestamp()
        },
        {
          userId, channel: 'instagram', customerName: 'Rizky Style',
          lastMessage: 'Harga bisa nego gak min?', status: 'new',
          unread: 1, updatedAt: serverTimestamp(), createdAt: serverTimestamp()
        }
      ];

      for (const convData of demoConvs) {
        const docRef = await addDoc(getConversationsRef(), convData);
        await addDoc(getMessagesRef(docRef.id), {
          text: convData.lastMessage, sender: 'customer', timestamp: serverTimestamp()
        });
      }
      return true;
    } catch (error) {
      console.warn('Error seeding demo conversations:', error.message);
    }
  }
};
