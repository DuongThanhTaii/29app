'use client';

import { useAuth } from '@/hooks/useAuth';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // Calling this here ensures the onAuthStateChanged listener 
  // is mounted at the root of the app and persists across route changes.
  useAuth();

  return <>{children}</>;
}
