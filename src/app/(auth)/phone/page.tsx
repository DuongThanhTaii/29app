'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { parseFirebaseError } from '@/lib/errorMessages';
import { mockSendOTP } from '@/lib/mockAuth';

declare global {
  interface Window {
    confirmationResult: import('firebase/auth').ConfirmationResult;
    recaptchaVerifier: RecaptchaVerifier;
  }
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';

export default function PhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaReady, setRecaptchaReady] = useState(USE_MOCK);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const isValid = cleanPhone.length >= 9 && cleanPhone.length <= 11;
  const formatted = '+84' + (cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone);

  const initRecaptcha = useCallback(() => {
    if (USE_MOCK || initializedRef.current || !recaptchaRef.current) return;
    try {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch { /* ignore */ }
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: 'normal',
        callback: () => { setRecaptchaReady(true); setError(''); },
        'expired-callback': () => setRecaptchaReady(false),
      });
      window.recaptchaVerifier.render().catch(console.error);
      initializedRef.current = true;
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    const t = setTimeout(initRecaptcha, 300);
    return () => { clearTimeout(t); initializedRef.current = false; };
  }, [initRecaptcha]);

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError('');

    try {
      if (USE_MOCK) {
        // --- Mock mode: không cần Firebase, không cần SMS ---
        await mockSendOTP(formatted);
        sessionStorage.setItem('pendingPhone', formatted);
        router.push('/otp');
        return;
      }

      // --- Production: Firebase Phone Auth ---
      const confirmationResult = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      sessionStorage.setItem('pendingPhone', formatted);
      router.push('/otp');
    } catch (err) {
      if (USE_MOCK) {
        setError('Lỗi mock auth: ' + String(err));
      } else {
        setError(parseFirebaseError(err));
        setRecaptchaReady(false);
        initializedRef.current = false;
        try { window.recaptchaVerifier?.clear(); } catch { /* ignore */ }
        setTimeout(initRecaptcha, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col p-5" style={{ background: '#32302b', color: '#f5f0e8' }}>
      {/* Dev banner */}
      {USE_MOCK && (
        <div className="fixed top-0 left-0 right-0 z-50 text-center py-1.5"
          style={{ background: '#735c00', fontSize: '11px', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.08em' }}>
          🔧 DEV MODE — số bất kỳ • mã OTP: <strong>123456</strong>
        </div>
      )}

      <header className="flex justify-center pt-16 pb-8">
        <h1 style={{
          fontFamily: "'Inter',sans-serif",
          fontSize: 'clamp(36px,10vw,56px)',
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          Polaroid<br />Cách Mạng
        </h1>
      </header>

      <div className="flex-grow flex flex-col justify-center gap-8 max-w-sm mx-auto w-full">
        <p style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: '12px',
          letterSpacing: '0.12em',
          fontWeight: 500,
          textTransform: 'uppercase',
          opacity: 0.6,
          textAlign: 'center',
        }}>
          NHẬP SỐ ĐIỆN THOẠI
        </p>

        <div className="flex items-end gap-3 pb-2" style={{ borderBottom: '1.5px solid rgba(200,198,197,0.4)' }}>
          <span style={{ fontSize: '26px', fontWeight: 700, fontFamily: "'Inter'" }}>+84</span>
          <span style={{ fontSize: '26px', color: '#747878', paddingBottom: '2px' }}>|</span>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="9xx xxx xxxx"
            autoFocus
            className="flex-1 bg-transparent border-none outline-none"
            style={{ fontSize: '26px', fontWeight: 700, fontFamily: "'Inter'", color: '#f5f0e8' }}
            inputMode="numeric"
            maxLength={11}
          />
        </div>

        {/* reCAPTCHA — chỉ hiện khi production */}
        <div
          ref={recaptchaRef}
          id="recaptcha-container"
          className="flex justify-center"
          style={{ display: USE_MOCK ? 'none' : 'flex', minHeight: USE_MOCK ? 0 : 78 }}
        />

        {error && (
          <p style={{ color: '#da3148', fontSize: '14px', textAlign: 'center', fontFamily: "'Be Vietnam Pro',sans-serif" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isValid || !recaptchaReady || loading}
          className="w-full py-4 rounded-full flex items-center justify-center gap-2 transition-opacity"
          style={{
            background: '#f5f0e8',
            color: '#32302b',
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: '14px',
            letterSpacing: '0.15em',
            fontWeight: 600,
            opacity: (!isValid || !recaptchaReady || loading) ? 0.4 : 1,
          }}
        >
          {loading && (
            <span className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{ borderColor: '#32302b', borderTopColor: 'transparent' }} />
          )}
          {!USE_MOCK && !recaptchaReady ? 'XÁC NHẬN reCAPTCHA ↑' : 'TIẾP TỤC →'}
        </button>
      </div>

      <footer className="mt-auto text-center pb-6 pt-4">
        <p style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: '10px',
          letterSpacing: '0.08em',
          opacity: 0.4,
          lineHeight: 1.7,
        }}>
          BẰNG CÁCH TIẾP TỤC, BẠN ĐỒNG Ý VỚI<br />
          ĐIỀU KHOẢN DỊCH VỤ VÀ CHÍNH SÁCH BẢO MẬT.
        </p>
      </footer>
    </main>
  );
}
