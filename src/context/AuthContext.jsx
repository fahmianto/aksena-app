import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile } from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profilePromise = getUserProfile(user.uid);
          // Kurangi timeout ke 0.3 detik (300ms) agar terasa SUPER INSTANT buat testing sebelum DB nyala
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase Timeout')), 300));
          const profile = await Promise.race([profilePromise, timeoutPromise]);
          setUserProfile(profile);
        } catch (err) {
          console.warn("Gagal memuat profil dari server (Latency):", err.message);
          setUserProfile({ role: 'owner', name: user.email?.split('@')[0] }); // Fallback aman
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = { currentUser, userProfile, loading };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080c14', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(0,212,255,0.2)', borderTopColor: '#00d4ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#8892b0', fontSize: '14px', fontFamily: 'system-ui' }}>Inisialisasi Aksena Intelligence...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
