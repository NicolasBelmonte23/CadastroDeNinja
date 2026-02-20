import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { OWNER_PHONE_E164 } from '../config/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Firebase Auth user
  const [profile, setProfile] = useState(null); // Firestore user doc
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadOrCreateProfile(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function loadOrCreateProfile(firebaseUser) {
    try {
      const ref = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() });
      } else {
        // First login — create profile
        const isOwner = firebaseUser.phoneNumber === OWNER_PHONE_E164;
        const newProfile = {
          name: '',
          phoneE164: firebaseUser.phoneNumber || '',
          address: {
            street: '',
            number: '',
            neighborhood: '',
            complement: '',
            city: '',
          },
          blocked: false,
          role: isOwner ? 'OWNER' : 'USER',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(ref, newProfile);
        setProfile({ id: firebaseUser.uid, ...newProfile });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  }

  async function refreshProfile() {
    if (!user) return;
    try {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() });
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  }

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'OWNER';
  const isOwner = profile?.role === 'OWNER';
  const isBlocked = profile?.blocked === true;
  const isProfileComplete =
    profile?.name &&
    profile?.address?.street &&
    profile?.address?.number &&
    profile?.address?.neighborhood &&
    profile?.address?.city;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isOwner,
        isBlocked,
        isProfileComplete,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
