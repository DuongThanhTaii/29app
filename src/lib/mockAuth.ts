/**
 * Mock Authentication for local development
 * Bypasses Firebase Phone Auth (no reCAPTCHA, no SMS needed)
 * Only active when NEXT_PUBLIC_USE_EMULATOR=true
 */

const MOCK_OTP = '123456';
const MOCK_SESSION_KEY = 'mock_auth_phone';

export function mockSendOTP(phone: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      sessionStorage.setItem(MOCK_SESSION_KEY, phone);
      // Show in console for dev
      console.log(
        `%c📱 MOCK OTP cho ${phone}: ${MOCK_OTP}`,
        'color: #cca730; font-size: 16px; font-weight: bold; background: #32302b; padding: 8px 16px;'
      );
      resolve();
    }, 800); // Simulate network delay
  });
}

export function mockVerifyOTP(otp: string): Promise<{ uid: string; phone: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const phone = sessionStorage.getItem(MOCK_SESSION_KEY);
      if (!phone) {
        reject(new Error('Phiên đã hết hạn'));
        return;
      }
      if (otp === MOCK_OTP) {
        const uid = 'mock_' + phone.replace(/\+/g, '').replace(/\s/g, '');
        resolve({ uid, phone });
      } else {
        reject(new Error('Mã OTP không đúng, thử: ' + MOCK_OTP));
      }
    }, 600);
  });
}

export function mockSignOut(): void {
  sessionStorage.removeItem(MOCK_SESSION_KEY);
  localStorage.removeItem('mock_user');
}

export function getMockUser(): { uid: string; phone: string } | null {
  const raw = localStorage.getItem('mock_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveMockUser(uid: string, phone: string): void {
  localStorage.setItem('mock_user', JSON.stringify({ uid, phone }));
}
