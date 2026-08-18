'use client';
import { useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { localDB } from '@/lib/db';
import { useAuthStore } from '@/stores/authStore';
import { getMockUser, mockSignOut } from '@/lib/mockAuth';
import { User } from '@/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';

export function useAuth() {
  const { user, loading, error, initialized, setUser, setLoading, setError, setInitialized, clearAuth } = useAuthStore();

  useEffect(() => {
    // ---- Mock mode: dùng localStorage user thay Firebase auth ----
    if (USE_MOCK) {
      const tryLoadMockUser = async () => {
        const mockUser = getMockUser();
        if (mockUser) {
          // Tìm trong IndexedDB trước
          const cached = await localDB.users.get(mockUser.uid);
          if (cached) {
            setUser(cached);
          } else {
            // Thử Firestore
            try {
              const userDoc = await getDoc(doc(firestore, 'users', mockUser.uid));
              if (userDoc.exists()) {
                const userData = { ...userDoc.data(), uid: mockUser.uid } as User;
                setUser(userData);
                await localDB.users.put(userData);
              } else {
                // Chưa có profile → để null, sẽ redirect onboarding
                setUser(null);
              }
            } catch {
              setUser(null);
            }
          }
        } else {
          clearAuth();
        }
        setLoading(false);
        setInitialized(true);
      };
      tryLoadMockUser();
      return;
    }

    // ---- Production: Firebase onAuthStateChanged ----
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const cachedUser = await localDB.users.get(firebaseUser.uid);
          if (cachedUser) setUser(cachedUser);

          const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = { ...userDoc.data(), uid: firebaseUser.uid } as User;
            setUser(userData);
            await localDB.users.put(userData);
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error('Auth sync error:', err);
        }
      } else {
        clearAuth();
      }
      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    if (USE_MOCK) {
      mockSignOut();
      await localDB.users.clear();
      clearAuth();
      return;
    }
    try {
      await signOut(auth);
      await localDB.users.clear();
      clearAuth();
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, [clearAuth]);

  return { user, loading, error, initialized, logout, setError };
}
