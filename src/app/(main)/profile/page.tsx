'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized) return;
    if (user) {
      router.replace(`/profile/${user.uid}`);
    } else {
      router.replace('/phone');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
