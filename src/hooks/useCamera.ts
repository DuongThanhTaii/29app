'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { FILM_FILTERS } from '@/lib/filmFilters';
import { FilmType } from '@/types';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const startCamera = useCallback(async (facing: 'user' | 'environment' = facingMode) => {
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setIsReady(true);
      }
      setCameraError(null);
    } catch (err) {
      const msg = (err as Error).name === 'NotAllowedError'
        ? 'Bạn cần cấp quyền truy cập camera'
        : 'Không thể khởi động camera';
      setCameraError(msg);
      setIsReady(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  }, []);

  const flipCamera = useCallback(async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    await startCamera(next);
  }, [facingMode, startCamera]);

  const capture = useCallback((filmType: FilmType, frameType: 'instax-mini' | 'instax-square' | 'instax-wide' | 'polaroid-600'): Promise<{ blob: Blob; url: string }> => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      if (!video) return reject(new Error('Camera chưa sẵn sàng'));

      const canvas = document.createElement('canvas');
      const ratioMap = { 'instax-mini': 3/4, 'instax-square': 1, 'instax-wide': 4/3, 'polaroid-600': 1 };
      const ratio = ratioMap[frameType];
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;

      // Crop to target ratio
      let sx = 0, sy = 0, sw = vw, sh = vh;
      const targetRatio = ratio;
      const currentRatio = vw / vh;

      if (currentRatio > targetRatio) {
        sw = Math.round(vh * targetRatio);
        sx = Math.round((vw - sw) / 2);
      } else {
        sh = Math.round(vw / targetRatio);
        sy = Math.round((vh - sh) / 2);
      }

      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d')!;
      ctx.filter = FILM_FILTERS[filmType];
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
      ctx.filter = 'none';

      const url = canvas.toDataURL('image/webp', 0.9);
      canvas.toBlob((blob) => {
        if (blob) resolve({ blob, url });
        else reject(new Error('Không thể chụp ảnh'));
      }, 'image/webp', 0.9);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    videoRef,
    startCamera,
    stopCamera,
    flipCamera,
    capture,
    flashEnabled,
    toggleFlash: () => setFlashEnabled(v => !v),
    cameraError,
    isReady,
  };
}
