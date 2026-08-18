'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function HomePage() {
  const router = useRouter();
  const { user, loading, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized || loading) return;
    if (user) {
      router.replace('/camera');
    } else {
      router.replace('/phone');
    }
  }, [user, loading, initialized, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#32302b' }}
    >
      <div className="flex flex-col items-center gap-4">
        <h1
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '36px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: '#f5f0e8',
            lineHeight: 1.1,
            textAlign: 'center',
          }}
        >
          Polaroid<br />Cách Mạng
        </h1>
        <span
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#f5f0e8', borderTopColor: 'transparent' }}
        />
      </div>
    </div>
  );
}
