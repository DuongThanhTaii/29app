'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCamera } from '@/hooks/useCamera';
import { useCameraStore } from '@/stores/cameraStore';
import { useAuthStore } from '@/stores/authStore';
import { FILM_FILTERS, FILM_NAMES, FRAME_TYPES, INSTAX_COLORS } from '@/lib/filmFilters';
import { FilmType, FrameType } from '@/types';
import { DigitalIcon, FujiIcon, KodakIcon, LeicaIcon, PolaroidIcon } from '@/components/ui/CameraIcons';

export default function CameraPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { filmType, frameType, frameColor, setFilmType, setFrameType, setFrameColor, setCapture } = useCameraStore();
  const { videoRef, startCamera, flipCamera, capture, cameraError, toggleFlash, flashEnabled } = useCamera();
  const [step, setStep] = useState<'camera' | 'editor'>('camera');
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [captionColor, setCaptionColor] = useState('#1d1c17');

  useEffect(() => {
    if (!initialized) return;
    if (!user) { router.replace('/phone'); return; }
    startCamera();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, user]);

  const handleCapture = async () => {
    try {
      const { blob, url } = await capture(filmType, frameType);
      setCapture({ blob, url });
      setCapturedUrl(url);
      setStep('editor');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCapture({ blob: file, url });
    setCapturedUrl(url);
    setStep('editor');
  };

  const frameAspect = FRAME_TYPES[frameType].css;

  const renderCameraIcon = (type: FilmType) => {
    const props = { size: 32 };
    switch (type) {
      case 'original': return <DigitalIcon {...props} />;
      case 'kodak': return <KodakIcon {...props} />;
      case 'fuji': return <FujiIcon {...props} />;
      case 'polaroid': return <PolaroidIcon {...props} />;
      case 'ilford': return <LeicaIcon {...props} />;
      default: return null;
    }
  };

  const { createPost } = usePost();
  const [isPublishing, setIsPublishing] = useState(false);

  if (step === 'editor' && capturedUrl) {
    const handlePublish = async (target: 'wall' | 'map' | 'both') => {
      try {
        setIsPublishing(true);
        const { capturedImage } = useCameraStore.getState();
        if (!capturedImage) throw new Error('Không tìm thấy ảnh');
        
        await createPost({
          blob: capturedImage.blob,
          caption,
          captionColor,
          filmType,
          frameType,
          frameColor,
          target,
        });
        
        if (target === 'map') router.push('/map');
        else router.push('/feed');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setIsPublishing(false);
      }
    };

    return (
      <main className="min-h-screen pt-4 pb-4 px-5 flex flex-col gap-4 max-w-lg mx-auto bg-[#f5f0e8]">
        <header className="flex items-center justify-between border-b border-outline-variant pb-3">
          <button onClick={() => setStep('camera')} className="flex items-center gap-2 text-outline hover:text-primary">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.1em' }}>QUAY LẠI</span>
          </button>
          <h2 style={{ fontFamily: "'Inter'", fontSize: '20px', fontWeight: 700 }}>CHỈNH SỬA</h2>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#747878' }}>BƯỚC 2/2</span>
        </header>

        {/* Polaroid preview */}
        <div className="flex justify-center">
          <div
            className="relative transition-all"
            style={{
              backgroundColor: frameColor,
              padding: `${FRAME_TYPES[frameType].top}px ${FRAME_TYPES[frameType].sides}px ${FRAME_TYPES[frameType].bottom}px ${FRAME_TYPES[frameType].sides}px`,
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '2px',
              boxShadow: '4px 4px 10px rgba(0,0,0,0.15)',
              transform: 'scale(0.85)',
              transformOrigin: 'top center',
            }}
          >
            {/* Photo */}
            <div className={`w-[260px] ${frameAspect} overflow-hidden bg-black`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedUrl}
                alt="Ảnh đã chụp"
                className="w-full h-full object-cover"
                style={{ filter: FILM_FILTERS[filmType] }}
              />
            </div>
            {/* Caption input */}
            <div className="absolute left-0 w-full px-6 flex justify-center items-center" style={{ bottom: FRAME_TYPES[frameType].bottom / 2 - 15 }}>
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value.slice(0, 30))}
                placeholder="Viết ghi chú..."
                maxLength={30}
                className="w-full bg-transparent border-none outline-none text-center"
                style={{
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  fontSize: '18px',
                  fontStyle: 'italic',
                  color: captionColor,
                }}
              />
            </div>
          </div>
        </div>

        {/* Color picker */}
        <div className="flex items-center justify-between mt-[-30px]">
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.1em', color: '#444748' }}>MỰC VIẾT:</span>
          <div className="flex gap-3">
            {[['#1d1c17', 'Đen'], ['#ffffff', 'Trắng'], ['#b71032', 'Đỏ'], ['#cca730', 'Vàng']].map(([color, label]) => (
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
        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={() => handlePublish('wall')}
            disabled={isPublishing}
            className="w-full py-3 px-6 rounded-full border-2 border-primary text-primary flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.1em' }}
          >
            <span className="material-symbols-outlined text-[18px]">post_add</span>
            ĐĂNG LÊN TƯỜNG
          </button>
          <button
            onClick={() => handlePublish('map')}
            disabled={isPublishing}
            className="w-full py-3 px-6 rounded-full border-2 border-primary text-primary flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.1em' }}
          >
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            ĐĂNG LÊN BẢN ĐỒ
          </button>
          <button
            onClick={() => handlePublish('both')}
            disabled={isPublishing}
            className="w-full py-3 px-6 rounded-full bg-primary text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.1em',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
            }}
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            {isPublishing ? 'ĐANG ĐĂNG...' : 'CẢ HAI'}
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
          >
            <span className="material-symbols-outlined text-[20px]">{flashEnabled ? 'flash_on' : 'flash_off'}</span>
          </button>
          <button
            onClick={flipCamera}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <span className="material-symbols-outlined text-[20px]">flip_camera_ios</span>
          </button>
        </div>

        {/* Video */}
        <div className={`w-full ${frameAspect} relative bg-black overflow-hidden transition-all duration-300`}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: filmType !== 'original' ? FILM_FILTERS[filmType] : undefined }}
          />
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
        <div className="bg-inverse-surface p-4 flex flex-col gap-4">
          
          {/* Cameras (Film Simulations) */}
          <div className="flex overflow-x-auto gap-4 py-2 no-scrollbar items-center">
            {(Object.keys(FILM_NAMES) as FilmType[]).map(type => (
              <button
                key={type}
                onClick={() => setFilmType(type)}
                className={`flex flex-col items-center gap-2 flex-shrink-0 transition-opacity ${filmType === type ? 'opacity-100' : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-80'}`}
              >
                <div className="h-10 flex items-center justify-center">
                  {renderCameraIcon(type)}
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.05em', color: '#fff' }}>
                  {FILM_NAMES[type]}
                </span>
              </button>
            ))}
          </div>

          <div className="w-full h-px bg-white/10 my-1"></div>

          {/* Frames & Colors */}
          <div className="flex flex-col gap-3">
            <div className="flex overflow-x-auto gap-3 py-1 no-scrollbar">
              {(Object.keys(FRAME_TYPES) as FrameType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setFrameType(type)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] transition-all flex-shrink-0"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '0.05em',
                    border: frameType === type ? '1px solid transparent' : '1px solid #555',
                    background: frameType === type ? '#fff' : 'transparent',
                    color: frameType === type ? '#000' : '#888',
                  }}
                >
                  {FRAME_TYPES[type].label}
                </button>
              ))}
            </div>
            <div className="flex gap-3 overflow-x-auto py-1 no-scrollbar items-center justify-start">
              <span className="text-xs text-gray-500 mr-1" style={{ fontFamily: "'JetBrains Mono'" }}>MÀU VIỀN:</span>
              {INSTAX_COLORS.map(color => (
                <button
                  key={color.value}
                  onClick={() => setFrameColor(color.value)}
                  className="w-7 h-7 rounded-full flex-shrink-0 border transition-transform"
                  style={{ 
                    backgroundColor: color.value,
                    borderColor: frameColor === color.value ? '#fff' : 'transparent',
                    transform: frameColor === color.value ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: frameColor === color.value ? '0 0 0 1px #fff' : 'none'
                  }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Shutter row */}
          <div className="flex items-center justify-between mt-4">
            <label className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-800 transition-colors">
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
