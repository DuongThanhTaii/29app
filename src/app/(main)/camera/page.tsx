'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCamera } from '@/hooks/useCamera';
import { useCameraStore } from '@/stores/cameraStore';
import { useAuthStore } from '@/stores/authStore';
import { usePost } from '@/hooks/usePost';
import { FILM_FILTERS, FILM_NAMES, FRAME_TYPES, INSTAX_COLORS } from '@/lib/filmFilters';
import { FilmType, FrameType } from '@/types';
import { DigitalIcon, FujiIcon, KodakIcon, LeicaIcon, PolaroidIcon } from '@/components/ui/CameraIcons';
import { InstaxMiniIcon, InstaxSquareIcon, InstaxWideIcon, Polaroid600Icon } from '@/components/ui/FrameIcons';

export default function CameraPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { filmType, frameType, frameColor, setFilmType, setFrameType, setFrameColor, setCapture } = useCameraStore();
  const { videoRef, startCamera, flipCamera, capture, cameraError, toggleFlash, flashEnabled } = useCamera();
  
  const [step, setStep] = useState<'camera' | 'editor'>('camera');
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [captionColor, setCaptionColor] = useState('#1d1c17');

  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [showFrameMenu, setShowFrameMenu] = useState(false);
  const { createPost } = usePost();
  const [isPublishing, setIsPublishing] = useState(false);

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

  const renderFrameIcon = (type: FrameType, active = false) => {
    const props = { size: 24, active };
    switch (type) {
      case 'instax-mini': return <InstaxMiniIcon {...props} />;
      case 'instax-square': return <InstaxSquareIcon {...props} />;
      case 'instax-wide': return <InstaxWideIcon {...props} />;
      case 'polaroid-600': return <Polaroid600Icon {...props} />;
      default: return null;
    }
  };

  if (step === 'editor' && capturedUrl) {
    return (
      <main className="h-[calc(100vh-80px)] flex flex-col bg-[#f5f0e8] overflow-hidden">
        <header className="h-[60px] shrink-0 flex items-center justify-between px-5 border-b border-outline-variant">
          <button onClick={() => setStep('camera')} className="flex items-center gap-2 text-outline hover:text-primary">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.1em' }}>QUAY LẠI</span>
          </button>
          <h2 style={{ fontFamily: "'Inter'", fontSize: '20px', fontWeight: 700 }}>CHỈNH SỬA</h2>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#747878' }}>BƯỚC 2/2</span>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div
            className="relative transition-all"
            style={{
              backgroundColor: frameColor,
              padding: `${FRAME_TYPES[frameType].top}px ${FRAME_TYPES[frameType].sides}px ${FRAME_TYPES[frameType].bottom}px ${FRAME_TYPES[frameType].sides}px`,
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '2px',
              boxShadow: '4px 4px 10px rgba(0,0,0,0.15)',
              transform: 'scale(0.85)',
              transformOrigin: 'center',
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
          
          {/* Color picker */}
          <div className="flex items-center gap-4 mt-6">
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
        </div>

        {/* Publish buttons */}
        <div className="shrink-0 p-5 flex flex-col gap-3 bg-white border-t border-outline-variant rounded-t-3xl">
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
    <main className="h-[calc(100vh-80px)] flex flex-col bg-[#0a0a0a] overflow-hidden relative">
      {/* Header */}
      <header className="h-[60px] shrink-0 flex items-center justify-between px-5 bg-[#f5f0e8] z-10 rounded-b-xl border-b border-outline-variant shadow-sm">
        <h1 style={{ fontFamily: "'Inter'", fontSize: '20px', fontWeight: 700, color: '#111' }}>ỐNG KÍNH</h1>
        <span className="stamp-badge" style={{ color: '#b71032', borderColor: '#b71032' }}>TRỰC TIẾP</span>
      </header>

      {/* Viewfinder Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[#111]">
        {/* Background texture/overlay could go here if requested, currently using dark #111 */}
        
        {/* Top controls (Flash, Flip) overlaid on viewfinder area */}
        <div className="absolute top-4 w-full px-4 flex justify-between items-center z-20">
          <button
            onClick={toggleFlash}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white backdrop-blur-md"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <span className="material-symbols-outlined text-[20px]">{flashEnabled ? 'flash_on' : 'flash_off'}</span>
          </button>
          <button
            onClick={flipCamera}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white backdrop-blur-md"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <span className="material-symbols-outlined text-[20px]">flip_camera_ios</span>
          </button>
        </div>

        {/* Live Polaroid Preview */}
        <div 
          className="relative shadow-2xl transition-all duration-300 flex-shrink-0"
          style={{
            backgroundColor: frameColor,
            padding: `${FRAME_TYPES[frameType].top * 0.7}px ${FRAME_TYPES[frameType].sides * 0.7}px ${FRAME_TYPES[frameType].bottom * 0.7}px ${FRAME_TYPES[frameType].sides * 0.7}px`,
            borderRadius: '2px',
            transform: 'scale(1)',
          }}
        >
          <div className={`w-[200px] ${frameAspect} relative bg-black overflow-hidden transition-all duration-300`}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: filmType !== 'original' ? FILM_FILTERS[filmType] : undefined }}
            />
            {/* Grid overlay */}
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
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="h-[120px] shrink-0 bg-[#f5f0e8] rounded-t-xl border-t border-outline-variant flex items-center justify-between px-8 relative z-30">
        
        {/* Gallery */}
        <label className="w-12 h-12 rounded-full border-2 border-outline flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-transform bg-white shadow-sm">
          <span className="material-symbols-outlined text-outline">photo_library</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleGallery} />
        </label>

        {/* Camera (Filter) Selector Button */}
        <button 
          onClick={() => { setShowCameraMenu(!showCameraMenu); setShowFrameMenu(false); }}
          className="w-14 h-14 rounded-full border-2 border-outline bg-white flex items-center justify-center active:scale-95 transition-transform shadow-sm relative"
        >
          {renderCameraIcon(filmType)}
          {showCameraMenu && <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />}
        </button>

        {/* Shutter */}
        <button
          onClick={handleCapture}
          className="w-[72px] h-[72px] rounded-full border-[4px] border-white flex items-center justify-center active:scale-95 transition-transform shadow-lg"
          aria-label="Chụp ảnh"
          style={{ background: '#b71032' }}
        >
          <div className="w-[85%] h-[85%] rounded-full border-2 border-white/30" />
        </button>

        {/* Frame Selector Button */}
        <button 
          onClick={() => { setShowFrameMenu(!showFrameMenu); setShowCameraMenu(false); }}
          className="w-14 h-14 rounded-full border-2 border-outline bg-white flex items-center justify-center active:scale-95 transition-transform shadow-sm relative"
        >
          {renderFrameIcon(frameType, true)}
          {showFrameMenu && <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />}
        </button>

      </div>

      {/* Camera Popover Menu */}
      <div className={`absolute bottom-[120px] left-0 right-0 bg-[#f5f0e8] border-t border-outline-variant p-4 transition-transform duration-300 z-20 rounded-t-xl shadow-[0_-10px_20px_rgba(0,0,0,0.1)] ${showCameraMenu ? 'translate-y-0' : 'translate-y-full'}`}>
        <p style={{ fontFamily: "'JetBrains Mono'", fontSize: '10px', color: '#747878', marginBottom: '12px' }}>CHỌN MÁY ẢNH</p>
        <div className="flex overflow-x-auto gap-6 pb-2 no-scrollbar items-center">
          {(Object.keys(FILM_NAMES) as FilmType[]).map(type => (
            <button
              key={type}
              onClick={() => { setFilmType(type); setShowCameraMenu(false); }}
              className={`flex flex-col items-center gap-2 flex-shrink-0 transition-opacity ${filmType === type ? 'opacity-100 scale-110' : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-80'}`}
            >
              <div className="h-10 flex items-center justify-center">
                {renderCameraIcon(type)}
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.05em', color: '#111' }}>
                {FILM_NAMES[type]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Frame Popover Menu */}
      <div className={`absolute bottom-[120px] left-0 right-0 bg-[#f5f0e8] border-t border-outline-variant p-4 transition-transform duration-300 z-20 rounded-t-xl shadow-[0_-10px_20px_rgba(0,0,0,0.1)] ${showFrameMenu ? 'translate-y-0' : 'translate-y-full'}`}>
        <p style={{ fontFamily: "'JetBrains Mono'", fontSize: '10px', color: '#747878', marginBottom: '12px' }}>CHỌN LOẠI GIẤY & MÀU VIỀN</p>
        
        {/* Frames */}
        <div className="flex overflow-x-auto gap-8 pb-4 mb-2 border-b border-outline-variant/30 no-scrollbar items-center">
          {(Object.keys(FRAME_TYPES) as FrameType[]).map(type => (
            <button
              key={type}
              onClick={() => setFrameType(type)}
              className={`flex flex-col items-center gap-2 flex-shrink-0 transition-opacity ${frameType === type ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-80'}`}
            >
              <div className="h-10 flex items-center justify-center">
                {renderFrameIcon(type)}
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.05em', color: '#111' }}>
                {FRAME_TYPES[type].label}
              </span>
            </button>
          ))}
        </div>

        {/* Colors */}
        <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar items-center justify-start">
          {INSTAX_COLORS.map(color => (
            <button
              key={color.value}
              onClick={() => setFrameColor(color.value)}
              className="w-8 h-8 rounded-full flex-shrink-0 border-2 transition-transform"
              style={{ 
                backgroundColor: color.value,
                borderColor: frameColor === color.value ? '#111' : 'transparent',
                transform: frameColor === color.value ? 'scale(1.15)' : 'scale(1)',
                boxShadow: frameColor === color.value ? '0 0 0 2px #fff inset' : 'none'
              }}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Overlay to close menus */}
      {(showCameraMenu || showFrameMenu) && (
        <div 
          className="absolute inset-0 z-10" 
          onClick={() => { setShowCameraMenu(false); setShowFrameMenu(false); }}
        />
      )}

    </main>
  );
}
