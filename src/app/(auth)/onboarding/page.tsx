'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { localDB } from '@/lib/db';
import { compressImage } from '@/lib/imageCompressor';
import { uploadAvatarToCloudinary } from '@/lib/cloudinaryUpload';
import { saveMockUser } from '@/lib/mockAuth';
import { User } from '@/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 400);
    setAvatarBlob(compressed);
    const url = URL.createObjectURL(compressed);
    setAvatarPreview(url);
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Vui lòng nhập tên'); return; }
    const uid = sessionStorage.getItem('pendingUid') || auth.currentUser?.uid;
    if (!uid) { router.push('/phone'); return; }

    setLoading(true);
    setError('');

    try {
      let avatarUrl: string | undefined;
      if (avatarBlob) {
        avatarUrl = await uploadAvatarToCloudinary(avatarBlob, uid);
      }

      const phone = sessionStorage.getItem('pendingPhone') || '';
      const userData: User = {
        uid,
        phone,
        name: name.trim(),
        avatar: avatarUrl,
        bio: bio.trim() || undefined,
        followingCount: 0,
        followersCount: 0,
        createdAt: new Date(),
      };

      // Firestore doesn't support undefined values, so we filter them out
      const firestoreData = { ...userData, createdAt: serverTimestamp() };
      Object.keys(firestoreData).forEach(key => {
        if (firestoreData[key as keyof typeof firestoreData] === undefined) {
          delete firestoreData[key as keyof typeof firestoreData];
        }
      });

      // Write to Firestore (test mode rules allow this)
      await setDoc(doc(firestore, 'users', uid), firestoreData);

      // Save locally
      await localDB.users.put(userData);

      // Mock mode: persist user to localStorage so useAuth finds it
      if (USE_MOCK) saveMockUser(uid, phone);

      sessionStorage.removeItem('pendingUid');
      sessionStorage.removeItem('pendingPhone');
      router.push('/camera');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Xảy ra lỗi: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col p-5 bg-background">
      <header className="pt-4 pb-6">
        <div className="h-1 bg-surface-variant w-full rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: '33%' }} />
        </div>
      </header>

      <div className="flex-grow flex flex-col items-center gap-8 max-w-sm mx-auto w-full">
        {/* Avatar upload */}
        <div className="relative group cursor-pointer mt-4" onClick={() => fileRef.current?.click()}>
          <div
            className="w-32 h-32 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden"
            style={{ background: avatarPreview ? 'transparent' : '#f2ede5' }}
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-5xl text-outline">photo_camera</span>
            )}
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background px-2">
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.1em', fontWeight: 500 }}>
              THÊM ẢNH ĐẠI DIỆN
            </span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
        </div>

        {/* Name */}
        <div className="w-full space-y-2 mt-4">
          <label
            htmlFor="name-input"
            style={{ fontFamily: "'Inter'", fontSize: '24px', fontWeight: 700, display: 'block' }}
          >
            Bạn tên gì?
          </label>
          <input
            id="name-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nhập tên của bạn..."
            maxLength={50}
            className="w-full vintage-input pb-2"
            style={{ fontSize: '18px', lineHeight: 1.6, color: '#1d1c17' }}
          />
        </div>

        {/* Bio */}
        <div className="w-full space-y-2">
          <label
            htmlFor="bio-input"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', letterSpacing: '0.1em', fontWeight: 500, display: 'block', textTransform: 'uppercase', color: '#444748' }}
          >
            Giới thiệu (tuỳ chọn)
          </label>
          <textarea
            id="bio-input"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Viết vài dòng về bản thân..."
            maxLength={100}
            rows={3}
            className="w-full vintage-input pb-2 resize-none"
            style={{ fontSize: '16px', color: '#1d1c17' }}
          />
        </div>

        {error && (
          <p style={{ color: '#b71032', fontSize: '14px' }}>{error}</p>
        )}
      </div>

      <footer className="mt-auto pt-6 pb-4">
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || loading}
          className="w-full py-4 rounded-full flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            background: '#1d1c17',
            color: '#ffffff',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '14px',
            letterSpacing: '0.15em',
            fontWeight: 500,
            textTransform: 'uppercase',
            boxShadow: '0 4px 0 0 rgba(0,0,0,0.1)',
          }}
        >
          {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
          Bắt đầu
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </footer>
    </main>
  );
}
