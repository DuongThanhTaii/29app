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
  const [requiresPhoneLinking, setRequiresPhoneLinking] = useState(false);
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

  const handleGoogleLogin = async () => {
    try {
      if (USE_MOCK) {
        alert("Chế độ Google Login không khả dụng khi đang ở MOCK (Local Dev). Hãy build hoặc dùng tài khoản test.");
        return;
      }
      
      const { signInWithPopup } = await import('firebase/auth');
      const { googleProvider } = await import('@/lib/firebase');
      
      const result = await signInWithPopup(auth, googleProvider);
      
      // Nếu đã có số điện thoại -> qua luôn
      if (result.user.phoneNumber) {
        router.push('/camera');
      } else {
        // Nếu chưa có, chuyển UI sang bắt nhập số điện thoại để link
        setRequiresPhoneLinking(true);
      }
    } catch (err) {
      setError(parseFirebaseError(err));
    }
  };

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError('');

    try {
      if (USE_MOCK) {
        // --- Mock mode ---
        await mockSendOTP(formatted);
        sessionStorage.setItem('pendingPhone', formatted);
        router.push('/otp');
        return;
      }

      // --- Production: Firebase Phone Auth ---
      if (requiresPhoneLinking && auth.currentUser) {
        const { linkWithPhoneNumber } = await import('firebase/auth');
        window.confirmationResult = await linkWithPhoneNumber(auth.currentUser, formatted, window.recaptchaVerifier);
      } else {
        window.confirmationResult = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier);
      }
      
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
        {requiresPhoneLinking ? (
          <p style={{
            fontFamily: "'Be Vietnam Pro',sans-serif",
            fontSize: '14px',
            opacity: 0.8,
            textAlign: 'center',
            lineHeight: 1.5,
          }}>
            Tài khoản Google của bạn chưa có số điện thoại.<br/>
            Vui lòng xác minh để tiếp tục.
          </p>
        ) : (
          <>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full rounded-full py-4 flex items-center justify-center gap-3 transition-opacity disabled:opacity-50"
              style={{
                background: '#f5f0e8',
                color: '#1d1c17',
                fontSize: '16px',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Tiếp tục bằng Google
            </button>
            <div className="flex items-center gap-4 opacity-50">
              <div className="flex-1 h-px bg-current"></div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', letterSpacing: '0.12em' }}>HOẶC SĐT</span>
              <div className="flex-1 h-px bg-current"></div>
            </div>
          </>
        )}

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
