'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { localDB } from '@/lib/db';
import { parseFirebaseError } from '@/lib/errorMessages';
import { mockVerifyOTP, saveMockUser } from '@/lib/mockAuth';
import { User } from '@/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phone = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('pendingPhone') || '' : '';

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const timer = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInput = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (code: string) => {
    setLoading(true);
    setError('');

    try {
      if (USE_MOCK) {
        // --- Mock mode: xác thực không cần Firebase ---
        const { uid, phone } = await mockVerifyOTP(code);
        saveMockUser(uid, phone);

        // Lưu vào Dexie (local first)
        const existingUser = await localDB.users.get(uid);
        if (existingUser) {
          router.push('/camera');
        } else {
          sessionStorage.setItem('pendingUid', uid);
          router.push('/onboarding');
        }
        return;
      }

      // --- Production: Firebase confirmationResult ---
      if (!window.confirmationResult) { router.push('/phone'); return; }
      const result = await window.confirmationResult.confirm(code);
      const uid = result.user.uid;

      // Check if user has profile
      const userDoc = await getDoc(doc(firestore, 'users', uid));
      if (userDoc.exists()) {
        const userData = { ...userDoc.data(), uid } as User;
        await localDB.users.put(userData);
        router.push('/camera');
      } else {
        sessionStorage.setItem('pendingUid', uid);
        router.push('/onboarding');
      }
    } catch (err) {
      setError(parseFirebaseError(err));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col p-5 bg-background">
      <header className="pt-4 pb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-on-surface hover:opacity-70 transition-opacity"
          aria-label="Quay lại"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', letterSpacing: '0.1em' }}>QUAY LạI</span>
        </button>
      </header>

      <div className="flex-grow flex flex-col gap-8 max-w-sm mx-auto w-full mt-8">
        <div>
          <h2 style={{ fontFamily: "'Inter'", fontSize: '24px', fontWeight: 700 }}>Xác thực mã</h2>
          <p className="text-on-surface-variant mt-2" style={{ fontSize: '16px' }}>
            Chúng tôi đã gửi mã 6 số đến<br />
            <strong>{phone || '+84 xxx xxx xxx'}</strong>
          </p>
        </div>

        <div className="flex justify-between gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="vintage-input text-center"
              style={{
                width: '48px',
                height: '56px',
                fontFamily: "'Inter'",
                fontSize: '24px',
                fontWeight: 700,
                color: '#1d1c17',
              }}
              aria-label={`Số thứ ${i + 1}`}
            />
          ))}
        </div>

        {error && (
          <p style={{ color: '#b71032', fontSize: '14px', textAlign: 'center' }}>{error}</p>
        )}

        {loading && (
          <div className="flex justify-center">
            <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="text-center">
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', letterSpacing: '0.08em', color: '#444748' }}>
            Gửi lại mã{' '}
            {countdown > 0 ? (
              <span style={{ color: '#1d1c17', fontWeight: 700 }}>({countdown}s)</span>
            ) : (
              <button
                onClick={() => { setCountdown(60); router.push('/phone'); }}
                style={{ color: '#1d1c17', textDecoration: 'underline' }}
              >
                Gửi lại
              </button>
            )}
          </p>
        </div>

        <div className="mt-auto text-center pb-4">
          <span className="stamp-badge" style={{ color: '#b71032', borderColor: '#b71032' }}>MẬT LỆNH</span>
        </div>
      </div>
    </main>
  );
}
