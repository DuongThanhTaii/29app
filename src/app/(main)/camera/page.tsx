'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCamera } from '@/hooks/useCamera';
import { useCameraStore } from '@/stores/cameraStore';
import { useAuthStore } from '@/stores/authStore';
import { FILM_FILTERS, FILM_NAMES } from '@/lib/filmFilters';
import { FilmType, FrameRatio } from '@/types';

export default function CameraPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { filmType, frameRatio, setFilmType, setFrameRatio, setCapture } = useCameraStore();
  const { videoRef, startCamera, flipCamera, capture, cameraError, toggleFlash, flashEnabled } = useCamera();
  const [step, setStep] = useState<'camera' | 'editor'>('camera');
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [captionColor, setCaptionColor] = useState('#1d1c17');

  useEffect(() => {
    if (!initialized) return; // Wait for auth to finish loading
    if (!user) { router.replace('/phone'); return; }
    startCamera();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, user]);

  const handleCapture = async () => {
    try {
      const { blob, dataUrl } = await capture(filmType, frameRatio);
      setCapture(blob, dataUrl);
      setCapturedUrl(dataUrl);
      setStep('editor');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCapture(file, url);
    setCapturedUrl(url);
    setStep('editor');
  };

  const frameAspect = frameRatio === '3:4' ? 'aspect-[3/4]' : frameRatio === '1:1' ? 'aspect-square' : 'aspect-video';

  if (step === 'editor' && capturedUrl) {
    return (
      <main className="min-h-screen pt-4 pb-4 px-5 flex flex-col gap-4 max-w-lg mx-auto">
        <header className="flex items-center justify-between border-b border-outline-variant pb-3">
          <button onClick={() => setStep('camera')} className="flex items-center gap-2 text-outline hover:text-primary">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.1em' }}>QUAY LạI</span>
          </button>
          <h2 style={{ fontFamily: "'Inter'", fontSize: '20px', fontWeight: 700 }}>CHỈNH SỮA</h2>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#747878' }}>BƯỚC 2/2</span>
        </header>

        {/* Polaroid preview */}
        <div className="flex justify-center">
          <div
            className="bg-white relative"
            style={{
              padding: '12px 12px 48px 12px',
              border: '1px solid #e0d5c5',
              borderRadius: '2px',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
              transform: 'rotate(-1deg)',
              maxWidth: '280px',
              width: '100%',
            }}
          >
            {/* Film badge */}
            <div
              className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.08em', color: '#fff' }}
            >
              {FILM_NAMES[filmType].toUpperCase()}
            </div>
            {/* Photo */}
            <div className={`w-full ${frameAspect} overflow-hidden bg-surface-container-high`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedUrl}
                alt="Ảnh đã chụp"
                className="w-full h-full object-cover"
                style={{ filter: FILM_FILTERS[filmType] }}
              />
            </div>
            {/* Caption input */}
            <div className="mt-3 px-1">
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value.slice(0, 30))}
                placeholder="Viết ghi chú..."
                maxLength={30}
                className="w-full bg-transparent border-none outline-none"
                style={{
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  fontSize: '16px',
                  fontStyle: 'italic',
                  color: captionColor,
                  borderBottom: `1px solid ${captionColor}30`,
                  paddingBottom: '4px',
                }}
              />
            </div>
          </div>
        </div>

        {/* Color picker */}
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.1em', color: '#444748' }}>MỰC VIẾT:</span>
          <div className="flex gap-3">
            {[['#1d1c17', 'Den'], ['#ffffff', 'Trang'], ['#b71032', 'Do'], ['#cca730', 'Vang']].map(([color, label]) => (
              <button
                key={color}
                onClick={() => setCaptionColor(color)}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: color,
                  borderColor: captionColor === color ? '#1d1c17' : '#e0d5c5',
                  boxShadow: captionColor === color ? '0 0 0 2px #f5f0e8, 0 0 0 3px #1d1c17' : 'none',
                }}
                aria-label={label}
              />
            ))}
          </div>
        </div>

        {/* Publish buttons */}
        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={() => router.push('/feed')}
            className="w-full py-3 px-6 rounded-full border-2 border-primary text-primary flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.1em' }}
          >
            <span className="material-symbols-outlined text-[18px]">post_add</span>
            ĐĂNG LÊN TƯờNG
          </button>
          <button
            onClick={() => router.push('/map')}
            className="w-full py-3 px-6 rounded-full border-2 border-primary text-primary flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.1em' }}
          >
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            ĐĂNG LÊN BẢN ĐỔ
          </button>
          <button
            className="w-full py-3 px-6 rounded-full bg-primary text-white flex items-center justify-center gap-2"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.1em',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
            }}
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            CẢ HAI
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-4 pb-4 px-5 flex flex-col gap-4 max-w-lg mx-auto">
      <header className="flex items-center justify-between border-b border-outline-variant pb-3">
        <h1 style={{ fontFamily: "'Inter'", fontSize: '20px', fontWeight: 700 }}>ỐNG KÍNH</h1>
        <span className="stamp-badge" style={{ color: '#b71032', borderColor: '#b71032' }}>TRỰC TIẾP</span>
      </header>

      {/* Viewfinder */}
      <div className="bg-inverse-surface rounded-lg overflow-hidden relative" style={{ position: 'relative' }}>
        {/* Top controls */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-center z-20">
          <button
            onClick={toggleFlash}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}
            aria-label={flashEnabled ? 'Tắt flash' : 'Bật flash'}
          >
            <span className="material-symbols-outlined text-[20px]">{flashEnabled ? 'flash_on' : 'flash_off'}</span>
          </button>
          <button
            onClick={flipCamera}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}
            aria-label="Đảo camera"
          >
            <span className="material-symbols-outlined text-[20px]">flip_camera_ios</span>
          </button>
        </div>

        {/* Video */}
        <div className={`w-full ${frameAspect} relative bg-black overflow-hidden`}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: filmType !== 'original' ? FILM_FILTERS[filmType] : undefined }}
          />
          {/* Rule of thirds */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-white/50" />
            ))}
          </div>
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <p className="text-white text-center px-4" style={{ fontSize: '14px' }}>{cameraError}</p>
            </div>
          )}
        </div>

        {/* Controls bar */}
        <div className="bg-inverse-surface p-4 flex flex-col gap-3">
          {/* Ratio */}
          <div className="flex justify-center gap-6" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', letterSpacing: '0.1em' }}>
            {(['3:4', '1:1', '16:9'] as FrameRatio[]).map(r => (
              <button
                key={r}
                onClick={() => setFrameRatio(r)}
                className={`pb-1 ${frameRatio === r ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'} transition-colors`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Film badges */}
          <div className="flex overflow-x-auto gap-3 py-1 no-scrollbar">
            {(Object.keys(FILM_NAMES) as FilmType[]).map(type => (
              <button
                key={type}
                onClick={() => setFilmType(type)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] transition-all flex-shrink-0"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.08em',
                  border: filmType === type ? '1px solid transparent' : '1px solid #555',
                  background: filmType === type ? '#1d1c17' : 'transparent',
                  color: filmType === type ? '#fff' : '#888',
                }}
              >
                {FILM_NAMES[type]}
              </button>
            ))}
          </div>

          {/* Shutter row */}
          <div className="flex items-center justify-between mt-1">
            <label className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center overflow-hidden cursor-pointer">
              <span className="material-symbols-outlined text-gray-400">photo_library</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleGallery} />
            </label>

            <button
              onClick={handleCapture}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Chụp ảnh"
            >
              <div className="w-full h-full rounded-full m-1" style={{ background: '#b71032' }} />
            </button>

            <div className="w-12 h-12" />
          </div>
        </div>
      </div>
    </main>
  );
}
